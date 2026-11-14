/**
 * Optional AI Mentor (Claude). Only lesson content is sent: never personal data, progress or files.
 * The API key is stored encrypted with the OS (Electron safeStorage); without OS encryption it is not stored.
 */
import Anthropic from '@anthropic-ai/sdk';
import { MentorScene, type MentorRequest, type MentorScript } from '../../shared/mentor';
import { z } from 'zod';

export const AI_MODEL = 'claude-opus-5-5';

const SYSTEM = `Je bent "AI Mentor", een vriendelijke programmeerdocent in een Nederlandstalige app voor absolute beginners (vanaf ongeveer 10 jaar).
Je schrijft het script voor een korte geanimeerde uitlegvideo over één les. De app speelt het af: tekst wordt voorgelezen en ondertiteld, code wordt live uitgetypt en regels kunnen gemarkeerd worden.

Regels:
- Schrijf in eenvoudig, warm Nederlands. Korte zinnen. Leg elk technisch woord meteen uit.
- Gebruik voorbeelden uit games (Roblox, coins, levels, spelers).
- Geef NOOIT het antwoord op de oefeningen of kennisvragen van de les; verwijs ernaar als opdracht ("Probeer nu zelf ...").
- Code moet correct zijn in de taal van de les en kort blijven (maximaal 15 regels per codescène).
- 8 tot 18 scènes. Elke "say"/"text" is maximaal twee zinnen (max 400 tekens).
- Antwoord met ALLEEN geldige JSON, zonder uitleg eromheen, in deze vorm:
{"scenes":[
 {"kind":"title","title":"...","subtitle":"..."},
 {"kind":"say","text":"..."},
 {"kind":"code","code":"...","highlight":[1],"say":"...","typing":true},
 {"kind":"output","lines":["..."],"say":"..."},
 {"kind":"tip","text":"..."},
 {"kind":"recap","points":["...","..."]}
]}
De eerste scène is een "title", de laatste een "recap". "highlight" bevat regelnummers (vanaf 1) van de code in die scène.`;

const AiReply = z.object({ scenes: z.array(MentorScene).min(2).max(40) });

export interface KeyStore {
  available(): boolean;
  read(): string | null;
  write(key: string | null): void;
}

export class AiMentor {
  constructor(private keys: KeyStore) {}

  status() {
    return { configured: !!this.keys.read(), encryptionAvailable: this.keys.available(), model: AI_MODEL };
  }

  setKey(key: string | null) {
    if (key && !this.keys.available()) throw new Error('Windows-versleuteling is niet beschikbaar, daarom wordt de sleutel niet opgeslagen.');
    this.keys.write(key);
  }

  async script(req: MentorRequest): Promise<MentorScript> {
    const apiKey = this.keys.read();
    if (!apiKey) throw new Error('Er is nog geen AI-sleutel ingesteld (Instellingen → AI Tutor).');
    const client = new Anthropic({ apiKey, maxRetries: 2, timeout: 120_000 });
    const lang = req.language === 'luau' ? 'Luau (Roblox)' : req.language === 'cpp' ? 'C++' : 'Java';
    const user = `Taal van de les: ${lang}\nUitlegniveau: ${req.level === 'detailed' ? 'iets uitgebreider' : 'kort en bondig'}\n\nInhoud van de les:\n${req.content}`;

    let lastError = '';
    for (let attempt = 0; attempt < 2; attempt++) {
      let response: Anthropic.Beta.BetaMessage;
      try {
        response = await client.beta.messages.create({
          model: AI_MODEL,
          max_tokens: 16000,
          betas: ['server-side-fallback-2026-07-01'],
          fallbacks: 'default',
          output_config: { effort: 'medium' },
          system: SYSTEM,
          messages: [{ role: 'user', content: attempt === 0 ? user : `${user}\n\nJe vorige antwoord was geen geldige JSON volgens het formaat (${lastError}). Antwoord nu met alleen geldige JSON.` }],
        });
      } catch (e) {
        throw new Error(friendly(e));
      }
      if (response.stop_reason === 'refusal') throw new Error('De AI wilde deze uitleg niet maken. Gebruik de ingebouwde uitleg.');
      const text = response.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
      const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
      try {
        const parsed = AiReply.parse(JSON.parse(json));
        return { lessonId: req.lessonId, source: 'ai', language: req.language, scenes: parsed.scenes };
      } catch (e) {
        lastError = e instanceof z.ZodError ? e.issues.slice(0, 3).map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') : 'ongeldige JSON';
      }
    }
    throw new Error('De AI gaf een onbruikbaar antwoord. Probeer het opnieuw of gebruik de ingebouwde uitleg.');
  }
}

function friendly(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'De AI-sleutel klopt niet. Controleer hem in Instellingen → AI Tutor.';
  if (e instanceof Anthropic.PermissionDeniedError) return 'Deze AI-sleutel heeft geen toegang tot dit model.';
  if (e instanceof Anthropic.RateLimitError) return 'De AI is even te druk (of je tegoed is op). Probeer het over een minuut opnieuw.';
  if (e instanceof Anthropic.APIConnectionError) return 'Geen verbinding met de AI. Controleer je internet.';
  if (e instanceof Anthropic.APIError) return `De AI gaf een fout (${e.status ?? 'onbekend'}). Probeer het later opnieuw.`;
  return 'Er ging iets mis bij het maken van de AI-uitleg.';
}
