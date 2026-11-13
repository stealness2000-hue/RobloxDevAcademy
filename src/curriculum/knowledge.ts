/**
 * Knowledge base. Only real, documented Roblox/Luau API members are used.
 * Doc links point to the official Creator Hub reference (create.roblox.com/docs), checked for API version
 * as of late 2026. When Roblox changes an API, update the entry here rather than keeping outdated examples.
 */
export interface KnowledgeEntry {
  id: string;
  title: string;
  kind: 'Luau' | 'Service' | 'Class' | 'Datatype';
  where: 'Overal' | 'Server' | 'Client' | 'Server en client';
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
    id: 'print', title: 'print()', kind: 'Luau', where: 'Overal',
    simple: 'Laat informatie zien in het Output-venster. Spelers zien dit niet; het is voor jou als developer.',
    when: 'Om te controleren wat je code doet en welke waarde een variabele heeft.',
    beginner: 'print("Hallo Roblox!")\nprint("Coins:", 100)',
    advanced: 'local coins = 250\nprint(`[Shop] Speler heeft {coins} coins`)',
    mistakes: ['Haakjes of aanhalingstekens vergeten.', 'Denken dat spelers print-berichten zien.'],
    related: ['c0-first-script', 'c0-brackets-commas'], docs: `${D}/globals/LuaGlobals#print`,
  },
  {
    id: 'warn', title: 'warn()', kind: 'Luau', where: 'Overal',
    simple: 'Zoals print, maar het bericht is geel. Het script gaat gewoon door.',
    when: 'Voor situaties die niet goed zijn maar je game niet laten stoppen.',
    beginner: 'warn("Geen data gevonden voor deze speler")',
    advanced: 'local ok, result = pcall(function()\n    error("verbinding mislukt")\nend)\nif not ok then\n    warn("Laden mislukt:", result)\nend',
    mistakes: ['warn gebruiken voor gewone informatie: dan valt een echte waarschuwing niet meer op.'],
    related: ['c1-warn-errors'], docs: `${D}/globals/RobloxGlobals#warn`,
  },
  {
    id: 'local', title: 'local (variabelen)', kind: 'Luau', where: 'Overal',
    simple: 'Maakt een variabele: een naam met een waarde. Die bestaat alleen binnen het blok waarin je hem maakt.',
    when: 'Altijd als je een nieuwe variabele maakt. Gebruik bijna nooit variabelen zonder local.',
    beginner: 'local coins = 100\ncoins += 50\nprint(coins)',
    advanced: 'local MAX_HEALTH = 100 -- hoofdletters: een waarde die niet verandert\nlocal function heal(amount: number)\n    local healed = math.min(MAX_HEALTH, amount)\n    return healed\nend',
    mistakes: ['local opnieuw schrijven bij het veranderen van een bestaande variabele (dan maak je een nieuwe).', 'Een variabele gebruiken buiten het blok waarin hij gemaakt is.'],
    related: ['c1-variables', 'c1-naming-scope'], docs: 'https://luau.org/syntax',
  },
  {
    id: 'typeof', title: 'typeof()', kind: 'Luau', where: 'Overal',
    simple: 'Geeft het soort waarde terug als tekst, zoals "number", "string" of "Instance".',
    when: 'Bij het zoeken naar fouten, of om te controleren wat een speler of script je stuurt.',
    beginner: 'print(typeof(42))      -- number\nprint(typeof("42"))    -- string',
    advanced: '-- Op de server: controleer wat de client stuurt\nif typeof(itemName) ~= "string" then\n    return\nend',
    mistakes: ['typeof en type door elkaar halen: typeof herkent ook Roblox-types zoals Vector3 en Instance.'],
    related: ['c1-typeof'], docs: `${D}/globals/RobloxGlobals#typeof`,
  },
  {
    id: 'getservice', title: 'game:GetService()', kind: 'Class', where: 'Server en client',
    simple: 'Haalt een Roblox-service op: een vast onderdeel van de engine met een eigen taak, zoals Players of TweenService.',
    when: 'Bovenaan bijna elk script, om de services op te halen die je nodig hebt.',
    beginner: 'local Players = game:GetService("Players")\nlocal TweenService = game:GetService("TweenService")',
    advanced: '-- Gebruik altijd GetService in plaats van game.Players:\n-- het werkt ook als een service een andere naam heeft gekregen.\nlocal ReplicatedStorage = game:GetService("ReplicatedStorage")',
    mistakes: ['Een tikfout in de servicenaam: GetService geeft dan een fout.', 'Een punt gebruiken in plaats van een dubbele punt: game.GetService("Players").'],
    related: ['Cursus 6: De Roblox-engine'], docs: `${D}/classes/ServiceProvider#GetService`,
  },
  {
    id: 'players', title: 'Players', kind: 'Service', where: 'Server en client',
    simple: 'Houdt bij welke spelers in je game zitten.',
    when: 'Om iets te doen als een speler binnenkomt of weggaat, of om de lokale speler op te halen in een LocalScript.',
    beginner: 'local Players = game:GetService("Players")\n\nPlayers.PlayerAdded:Connect(function(player)\n    print(player.Name .. " doet mee")\nend)',
    advanced: '-- In een LocalScript:\nlocal Players = game:GetService("Players")\nlocal player = Players.LocalPlayer\nlocal character = player.Character or player.CharacterAdded:Wait()',
    mistakes: ['Players.LocalPlayer gebruiken in een server-Script: daar is het nil.', 'Vergeten dat het character nog niet geladen kan zijn.'],
    related: ['Cursus 7: Events'], docs: `${D}/classes/Players`,
  },
  {
    id: 'workspace', title: 'Workspace', kind: 'Service', where: 'Server en client',
    simple: 'Bevat alles wat in de 3D-wereld bestaat. Je kunt hem ook gewoon `workspace` noemen.',
    when: 'Om onderdelen in de wereld te vinden, te maken of aan te passen.',
    beginner: 'local part = workspace:WaitForChild("TrainingPart")\npart.Color = Color3.fromRGB(0, 120, 255)',
    advanced: 'local part = Instance.new("Part")\npart.Anchored = true\npart.Position = Vector3.new(0, 10, 0)\npart.Parent = workspace',
    mistakes: ['Een onderdeel opzoeken voordat het geladen is: gebruik WaitForChild.', 'Vergeten Parent in te stellen: dan bestaat het onderdeel wel, maar zie je het niet.'],
    related: ['c0-roblox-studio'], docs: `${D}/classes/Workspace`,
  },
  {
    id: 'serverscriptservice', title: 'ServerScriptService', kind: 'Service', where: 'Server',
    simple: 'De plek voor Scripts die op de server draaien. Spelers kunnen de inhoud niet zien.',
    when: 'Voor al je spelregels: coins geven, aankopen controleren, data opslaan.',
    beginner: '-- Een Script in ServerScriptService\nprint("De server is gestart")',
    advanced: '-- ModuleScripts met servercode kun je hier ook bewaren:\nlocal ServerScriptService = game:GetService("ServerScriptService")\nlocal Economy = require(ServerScriptService.Economy)',
    mistakes: ['Een LocalScript hierin zetten: die draait hier niet.'],
    related: ['c0-script-types', 'c0-first-studio-script'], docs: `${D}/classes/ServerScriptService`,
  },
  {
    id: 'replicatedstorage', title: 'ReplicatedStorage', kind: 'Service', where: 'Server en client',
    simple: 'Een opslagplek die zowel de server als alle spelers kunnen zien.',
    when: 'Voor RemoteEvents, gedeelde ModuleScripts en modellen die beide kanten nodig hebben.',
    beginner: 'local ReplicatedStorage = game:GetService("ReplicatedStorage")\nlocal buyEvent = ReplicatedStorage:WaitForChild("BuyItem")',
    advanced: '-- Geheime dingen (zoals prijzen die niet gewijzigd mogen worden)\n-- horen in ServerStorage, niet hier: spelers kunnen ReplicatedStorage lezen.',
    mistakes: ['Geheime servercode hier opslaan: spelers kunnen alles hierin downloaden.'],
    related: ['Cursus 8: Client en server'], docs: `${D}/classes/ReplicatedStorage`,
  },
  {
    id: 'remoteevent', title: 'RemoteEvent', kind: 'Class', where: 'Server en client',
    simple: 'Een boodschap tussen client en server, in één richting. De client vraagt iets; de server beslist.',
    when: 'Als een knop op het scherm van een speler iets op de server moet laten gebeuren, zoals een aankoop.',
    beginner: '-- LocalScript (client):\nbuyEvent:FireServer("Zwaard")\n\n-- Script (server):\nbuyEvent.OnServerEvent:Connect(function(player, itemName)\n    print(player.Name, "wil kopen:", itemName)\nend)',
    advanced: '-- Server: vertrouw de client nooit\nbuyEvent.OnServerEvent:Connect(function(player, itemName)\n    if typeof(itemName) ~= "string" then return end\n    local price = PRICES[itemName]\n    if not price then return end\n    local coins = player.leaderstats.Coins\n    if coins.Value < price then return end\n    coins.Value -= price\nend)',
    mistakes: ['De prijs of het aantal coins vanaf de client meesturen en geloven.', 'Vergeten dat de server als eerste argument altijd de speler krijgt.'],
    related: ['Cursus 8: Client en server'], docs: `${D}/classes/RemoteEvent`,
  },
  {
    id: 'remotefunction', title: 'RemoteFunction', kind: 'Class', where: 'Server en client',
    simple: 'Zoals een RemoteEvent, maar de client wacht op een antwoord van de server.',
    when: 'Als de client iets moet weten van de server, zoals "wat kost dit item?".',
    beginner: '-- Server:\ngetPrice.OnServerInvoke = function(player, itemName)\n    return PRICES[itemName]\nend\n\n-- Client:\nlocal price = getPrice:InvokeServer("Zwaard")',
    advanced: '-- Laat de server nooit een client aanroepen met InvokeClient voor belangrijke logica:\n-- als de client niet antwoordt, blijft de server wachten.',
    mistakes: ['InvokeClient vanaf de server gebruiken: een speler kan dan je server laten wachten.'],
    related: ['Cursus 8: Client en server'], docs: `${D}/classes/RemoteFunction`,
  },
  {
    id: 'tweenservice', title: 'TweenService', kind: 'Service', where: 'Server en client',
    simple: 'Laat een eigenschap vloeiend veranderen, zoals een deur die langzaam opengaat of een knop die groter wordt.',
    when: 'Voor animaties van onderdelen en interfaces.',
    beginner: 'local TweenService = game:GetService("TweenService")\nlocal part = workspace:WaitForChild("Door")\nlocal tween = TweenService:Create(part, TweenInfo.new(1), { Transparency = 1 })\ntween:Play()',
    advanced: 'local info = TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out)\nlocal tween = TweenService:Create(door, info, { CFrame = door.CFrame * CFrame.new(0, 8, 0) })\ntween.Completed:Connect(function()\n    print("Deur is open")\nend)\ntween:Play()',
    mistakes: ['Vergeten :Play() aan te roepen.', 'Een eigenschap tweenen die niet geanimeerd kan worden.'],
    related: ['Cursus 9: UI-scripting'], docs: `${D}/classes/TweenService`,
  },
  {
    id: 'userinputservice', title: 'UserInputService', kind: 'Service', where: 'Client',
    simple: 'Vertelt je welke toetsen, muisknoppen of touch-gebaren een speler gebruikt.',
    when: 'In een LocalScript, voor besturing zoals "druk op E om te openen".',
    beginner: 'local UserInputService = game:GetService("UserInputService")\n\nUserInputService.InputBegan:Connect(function(input, gameProcessed)\n    if gameProcessed then return end\n    if input.KeyCode == Enum.KeyCode.E then\n        print("E ingedrukt")\n    end\nend)',
    advanced: '-- gameProcessed is true als de speler bijvoorbeeld in de chat typt.\n-- Negeer die input, anders opent je menu tijdens het chatten.',
    mistakes: ['UserInputService in een server-Script gebruiken: het werkt alleen op de client.', 'gameProcessed negeren.'],
    related: ['Cursus 9: UI-scripting'], docs: `${D}/classes/UserInputService`,
  },
  {
    id: 'runservice', title: 'RunService', kind: 'Service', where: 'Server en client',
    simple: 'Geeft events die elk frame afgaan, en vertelt of code op de server of client draait.',
    when: 'Voor dingen die continu moeten gebeuren, zoals een draaiend onderdeel.',
    beginner: 'local RunService = game:GetService("RunService")\nprint(RunService:IsServer())',
    advanced: 'local RunService = game:GetService("RunService")\nRunService.Heartbeat:Connect(function(deltaTime)\n    part.CFrame *= CFrame.Angles(0, math.rad(90) * deltaTime, 0)\nend)',
    mistakes: ['Zware berekeningen in Heartbeat: die draaien tientallen keren per seconde.', 'deltaTime vergeten, waardoor snelheid afhangt van de framerate.'],
    related: ['Cursus 11: Geavanceerde Roblox-ontwikkeling'], docs: `${D}/classes/RunService`,
  },
  {
    id: 'datastoreservice', title: 'DataStoreService', kind: 'Service', where: 'Server',
    simple: 'Slaat gegevens blijvend op, zoals coins, ook als de speler de game verlaat.',
    when: 'Voor alles wat bewaard moet blijven tussen sessies. Alleen op de server.',
    beginner: 'local DataStoreService = game:GetService("DataStoreService")\nlocal store = DataStoreService:GetDataStore("PlayerData")',
    advanced: 'local ok, data = pcall(function()\n    return store:GetAsync("Player_" .. player.UserId)\nend)\nif ok then\n    coins.Value = data or 0\nelse\n    warn("Laden mislukt:", data)\nend',
    mistakes: ['Geen pcall gebruiken: DataStore-aanroepen kunnen mislukken.', 'Testen in Studio zonder "Enable Studio Access to API Services" in Game Settings.', 'De Luau-speeltuin kan DataStores niet nabootsen: test dit altijd in Studio.'],
    related: ['Cursus 10: Data en gamesystemen'], docs: `${D}/classes/DataStoreService`,
  },
  {
    id: 'collectionservice', title: 'CollectionService', kind: 'Service', where: 'Server en client',
    simple: 'Geeft onderdelen een label (tag), zodat je ze allemaal tegelijk kunt vinden.',
    when: 'Bijvoorbeeld om alle lava-onderdelen in je obby dezelfde code te geven.',
    beginner: 'local CollectionService = game:GetService("CollectionService")\nfor _, part in CollectionService:GetTagged("Lava") do\n    print(part.Name)\nend',
    advanced: 'local function setup(part)\n    part.Touched:Connect(function(hit)\n        local humanoid = hit.Parent:FindFirstChildOfClass("Humanoid")\n        if humanoid then humanoid.Health = 0 end\n    end)\nend\nfor _, p in CollectionService:GetTagged("Lava") do setup(p) end\nCollectionService:GetInstanceAddedSignal("Lava"):Connect(setup)',
    mistakes: ['Alleen GetTagged gebruiken: onderdelen die later geladen worden mis je dan.'],
    related: ['Cursus 12: Complete games bouwen'], docs: `${D}/classes/CollectionService`,
  },
  {
    id: 'modulescript', title: 'ModuleScript', kind: 'Class', where: 'Server en client',
    simple: 'Een script met herbruikbare code. Het doet pas iets als een ander script het met require() ophaalt.',
    when: 'Als meerdere scripts dezelfde functies of instellingen nodig hebben.',
    beginner: '-- ModuleScript "Prices" in ReplicatedStorage:\nlocal Prices = {\n    Zwaard = 100,\n    Schild = 80,\n}\nreturn Prices',
    advanced: '-- In een ander script:\nlocal ReplicatedStorage = game:GetService("ReplicatedStorage")\nlocal Prices = require(ReplicatedStorage.Prices)\nprint(Prices.Zwaard)',
    mistakes: ['De return aan het einde vergeten.', 'Verwachten dat een ModuleScript vanzelf draait.'],
    related: ['c0-script-types', 'Cursus 11: Geavanceerde Roblox-ontwikkeling'], docs: `${D}/classes/ModuleScript`,
  },
  {
    id: 'vector3', title: 'Vector3', kind: 'Datatype', where: 'Overal',
    simple: 'Drie getallen samen (X, Y, Z): een positie, grootte of richting in de 3D-wereld.',
    when: 'Voor Position, Size en afstanden.',
    beginner: 'part.Position = Vector3.new(0, 10, 0)\npart.Size = Vector3.new(4, 1, 4)',
    advanced: 'local distance = (playerPosition - part.Position).Magnitude\nif distance < 10 then\n    print("Dichtbij")\nend',
    mistakes: ['Eén waarde aanpassen met part.Position.Y = 5: dat mag niet, maak een nieuwe Vector3.'],
    related: ['Cursus 6: De Roblox-engine'], docs: `${D}/datatypes/Vector3`,
  },
  {
    id: 'cframe', title: 'CFrame', kind: 'Datatype', where: 'Overal',
    simple: 'Positie én draaiing samen. Hiermee zet en draai je onderdelen.',
    when: 'Als je iets wilt verplaatsen en draaien, of laten kijken naar een punt.',
    beginner: 'part.CFrame = CFrame.new(0, 10, 0)',
    advanced: '-- 90 graden draaien rond de Y-as:\npart.CFrame = part.CFrame * CFrame.Angles(0, math.rad(90), 0)\n-- Naar een doel kijken:\npart.CFrame = CFrame.lookAt(part.Position, target.Position)',
    mistakes: ['Graden gebruiken waar radialen nodig zijn: gebruik math.rad().'],
    related: ['Cursus 6: De Roblox-engine'], docs: `${D}/datatypes/CFrame`,
  },
  {
    id: 'color3', title: 'Color3', kind: 'Datatype', where: 'Overal',
    simple: 'Een kleur, gemaakt van rood, groen en blauw.',
    when: 'Voor de kleur van onderdelen en interfaces.',
    beginner: 'part.Color = Color3.fromRGB(255, 0, 0) -- rood (0 tot 255)',
    advanced: 'local a = Color3.new(1, 0, 0)          -- Color3.new gebruikt 0 tot 1!\nlocal b = Color3.fromHex("#527CFF")\nlocal mix = a:Lerp(b, 0.5)',
    mistakes: ['Color3.new(255, 0, 0) schrijven: Color3.new verwacht 0 tot 1. Gebruik fromRGB voor 0 tot 255.'],
    related: ['Project: kleurveranderend platform'], docs: `${D}/datatypes/Color3`,
  },
  {
    id: 'udim2', title: 'UDim2', kind: 'Datatype', where: 'Client',
    simple: 'Grootte of positie van een interface-element, in schaal (deel van het scherm) en pixels.',
    when: 'Voor Size en Position van Frames, knoppen en labels.',
    beginner: 'frame.Size = UDim2.fromScale(0.5, 0.3)   -- helft breed, 30% hoog\nbutton.Size = UDim2.fromOffset(200, 50)   -- 200 x 50 pixels',
    advanced: '-- UDim2.new(schaalX, pixelsX, schaalY, pixelsY)\nframe.Position = UDim2.new(0.5, -100, 1, -80)\nframe.AnchorPoint = Vector2.new(0.5, 0)',
    mistakes: ['Alleen pixels gebruiken: op een telefoon past je interface dan niet.'],
    related: ['Cursus 9: UI-scripting'], docs: `${D}/datatypes/UDim2`,
  },
];
