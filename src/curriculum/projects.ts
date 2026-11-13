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
  difficulty: 'Beginner' | 'Gemiddeld' | 'Gevorderd';
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
    id: 'project-color-part', number: 1, title: 'Kleurveranderend onderdeel', difficulty: 'Beginner', available: true,
    description: 'Een Part dat blauw wordt wanneer je het aanraakt. Je eerste interactieve mechanisme.',
    learns: ['Parts', 'Scripts', 'Properties', 'Events (Touched)', 'Color3'],
    prerequisites: ['c0-first-studio-script', 'c1-variables'],
    setup: ['Een Baseplate in Roblox Studio met Explorer, Properties en Output open.'],
    scriptLocation: 'Een Script direct ín het Part "TrainingPart" (zodat script.Parent het Part is).',
    tasks: [
      {
        title: 'Het Part maken',
        body: 'Eerst bouw je het onderdeel, zonder code.',
        studio: [
          { text: 'Klik in het tabblad **Home** (of **Model**) op **Part** om een blok in Workspace te zetten.' },
          { text: 'Hernoem het in de Explorer naar **TrainingPart** (dubbelklik op de naam).' },
          { text: 'Zet in Properties **Anchored** aan, zodat het niet omvalt.' },
        ],
      },
      {
        title: 'De code schrijven',
        body: `Nieuw in dit project is een **event**: iets dat gebeurt in je game, zoals "iets raakt dit Part aan". Met \`:Connect(function() ... end)\` zeg je: als dit event gebeurt, voer dan deze code uit.

\`script.Parent\` is het onderdeel waar het script in zit: hier je TrainingPart.

Schrijf de code hieronder. Zet het Part met een variabele \`part\` vast, verbind het **Touched**-event, en geef \`part.Color\` de kleur \`Color3.fromRGB(0, 120, 255)\`.`,
        code: {
          starter: '-- Script in TrainingPart\nlocal part = script.Parent\n\n',
          checks: [
            { kind: 'uses', sequence: ['local', 'part', '=', 'script', '.', 'Parent'], message: 'Begin met `local part = script.Parent`.' },
            { kind: 'uses', sequence: ['part', '.', 'Touched', ':', 'Connect', '('], message: 'Verbind het event met `part.Touched:Connect(function() ... end)`.' },
            { kind: 'uses', sequence: ['part', '.', 'Color', '='], message: 'Geef binnen de functie `part.Color` een nieuwe waarde.' },
            { kind: 'uses', sequence: ['Color3', '.', 'fromRGB', '('], message: 'Maak de kleur met `Color3.fromRGB(0, 120, 255)`.' },
          ],
          hints: ['De vorm van een event: `part.Touched:Connect(function()` ... `end)`', 'Binnen de functie: `part.Color = Color3.fromRGB(0, 120, 255)`'],
          solution: 'local part = script.Parent\n\npart.Touched:Connect(function()\n    part.Color = Color3.fromRGB(0, 120, 255)\nend)',
        },
      },
      {
        title: 'In Studio zetten en testen',
        body: 'Nu zet je jouw code in Studio.',
        studio: [
          { text: 'Ga met je muis over **TrainingPart** in de Explorer, klik op **+** en kies **Script**.' },
          { text: 'Vervang de inhoud door jouw code van de vorige stap.' },
          { text: 'Klik op **Play** en loop met je avatar tegen het Part aan.' },
          { text: 'Controleer dat het Part blauw wordt, en dat de Output geen rode fouten toont.' },
        ],
      },
    ],
    testing: ['Het Part wordt blauw zodra je het aanraakt.', 'De Output toont geen rode foutmeldingen.'],
    mistakes: ['Het Script in ServerScriptService gezet: dan is script.Parent geen Part maar de service.', 'Color3.new(0, 120, 255) gebruikt: Color3.new verwacht waarden van 0 tot 1.', '`end)` vergeten aan het einde van de functie.'],
    done: 'Je eerste interactieve mechanisme werkt. Je gebruikte een event: de basis van bijna alles wat spelers in een game kunnen doen.',
  },
  { id: 'project-door', number: 2, title: 'Werkende deur', difficulty: 'Beginner', available: false, description: 'Een deur die opengaat met een ProximityPrompt en TweenService.', learns: ['ProximityPrompt', 'Events', 'TweenService', 'Status bijhouden'], prerequisites: [] },
  { id: 'project-coins', number: 3, title: 'Coins verzamelen', difficulty: 'Beginner', available: false, description: 'Munten die verdwijnen en coins geven als een speler ze aanraakt.', learns: ['Spelers herkennen', 'Variabelen', 'Events', 'Voortgang op de server'], prerequisites: [] },
  { id: 'project-shop', number: 4, title: 'Eenvoudige winkel', difficulty: 'Gemiddeld', available: false, description: 'Een koopknop die een RemoteEvent stuurt; de server controleert het saldo.', learns: ['Knoppen', 'RemoteEvents', 'Validatie op de server', 'Saldo controleren'], prerequisites: [] },
  { id: 'project-inventory', number: 5, title: 'Inventaris', difficulty: 'Gemiddeld', available: false, description: 'Een inventaris met tabellen, een ModuleScript en een interface.', learns: ['Tabellen', 'ModuleScripts', 'UI', 'Client en server samen'], prerequisites: [] },
  { id: 'project-obby', number: 6, title: 'Obby-systeem', difficulty: 'Gemiddeld', available: false, description: 'Checkpoints, respawnen en een timer.', learns: ['Checkpoints', 'Respawnen', 'Voortgang', 'Timers'], prerequisites: [] },
  { id: 'project-simulator', number: 7, title: 'Simpele simulator', difficulty: 'Gevorderd', available: false, description: 'Stats, upgrades en opgeslagen voortgang.', learns: ['Stats', 'Upgrades', 'Economie', 'Data opslaan'], prerequisites: [] },
  { id: 'project-rounds', number: 8, title: 'Ronde-gebaseerde multiplayer', difficulty: 'Gevorderd', available: false, description: 'Rondes, teams en een aftelling met een state machine.', learns: ['State machines', 'Teams', 'Aftellen', 'Spelers die komen en gaan'], prerequisites: [] },
  { id: 'project-tycoon', number: 9, title: 'Geavanceerde tycoon', difficulty: 'Gevorderd', available: false, description: 'Ontgrendelingen, veilige aankopen en modulaire code.', learns: ['Ontgrendelen', 'Modulaire architectuur', 'Veilige aankopen', 'Optimalisatie'], prerequisites: [] },
  { id: 'project-own-game', number: 10, title: 'Je eigen game', difficulty: 'Gevorderd', available: false, description: 'Je plant en bouwt zelf een game. De Academy begeleidt, maar schrijft hem niet voor je.', learns: ['Plannen', 'Alles uit eerdere cursussen'], prerequisites: [] },
];
