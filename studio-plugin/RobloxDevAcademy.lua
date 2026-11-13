--[[
	Roblox Dev Academy — Studio companion plugin
	Installed by the Roblox Dev Academy desktop app into %LOCALAPPDATA%\Roblox\Plugins.

	What it does
	  * shows the exercise you opened in the Academy, with steps
	  * on your click: creates an EMPTY practice script (comments only) at the right place — never overwrites
	  * on your click: reads facts from your place (does TrainingPart exist, is it anchored, your script source)
	    and sends them to the Academy, which checks your work and shows feedback here
	  * offers script updates from the Academy; you choose apply/decline; refuses if Studio changed meanwhile
	  * forwards error messages from the Output during Play, so the Academy can explain them in Dutch

	What it never does
	  * talk to anything other than 127.0.0.1 (your own computer)
	  * run code it receives, write files, or change your place without your click
	All changes are recorded in ChangeHistory, so Ctrl+Z undoes them.
]]

local HttpService = game:GetService("HttpService")
local RunService = game:GetService("RunService")
local ChangeHistoryService = game:GetService("ChangeHistoryService")
local ScriptEditorService = game:GetService("ScriptEditorService")
local LogService = game:GetService("LogService")
local Selection = game:GetService("Selection")

local BASE_URL = "http://127.0.0.1:34873"
local TOKEN_KEY = "RobloxDevAcademy_Token"
local PLUGIN_VERSION = "1.0.0"

-- ------------------------------------------------------------------ HTTP
local function request(method: string, path: string, body: any?): (number?, any)
	local headers = { ["Content-Type"] = "application/json" }
	local token = plugin:GetSetting(TOKEN_KEY)
	if typeof(token) == "string" and #token == 64 then
		headers["Authorization"] = "Bearer " .. token
	end
	local ok, res = pcall(function()
		return HttpService:RequestAsync({
			Url = BASE_URL .. path,
			Method = method,
			Headers = headers,
			Body = if body ~= nil then HttpService:JSONEncode(body) else nil,
		})
	end)
	if not ok then
		return nil, tostring(res)
	end
	local data = nil
	pcall(function()
		data = HttpService:JSONDecode(res.Body)
	end)
	return res.StatusCode, data
end

local function resolvePath(path: string): Instance?
	local parts = string.split(path, ".")
	local okService, current = pcall(function()
		return game:GetService(parts[1])
	end)
	if not okService or not current then
		current = game:FindFirstChild(parts[1])
	end
	for i = 2, #parts do
		if not current then
			return nil
		end
		current = current:FindFirstChild(parts[i])
	end
	return current
end

local function readSource(inst: Instance): string
	local ok, src = pcall(function()
		return ScriptEditorService:GetEditorSource(inst)
	end)
	if ok and typeof(src) == "string" then
		return src
	end
	local ok2, src2 = pcall(function()
		return (inst :: any).Source
	end)
	return if ok2 and typeof(src2) == "string" then src2 else ""
end

local function record(name: string, fn: () -> ())
	local id = nil
	pcall(function()
		id = ChangeHistoryService:TryBeginRecording(name)
	end)
	local ok, err = pcall(fn)
	if id then
		ChangeHistoryService:FinishRecording(id, if ok then Enum.FinishRecordingOperation.Commit else Enum.FinishRecordingOperation.Cancel)
	else
		ChangeHistoryService:SetWaypoint(name)
	end
	if not ok then
		error(err, 0)
	end
end

-- ------------------------------------------------------------------ Play mode: only forward Output errors
if RunService:IsRunning() then
	if RunService:IsServer() and typeof(plugin:GetSetting(TOKEN_KEY)) == "string" then
		local queue = {}
		LogService.MessageOut:Connect(function(message, messageType)
			if messageType == Enum.MessageType.MessageError then
				table.insert(queue, { kind = "error", text = string.sub(message, 1, 2000) })
			elseif messageType == Enum.MessageType.MessageWarning then
				table.insert(queue, { kind = "warning", text = string.sub(message, 1, 2000) })
			end
		end)
		task.spawn(function()
			while true do
				task.wait(1)
				if #queue > 0 then
					local batch = table.move(queue, 1, math.min(#queue, 50), 1, {})
					table.clear(queue)
					request("POST", "/v1/log", { messages = batch })
				end
			end
		end)
	end
	return
end

-- ------------------------------------------------------------------ UI helpers
local toolbar = plugin:CreateToolbar("Roblox Dev Academy")
local toggleButton = toolbar:CreateButton("Academy", "Open het Roblox Dev Academy-paneel", "rbxasset://textures/StudioToolbox/AssetPreview/code_icon.png")
toggleButton.ClickableWhenViewportHidden = true

local widgetInfo = DockWidgetPluginGuiInfo.new(Enum.InitialDockState.Right, false, false, 340, 520, 280, 320)
local widget = plugin:CreateDockWidgetPluginGui("RobloxDevAcademy", widgetInfo)
widget.Title = "Roblox Dev Academy"

toggleButton.Click:Connect(function()
	widget.Enabled = not widget.Enabled
end)
widget:GetPropertyChangedSignal("Enabled"):Connect(function()
	toggleButton:SetActive(widget.Enabled)
end)

local theme = settings().Studio.Theme
local function color(c: Enum.StudioStyleGuideColor, m: Enum.StudioStyleGuideModifier?): Color3
	return theme:GetColor(c, m or Enum.StudioStyleGuideModifier.Default)
end

local root = Instance.new("ScrollingFrame")
root.Size = UDim2.fromScale(1, 1)
root.BackgroundColor3 = color(Enum.StudioStyleGuideColor.MainBackground)
root.BorderSizePixel = 0
root.ScrollBarThickness = 6
root.AutomaticCanvasSize = Enum.AutomaticSize.Y
root.CanvasSize = UDim2.new()
root.Parent = widget

local padding = Instance.new("UIPadding")
padding.PaddingTop = UDim.new(0, 12)
padding.PaddingBottom = UDim.new(0, 12)
padding.PaddingLeft = UDim.new(0, 12)
padding.PaddingRight = UDim.new(0, 12)
padding.Parent = root

local layout = Instance.new("UIListLayout")
layout.Padding = UDim.new(0, 8)
layout.SortOrder = Enum.SortOrder.LayoutOrder
layout.Parent = root

local order = 0
local dynamic: { Instance } = {}

local function add(inst: GuiObject, isDynamic: boolean?)
	order += 1
	inst.LayoutOrder = order
	inst.Parent = root
	if isDynamic then
		table.insert(dynamic, inst)
	end
	return inst
end

local function label(text: string, opts: { size: number?, bold: boolean?, dim: boolean?, color: Color3? }?, isDynamic: boolean?): TextLabel
	local o = opts or {}
	local l = Instance.new("TextLabel")
	l.BackgroundTransparency = 1
	l.Size = UDim2.new(1, 0, 0, 0)
	l.AutomaticSize = Enum.AutomaticSize.Y
	l.TextWrapped = true
	l.TextXAlignment = Enum.TextXAlignment.Left
	l.RichText = true
	l.Font = if o.bold then Enum.Font.SourceSansBold else Enum.Font.SourceSans
	l.TextSize = o.size or 15
	l.TextColor3 = o.color or (if o.dim then color(Enum.StudioStyleGuideColor.DimmedText) else color(Enum.StudioStyleGuideColor.MainText))
	l.Text = text
	add(l, isDynamic)
	return l
end

local function button(text: string, primary: boolean, onClick: () -> (), isDynamic: boolean?): TextButton
	local b = Instance.new("TextButton")
	b.Size = UDim2.new(1, 0, 0, 30)
	b.AutoButtonColor = true
	b.Font = Enum.Font.SourceSansSemibold
	b.TextSize = 15
	b.Text = text
	b.BackgroundColor3 = if primary then color(Enum.StudioStyleGuideColor.DialogMainButton) else color(Enum.StudioStyleGuideColor.Button)
	b.TextColor3 = if primary then color(Enum.StudioStyleGuideColor.DialogMainButtonText) else color(Enum.StudioStyleGuideColor.ButtonText)
	b.BorderSizePixel = 0
	local corner = Instance.new("UICorner")
	corner.CornerRadius = UDim.new(0, 5)
	corner.Parent = b
	b.MouseButton1Click:Connect(function()
		local ok, err = pcall(onClick)
		if not ok then
			warn("[Roblox Dev Academy] " .. tostring(err))
		end
	end)
	add(b, isDynamic)
	return b
end

local function clearDynamic()
	for _, inst in dynamic do
		inst:Destroy()
	end
	table.clear(dynamic)
end

local function escape(s: string): string
	return (string.gsub(string.gsub(string.gsub(s, "&", "&amp;"), "<", "&lt;"), ">", "&gt;"))
end

-- Markdown-lite: **bold** and `code`
local function rich(s: string): string
	s = escape(s)
	s = string.gsub(s, "%*%*(.-)%*%*", "<b>%1</b>")
	s = string.gsub(s, "`(.-)`", '<font face="RobotoMono">%1</font>')
	return s
end

-- ------------------------------------------------------------------ state
local state = {
	academyFound = false,
	connected = false,
	exercise = nil :: any,
	feedback = nil :: string?,
	pushes = {} :: { any },
	lastRenderKey = "",
}

local render: () -> ()

local function setFeedback(text: string?)
	state.feedback = text
	render()
end

-- ------------------------------------------------------------------ actions (all triggered by a click)
local function pair(code: string)
	local status, data = request("POST", "/v1/pair", { code = code, placeName = game.Name })
	if status == 200 and data and typeof(data.token) == "string" then
		plugin:SetSetting(TOKEN_KEY, data.token)
		state.connected = true
		setFeedback("Gekoppeld met de Academy.")
	else
		setFeedback((data and data.message) or "Koppelen mislukt. Klik in de Academy op \"Koppelen\" en typ de code die je daar ziet.")
	end
end

local function createPracticeScript()
	local ex = state.exercise
	if not ex then
		return
	end
	local parent = resolvePath(ex.scriptParent)
	if not parent then
		setFeedback("Ik kan **" .. ex.scriptParent .. "** niet vinden. Volg eerst de stappen hierboven.")
		return
	end
	local existing = parent:FindFirstChild(ex.scriptName)
	if existing then
		Selection:Set({ existing })
		pcall(function()
			ScriptEditorService:OpenScriptDocumentAsync(existing)
		end)
		setFeedback("Het oefenscript bestaat al; ik heb het geopend. Er is niets overschreven.")
		return
	end
	local created: Instance? = nil
	record("Academy: oefenscript maken", function()
		local s = Instance.new(ex.scriptClass)
		s.Name = ex.scriptName;
		(s :: any).Source = ex.starterSource
		s.Parent = parent
		created = s
	end)
	if created then
		Selection:Set({ created })
		pcall(function()
			ScriptEditorService:OpenScriptDocumentAsync(created)
		end)
	end
	setFeedback("Leeg oefenscript gemaakt in **" .. ex.scriptParent .. "**. Schrijf nu zelf de code. (Ctrl+Z maakt dit ongedaan.)")
end

local function collectFacts(ex: any)
	local instances = {}
	for _, path in ex.queries.paths do
		local inst = resolvePath(path)
		if inst then
			local props = {}
			for _, prop in ex.queries.props do
				local ok, value = pcall(function()
					return (inst :: any)[prop]
				end)
				if ok and (typeof(value) == "boolean" or typeof(value) == "number" or typeof(value) == "string") then
					props[prop] = value
				end
			end
			instances[path] = { exists = true, className = inst.ClassName, props = props }
		else
			instances[path] = { exists = false }
		end
	end
	local scripts = {}
	local parent = resolvePath(ex.queries.scriptParent)
	if parent then
		for _, child in parent:GetChildren() do
			if child:IsA("LuaSourceContainer") and #scripts < 20 then
				table.insert(scripts, { name = string.sub(child.Name, 1, 100), className = child.ClassName, source = string.sub(readSource(child), 1, 200000) })
			end
		end
	end
	return { parentExists = parent ~= nil, instances = instances, scripts = scripts }
end

local function checkWork()
	local ex = state.exercise
	if not ex then
		return
	end
	local status = request("POST", "/v1/report", { exerciseId = ex.id, facts = collectFacts(ex) })
	if status == 200 then
		setFeedback("Verstuurd. Bekijk de feedback in de Academy.")
	else
		setFeedback("Controleren lukte niet. Is de Academy nog open?")
	end
end

local function sendSelectedScript()
	local sel = Selection:Get()[1]
	if not (sel and sel:IsA("LuaSourceContainer")) then
		setFeedback("Selecteer eerst een script in de Explorer.")
		return
	end
	local status = request("POST", "/v1/pull", { path = sel:GetFullName(), source = readSource(sel) })
	setFeedback(if status == 200 then "Script naar de Academy gestuurd." else "Versturen lukte niet (gebruik alleen letters, cijfers, spaties, punten en streepjes in namen).")
end

local function answerPush(push: any, accept: boolean)
	local inst = resolvePath(push.path)
	local result
	if not accept then
		result = { pushId = push.id, applied = false, reason = "declined" }
	elseif not (inst and inst:IsA("LuaSourceContainer")) then
		result = { pushId = push.id, applied = false, reason = "missing" }
	else
		local current = readSource(inst)
		if current ~= push.baseSource then
			-- Studio changed since the Academy last saw it: never overwrite silently.
			result = { pushId = push.id, applied = false, reason = "conflict", currentSource = current }
		else
			record("Academy: script bijwerken", function()
				ScriptEditorService:UpdateSourceAsync(inst, function()
					return push.source
				end)
			end)
			result = { pushId = push.id, applied = true, reason = "applied" }
		end
	end
	request("POST", "/v1/push-result", result)
	for i, p in state.pushes do
		if p.id == push.id then
			table.remove(state.pushes, i)
			break
		end
	end
	setFeedback(if result.reason == "applied" then "Script bijgewerkt (Ctrl+Z maakt het ongedaan)."
		elseif result.reason == "conflict" then "Niet bijgewerkt: het script is in Studio veranderd. Kies in de Academy welke versie je wilt houden."
		elseif result.reason == "missing" then "Dat script bestaat niet meer in Studio."
		else "Update geweigerd.")
end

-- ------------------------------------------------------------------ render
render = function()
	clearDynamic()
	local green = Color3.fromRGB(67, 203, 145)
	local amber = Color3.fromRGB(232, 183, 90)

	if state.connected then
		label("● Verbonden met de Academy", { bold = true, color = green }, true)
	elseif state.academyFound then
		label("● Academy gevonden, nog niet gekoppeld", { bold = true, color = amber }, true)
	else
		label("● Academy niet gevonden", { bold = true, color = amber }, true)
		label("Open de Roblox Dev Academy-app op deze computer. Sta toegang tot 127.0.0.1 toe als Studio daarom vraagt.", { dim = true }, true)
	end

	if not state.connected and state.academyFound then
		label("Klik in de Academy op <b>Koppelen</b> (pagina Roblox Studio) en typ hier de code van 6 cijfers:", nil, true)
		local box = Instance.new("TextBox")
		box.Size = UDim2.new(1, 0, 0, 30)
		box.PlaceholderText = "123456"
		box.Text = ""
		box.Font = Enum.Font.RobotoMono
		box.TextSize = 18
		box.ClearTextOnFocus = false
		box.BackgroundColor3 = color(Enum.StudioStyleGuideColor.InputFieldBackground)
		box.TextColor3 = color(Enum.StudioStyleGuideColor.MainText)
		box.BorderSizePixel = 0
		add(box, true)
		button("Koppel", true, function()
			pair((string.gsub(box.Text, "%D", "")))
		end, true)
	end

	if state.connected then
		local ex = state.exercise
		if ex then
			label(rich(ex.title), { bold = true, size = 18 }, true)
			label(rich(ex.goal), nil, true)
			label("Script: <b>" .. ex.scriptClass .. "</b> in <b>" .. escape(ex.scriptParent) .. "</b>", { dim = true }, true)
			for i, step in ex.steps do
				label(i .. ". " .. rich(step), nil, true)
			end
			button("Maak oefenscript", false, createPracticeScript, true)
			button("Controleer mijn werk", true, checkWork, true)
			label("Daarna: " .. rich(ex.playtest), { dim = true }, true)
		else
			label("Open een Studio-oefening in de Academy: kies bij een les of project <b>Open in Studio</b>.", { dim = true }, true)
		end

		for _, push in state.pushes do
			label("De Academy wil <b>" .. escape(push.path) .. "</b> bijwerken.", { bold = true, color = amber }, true)
			button("Toepassen", true, function()
				answerPush(push, true)
			end, true)
			button("Weigeren", false, function()
				answerPush(push, false)
			end, true)
		end

		button("Stuur geselecteerd script naar Academy", false, sendSelectedScript, true)
		button("Ontkoppelen", false, function()
			plugin:SetSetting(TOKEN_KEY, nil)
			state.connected = false
			setFeedback("Ontkoppeld.")
		end, true)
	end

	if state.feedback then
		label(rich(state.feedback), { color = color(Enum.StudioStyleGuideColor.MainText) }, true)
	end
	label("Plugin " .. PLUGIN_VERSION .. " · alleen verbinding met je eigen computer", { dim = true, size = 12 }, true)
end

-- ------------------------------------------------------------------ polling loop
local running = true
plugin.Unloading:Connect(function()
	running = false
end)

task.spawn(function()
	render()
	while running do
		local token = plugin:GetSetting(TOKEN_KEY)
		local before = HttpService:JSONEncode({ state.connected, state.academyFound, state.exercise and state.exercise.id or "", #state.pushes })
		if typeof(token) == "string" then
			local status, data = request("POST", "/v1/poll", { placeName = game.Name, isRunning = false })
			if status == 200 and data then
				state.connected = true
				state.academyFound = true
				state.exercise = data.exercise
				local known = {}
				for _, p in state.pushes do
					known[p.id] = true
				end
				for _, p in data.pushes or {} do
					if not known[p.id] then
						table.insert(state.pushes, p)
					end
				end
				if data.check and state.exercise then
					checkWork()
				end
			elseif status == 401 then
				plugin:SetSetting(TOKEN_KEY, nil)
				state.connected = false
				state.academyFound = true
			else
				state.connected = false
				state.academyFound = false
			end
		else
			local status = request("GET", "/v1/hello")
			state.connected = false
			state.academyFound = status == 200
		end
		local after = HttpService:JSONEncode({ state.connected, state.academyFound, state.exercise and state.exercise.id or "", #state.pushes })
		if before ~= after then
			render()
		end
		task.wait(if state.connected then 1.5 else 4)
	end
end)
