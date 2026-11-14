/**
 * Knowledge base. Only real, documented Roblox/Luau API members are used.
 * Doc links point to the official Creator Hub reference (create.roblox.com/docs), checked for API version
 * as of late 2026. When Roblox changes an API, update the entry here rather than keeping outdated examples.
 */
export interface KnowledgeEntry {
  id: string;
  title: string;
  kind: string; // Luau | Service | Class | Datatype
  where: string; // Anywhere | Server | Client | Server and client
  simple: string;
  when: string;
  beginner: string;
  advanced: string;
  mistakes: string[];
  related: string[]; // lesson ids or planned course titles
  docs: string;
}

const D = 'https://create.roblox.com/docs/reference/engine';

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'print', title: 'print()', kind: 'Luau', where: 'Anywhere',
    simple: 'Shows information in the Output window. Players do not see this; it is for you as the developer.',
    when: 'To check what your code does and what value a variable has.',
    beginner: 'print("Hello Roblox!")\nprint("Coins:", 100)',
    advanced: 'local coins = 250\nprint(`[Shop] Player has {coins} coins`)',
    mistakes: ['Forgetting brackets or quotes.', 'Thinking players can see print messages.'],
    related: ['c0-first-script', 'c0-brackets-commas'], docs: `${D}/globals/LuaGlobals#print`,
  },
  {
    id: 'warn', title: 'warn()', kind: 'Luau', where: 'Anywhere',
    simple: 'Like print, but the message is yellow. The script simply carries on.',
    when: 'For situations that are not right but should not stop your game.',
    beginner: 'warn("No data found for this player")',
    advanced: 'local ok, result = pcall(function()\n    error("connection failed")\nend)\nif not ok then\n    warn("Loading failed:", result)\nend',
    mistakes: ['Using warn for normal information: then a real warning no longer stands out.'],
    related: ['c1-warn-errors'], docs: `${D}/globals/RobloxGlobals#warn`,
  },
  {
    id: 'local', title: 'local (variables)', kind: 'Luau', where: 'Anywhere',
    simple: 'Creates a variable: a name with a value. It only exists inside the block where you create it.',
    when: 'Always when you create a new variable. Almost never use variables without local.',
    beginner: 'local coins = 100\ncoins += 50\nprint(coins)',
    advanced: 'local MAX_HEALTH = 100 -- capitals: a value that does not change\nlocal function heal(amount: number)\n    local healed = math.min(MAX_HEALTH, amount)\n    return healed\nend',
    mistakes: ['Writing local again when changing an existing variable (then you create a new one).', 'Using a variable outside the block where it was created.'],
    related: ['c1-variables', 'c1-naming-scope'], docs: 'https://luau.org/syntax',
  },
  {
    id: 'typeof', title: 'typeof()', kind: 'Luau', where: 'Anywhere',
    simple: 'Gives back the kind of value as text, like "number", "string" or "Instance".',
    when: 'When hunting bugs, or to check what a player or script sends you.',
    beginner: 'print(typeof(42))      -- number\nprint(typeof("42"))    -- string',
    advanced: '-- On the server: check what the client sends\nif typeof(itemName) ~= "string" then\n    return\nend',
    mistakes: ['Mixing up typeof and type: typeof also recognises Roblox types like Vector3 and Instance.'],
    related: ['c1-typeof'], docs: `${D}/globals/RobloxGlobals#typeof`,
  },
  {
    id: 'getservice', title: 'game:GetService()', kind: 'Class', where: 'Server and client',
    simple: 'Gets a Roblox service: a fixed part of the engine with its own job, like Players or TweenService.',
    when: 'At the top of almost every script, to get the services you need.',
    beginner: 'local Players = game:GetService("Players")\nlocal TweenService = game:GetService("TweenService")',
    advanced: '-- Always use GetService instead of game.Players:\n-- it also works if a service was given a different name.\nlocal ReplicatedStorage = game:GetService("ReplicatedStorage")',
    mistakes: ['A typo in the service name: GetService then gives an error.', 'Using a dot instead of a colon: game.GetService("Players").'],
    related: ['Course 6: The Roblox engine'], docs: `${D}/classes/ServiceProvider#GetService`,
  },
  {
    id: 'players', title: 'Players', kind: 'Service', where: 'Server and client',
    simple: 'Keeps track of which players are in your game.',
    when: 'To do something when a player joins or leaves, or to get the local player in a LocalScript.',
    beginner: 'local Players = game:GetService("Players")\n\nPlayers.PlayerAdded:Connect(function(player)\n    print(player.Name .. " joined")\nend)',
    advanced: '-- In a LocalScript:\nlocal Players = game:GetService("Players")\nlocal player = Players.LocalPlayer\nlocal character = player.Character or player.CharacterAdded:Wait()',
    mistakes: ['Using Players.LocalPlayer in a server Script: there it is nil.', 'Forgetting that the character may not be loaded yet.'],
    related: ['Course 7: Events'], docs: `${D}/classes/Players`,
  },
  {
    id: 'workspace', title: 'Workspace', kind: 'Service', where: 'Server and client',
    simple: 'Contains everything that exists in the 3D world. You can also just call it `workspace`.',
    when: 'To find, create or change parts in the world.',
    beginner: 'local part = workspace:WaitForChild("TrainingPart")\npart.Color = Color3.fromRGB(0, 120, 255)',
    advanced: 'local part = Instance.new("Part")\npart.Anchored = true\npart.Position = Vector3.new(0, 10, 0)\npart.Parent = workspace',
    mistakes: ['Looking up a part before it has loaded: use WaitForChild.', 'Forgetting to set Parent: then the part exists, but you do not see it.'],
    related: ['c0-roblox-studio'], docs: `${D}/classes/Workspace`,
  },
  {
    id: 'serverscriptservice', title: 'ServerScriptService', kind: 'Service', where: 'Server',
    simple: 'The place for Scripts that run on the server. Players cannot see what is inside.',
    when: 'For all your game rules: giving coins, checking purchases, saving data.',
    beginner: '-- A Script in ServerScriptService\nprint("The server has started")',
    advanced: '-- You can also keep ModuleScripts with server code here:\nlocal ServerScriptService = game:GetService("ServerScriptService")\nlocal Economy = require(ServerScriptService.Economy)',
    mistakes: ['Putting a LocalScript in here: it does not run here.'],
    related: ['c0-script-types', 'c0-first-studio-script'], docs: `${D}/classes/ServerScriptService`,
  },
  {
    id: 'replicatedstorage', title: 'ReplicatedStorage', kind: 'Service', where: 'Server and client',
    simple: 'A storage place that both the server and all players can see.',
    when: 'For RemoteEvents, shared ModuleScripts and models that both sides need.',
    beginner: 'local ReplicatedStorage = game:GetService("ReplicatedStorage")\nlocal buyEvent = ReplicatedStorage:WaitForChild("BuyItem")',
    advanced: '-- Secret things (like prices that must not be changed)\n-- belong in ServerStorage, not here: players can read ReplicatedStorage.',
    mistakes: ['Storing secret server code here: players can download everything in it.'],
    related: ['Course 8: Client and server'], docs: `${D}/classes/ReplicatedStorage`,
  },
  {
    id: 'remoteevent', title: 'RemoteEvent', kind: 'Class', where: 'Server and client',
    simple: 'A message between client and server, in one direction. The client asks; the server decides.',
    when: 'When a button on a player\'s screen has to make something happen on the server, like a purchase.',
    beginner: '-- LocalScript (client):\nbuyEvent:FireServer("Sword")\n\n-- Script (server):\nbuyEvent.OnServerEvent:Connect(function(player, itemName)\n    print(player.Name, "wants to buy:", itemName)\nend)',
    advanced: '-- Server: never trust the client\nbuyEvent.OnServerEvent:Connect(function(player, itemName)\n    if typeof(itemName) ~= "string" then return end\n    local price = PRICES[itemName]\n    if not price then return end\n    local coins = player.leaderstats.Coins\n    if coins.Value < price then return end\n    coins.Value -= price\nend)',
    mistakes: ['Sending the price or number of coins from the client and believing it.', 'Forgetting that the server always gets the player as the first argument.'],
    related: ['Course 8: Client and server'], docs: `${D}/classes/RemoteEvent`,
  },
  {
    id: 'remotefunction', title: 'RemoteFunction', kind: 'Class', where: 'Server and client',
    simple: 'Like a RemoteEvent, but the client waits for an answer from the server.',
    when: 'When the client needs to know something from the server, like "what does this item cost?".',
    beginner: '-- Server:\ngetPrice.OnServerInvoke = function(player, itemName)\n    return PRICES[itemName]\nend\n\n-- Client:\nlocal price = getPrice:InvokeServer("Sword")',
    advanced: '-- Never let the server call a client with InvokeClient for important logic:\n-- if the client does not answer, the server keeps waiting.',
    mistakes: ['Using InvokeClient from the server: a player can then make your server wait.'],
    related: ['Course 8: Client and server'], docs: `${D}/classes/RemoteFunction`,
  },
  {
    id: 'tweenservice', title: 'TweenService', kind: 'Service', where: 'Server and client',
    simple: 'Changes a property smoothly, like a door that slowly opens or a button that grows.',
    when: 'For animations of parts and interfaces.',
    beginner: 'local TweenService = game:GetService("TweenService")\nlocal part = workspace:WaitForChild("Door")\nlocal tween = TweenService:Create(part, TweenInfo.new(1), { Transparency = 1 })\ntween:Play()',
    advanced: 'local info = TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)\nlocal tween = TweenService:Create(door, info, { CFrame = door.CFrame * CFrame.new(0, 8, 0) })\ntween.Completed:Connect(function()\n    print("Door is open")\nend)\ntween:Play()',
    mistakes: ['Forgetting to call :Play().', 'Tweening a property that cannot be animated.'],
    related: ['Course 9: UI scripting'], docs: `${D}/classes/TweenService`,
  },
  {
    id: 'userinputservice', title: 'UserInputService', kind: 'Service', where: 'Client',
    simple: 'Tells you which keys, mouse buttons or touch gestures a player uses.',
    when: 'In a LocalScript, for controls like "press E to open".',
    beginner: 'local UserInputService = game:GetService("UserInputService")\n\nUserInputService.InputBegan:Connect(function(input, gameProcessed)\n    if gameProcessed then return end\n    if input.KeyCode == Enum.KeyCode.E then\n        print("E pressed")\n    end\nend)',
    advanced: '-- gameProcessed is true when the player is, for example, typing in the chat.\n-- Ignore that input, or your menu opens while chatting.',
    mistakes: ['Using UserInputService in a server Script: it only works on the client.', 'Ignoring gameProcessed.'],
    related: ['Course 9: UI scripting'], docs: `${D}/classes/UserInputService`,
  },
  {
    id: 'runservice', title: 'RunService', kind: 'Service', where: 'Server and client',
    simple: 'Gives events that fire every frame, and tells you whether code runs on the server or the client.',
    when: 'For things that have to happen continuously, like a spinning part.',
    beginner: 'local RunService = game:GetService("RunService")\nprint(RunService:IsServer())',
    advanced: 'local RunService = game:GetService("RunService")\nRunService.Heartbeat:Connect(function(deltaTime)\n    part.CFrame *= CFrame.Angles(0, math.rad(90) * deltaTime, 0)\nend)',
    mistakes: ['Heavy calculations in Heartbeat: they run dozens of times per second.', 'Forgetting deltaTime, so the speed depends on the frame rate.'],
    related: ['Course 11: Advanced Roblox development'], docs: `${D}/classes/RunService`,
  },
  {
    id: 'datastoreservice', title: 'DataStoreService', kind: 'Service', where: 'Server',
    simple: 'Saves data permanently, like coins, even when the player leaves the game.',
    when: 'For everything that must be kept between sessions. Server only.',
    beginner: 'local DataStoreService = game:GetService("DataStoreService")\nlocal store = DataStoreService:GetDataStore("PlayerData")',
    advanced: 'local ok, data = pcall(function()\n    return store:GetAsync("Player_" .. player.UserId)\nend)\nif ok then\n    coins.Value = data or 0\nelse\n    warn("Loading failed:", data)\nend',
    mistakes: ['Not using pcall: DataStore calls can fail.', 'Testing in Studio without "Enable Studio Access to API Services" in Game Settings.', 'The Luau playground cannot imitate DataStores: always test this in Studio.'],
    related: ['Course 10: Data and game systems'], docs: `${D}/classes/DataStoreService`,
  },
  {
    id: 'collectionservice', title: 'CollectionService', kind: 'Service', where: 'Server and client',
    simple: 'Gives parts a label (tag), so you can find them all at once.',
    when: 'For example to give all lava parts in your obby the same code.',
    beginner: 'local CollectionService = game:GetService("CollectionService")\nfor _, part in CollectionService:GetTagged("Lava") do\n    print(part.Name)\nend',
    advanced: 'local function setup(part)\n    part.Touched:Connect(function(hit)\n        local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")\n        if humanoid then humanoid.Health = 0 end\n    end)\nend\nfor _, p in CollectionService:GetTagged("Lava") do setup(p) end\nCollectionService:GetInstanceAddedSignal("Lava"):Connect(setup)',
    mistakes: ['Only using GetTagged: you then miss parts that load later.'],
    related: ['Course 12: Building complete games'], docs: `${D}/classes/CollectionService`,
  },
  {
    id: 'modulescript', title: 'ModuleScript', kind: 'Class', where: 'Server and client',
    simple: 'A script with reusable code. It only does something when another script loads it with require().',
    when: 'When several scripts need the same functions or settings.',
    beginner: '-- ModuleScript "Prices" in ReplicatedStorage:\nlocal Prices = {\n    Sword = 100,\n    Shield = 80,\n}\nreturn Prices',
    advanced: '-- In another script:\nlocal ReplicatedStorage = game:GetService("ReplicatedStorage")\nlocal Prices = require(ReplicatedStorage.Prices)\nprint(Prices.Sword)',
    mistakes: ['Forgetting the return at the end.', 'Expecting a ModuleScript to run by itself.'],
    related: ['c0-script-types', 'Course 11: Advanced Roblox development'], docs: `${D}/classes/ModuleScript`,
  },
  {
    id: 'vector3', title: 'Vector3', kind: 'Datatype', where: 'Anywhere',
    simple: 'Three numbers together (X, Y, Z): a position, size or direction in the 3D world.',
    when: 'For Position, Size and distances.',
    beginner: 'part.Position = Vector3.new(0, 10, 0)\npart.Size = Vector3.new(4, 1, 4)',
    advanced: 'local distance = (playerPosition - part.Position).Magnitude\nif distance < 10 then\n    print("Close by")\nend',
    mistakes: ['Changing one value with part.Position.Y = 5: that is not allowed, make a new Vector3.'],
    related: ['Course 6: The Roblox engine'], docs: `${D}/datatypes/Vector3`,
  },
  {
    id: 'cframe', title: 'CFrame', kind: 'Datatype', where: 'Anywhere',
    simple: 'Position and rotation together. You use it to place and turn parts.',
    when: 'When you want to move and rotate something, or make it look at a point.',
    beginner: 'part.CFrame = CFrame.new(0, 10, 0)',
    advanced: '-- Rotate 90 degrees around the Y axis:\npart.CFrame = part.CFrame * CFrame.Angles(0, math.rad(90), 0)\n-- Look at a target:\npart.CFrame = CFrame.lookAt(part.Position, target.Position)',
    mistakes: ['Using degrees where radians are needed: use math.rad().'],
    related: ['Course 6: The Roblox engine'], docs: `${D}/datatypes/CFrame`,
  },
  {
    id: 'color3', title: 'Color3', kind: 'Datatype', where: 'Anywhere',
    simple: 'A colour, made of red, green and blue.',
    when: 'For the colour of parts and interfaces.',
    beginner: 'part.Color = Color3.fromRGB(255, 0, 0) -- red (0 to 255)',
    advanced: 'local a = Color3.new(1, 0, 0)          -- Color3.new uses 0 to 1!\nlocal b = Color3.fromHex("#527CFF")\nlocal mix = a:Lerp(b, 0.5)',
    mistakes: ['Writing Color3.new(255, 0, 0): Color3.new expects 0 to 1. Use fromRGB for 0 to 255.'],
    related: ['Project: color-changing platform'], docs: `${D}/datatypes/Color3`,
  },
  {
    id: 'udim2', title: 'UDim2', kind: 'Datatype', where: 'Client',
    simple: 'Size or position of an interface element, in scale (part of the screen) and pixels.',
    when: 'For the Size and Position of Frames, buttons and labels.',
    beginner: 'frame.Size = UDim2.fromScale(0.5, 0.3)   -- half wide, 30% high\nbutton.Size = UDim2.fromOffset(200, 50)   -- 200 x 50 pixels',
    advanced: '-- UDim2.new(scaleX, pixelsX, scaleY, pixelsY)\nframe.Position = UDim2.new(0.5, -100, 1, -80)\nframe.AnchorPoint = Vector2.new(0.5, 0)',
    mistakes: ['Only using pixels: then your interface does not fit on a phone.'],
    related: ['Course 9: UI scripting'], docs: `${D}/datatypes/UDim2`,
  },
];
