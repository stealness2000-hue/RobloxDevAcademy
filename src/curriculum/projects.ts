import type { Check } from '@shared/evaluator';

export interface ProjectTask {
  title: string;
  body: string;
  /** Code the student writes; checked STATICALLY (Roblox code cannot run outside Studio). */
  code?: { starter: string; checks: Check[]; hints: string[]; solution: string };
  studio?: { text: string; detail?: string }[];
}

export interface Project {
  id: string;
  number: number;
  title: string;
  difficulty: string; // Beginner | Intermediate | Advanced
  description: string;
  learns: string[];
  prerequisites: string[]; // lesson ids
  available: boolean;
  setup?: string[];
  scriptLocation?: string;
  tasks?: ProjectTask[];
  testing?: string[];
  mistakes?: string[];
  done?: string;
}

export const PROJECTS: Project[] = [
  {
    id: 'project-color-part', number: 1, title: 'Color-changing part', difficulty: 'Beginner', available: true,
    description: 'A Part that turns blue when you touch it. Your first interactive mechanic.',
    learns: ['Parts', 'Scripts', 'Properties', 'Events (Touched)', 'Color3'],
    prerequisites: ['c0-first-studio-script', 'c1-variables'],
    setup: ['A Baseplate in Roblox Studio with Explorer, Properties and Output open.'],
    scriptLocation: 'A Script directly inside the Part "TrainingPart" (so script.Parent is the Part).',
    tasks: [
      {
        title: 'Making the Part',
        body: 'First you build the part, without code.',
        studio: [
          { text: 'In the **Home** (or **Model**) tab, click **Part** to put a block in Workspace.' },
          { text: 'Rename it to **TrainingPart** in the Explorer (double-click the name).' },
          { text: 'Turn on **Anchored** in Properties, so it does not fall over.' },
        ],
      },
      {
        title: 'Writing the code',
        body: `New in this project is an **event**: something that happens in your game, like "something touches this Part". With \`:Connect(function() ... end)\` you say: when this event happens, run this code.

\`script.Parent\` is the part the script is inside: here your TrainingPart.

Write the code below. Store the Part in a variable \`part\`, connect the **Touched** event, and give \`part.Color\` the colour \`Color3.fromRGB(0, 120, 255)\`.`,
        code: {
          starter: '-- Script in TrainingPart\nlocal part = script.Parent\n\n',
          checks: [
            { kind: 'uses', sequence: ['local', 'part', '=', 'script', '.', 'Parent'], message: 'Start with `local part = script.Parent`.' },
            { kind: 'uses', sequence: ['part', '.', 'Touched', ':', 'Connect', '('], message: 'Connect the event with `part.Touched:Connect(function() ... end)`.' },
            { kind: 'uses', sequence: ['part', '.', 'Color', '='], message: 'Inside the function, give `part.Color` a new value.' },
            { kind: 'uses', sequence: ['Color3', '.', 'fromRGB', '('], message: 'Make the colour with `Color3.fromRGB(0, 120, 255)`.' },
          ],
          hints: ['The shape of an event: `part.Touched:Connect(function()` ... `end)`', 'Inside the function: `part.Color = Color3.fromRGB(0, 120, 255)`'],
          solution: 'local part = script.Parent\n\npart.Touched:Connect(function()\n    part.Color = Color3.fromRGB(0, 120, 255)\nend)',
        },
      },
      {
        title: 'Putting it in Studio and testing',
        body: 'Now you put your code into Studio.',
        studio: [
          { text: 'Hover over **TrainingPart** in the Explorer, click **+** and choose **Script**.' },
          { text: 'Replace its content with your code from the previous step.' },
          { text: 'Click **Play** and walk into the Part with your avatar.' },
          { text: 'Check that the Part turns blue, and that the Output shows no red errors.' },
        ],
      },
    ],
    testing: ['The Part turns blue as soon as you touch it.', 'The Output shows no red error messages.'],
    mistakes: ['Putting the Script in ServerScriptService: then script.Parent is not a Part but the service.', 'Using Color3.new(0, 120, 255): Color3.new expects values from 0 to 1.', 'Forgetting `end)` at the end of the function.'],
    done: 'Your first interactive mechanic works. You used an event: the basis of almost everything players can do in a game.',
  },
  { id: 'project-door', number: 2, title: 'Working door', difficulty: 'Beginner', available: false, description: 'A door that opens with a ProximityPrompt and TweenService.', learns: ['ProximityPrompt', 'Events', 'TweenService', 'Keeping state'], prerequisites: [] },
  { id: 'project-coins', number: 3, title: 'Collecting coins', difficulty: 'Beginner', available: false, description: 'Coins that disappear and give currency when a player touches them.', learns: ['Recognising players', 'Variables', 'Events', 'Progress on the server'], prerequisites: [] },
  { id: 'project-shop', number: 4, title: 'Simple shop', difficulty: 'Intermediate', available: false, description: 'A buy button that sends a RemoteEvent; the server checks the balance.', learns: ['Buttons', 'RemoteEvents', 'Validation on the server', 'Checking the balance'], prerequisites: [] },
  { id: 'project-inventory', number: 5, title: 'Inventory', difficulty: 'Intermediate', available: false, description: 'An inventory with tables, a ModuleScript and an interface.', learns: ['Tables', 'ModuleScripts', 'UI', 'Client and server together'], prerequisites: [] },
  { id: 'project-obby', number: 6, title: 'Obby system', difficulty: 'Intermediate', available: false, description: 'Checkpoints, respawning and a timer.', learns: ['Checkpoints', 'Respawning', 'Progress', 'Timers'], prerequisites: [] },
  { id: 'project-simulator', number: 7, title: 'Simple simulator', difficulty: 'Advanced', available: false, description: 'Stats, upgrades and saved progress.', learns: ['Stats', 'Upgrades', 'Economy', 'Saving data'], prerequisites: [] },
  { id: 'project-rounds', number: 8, title: 'Round-based multiplayer', difficulty: 'Advanced', available: false, description: 'Rounds, teams and a countdown with a state machine.', learns: ['State machines', 'Teams', 'Countdowns', 'Players joining and leaving'], prerequisites: [] },
  { id: 'project-tycoon', number: 9, title: 'Advanced tycoon', difficulty: 'Advanced', available: false, description: 'Unlocks, safe purchases and modular code.', learns: ['Unlocking', 'Modular architecture', 'Safe purchases', 'Optimisation'], prerequisites: [] },
  { id: 'project-own-game', number: 10, title: 'Your own game', difficulty: 'Advanced', available: false, description: 'You plan and build a game yourself. The Academy guides you, but does not write it for you.', learns: ['Planning', 'Everything from earlier courses'], prerequisites: [] },
];
