/**
 * Languages the student can pick.
 * - 'human': written by people and shipped with the app (English, Dutch).
 * - 'machine': translated on the student's own computer by the free, offline M2M100 model
 *   (MIT licence, about 630 MB, downloaded once). Quality is decent for everyday text and
 *   weaker for technical words, so the app labels it "automatically translated".
 * Code, Luau keywords and expected program output are never translated.
 */
export interface Language {
  code: string; // M2M100 language code (also our id)
  name: string; // English name
  native: string; // name in the language itself
  quality: 'human' | 'machine';
  /** BCP-47 tag for the voice-over (speechSynthesis) and number formatting. */
  locale: string;
  rtl?: boolean;
}

const m = (code: string, name: string, native: string, locale: string, rtl = false): Language => ({ code, name, native, quality: 'machine', locale, rtl });

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', native: 'English', quality: 'human', locale: 'en-US' },
  { code: 'nl', name: 'Dutch', native: 'Nederlands', quality: 'human', locale: 'nl-NL' },
  m('af', 'Afrikaans', 'Afrikaans', 'af-ZA'),
  m('sq', 'Albanian', 'Shqip', 'sq-AL'),
  m('am', 'Amharic', 'አማርኛ', 'am-ET'),
  m('ar', 'Arabic', 'العربية', 'ar', true),
  m('hy', 'Armenian', 'Հայերեն', 'hy-AM'),
  m('az', 'Azerbaijani', 'Azərbaycanca', 'az-AZ'),
  m('be', 'Belarusian', 'Беларуская', 'be-BY'),
  m('bn', 'Bengali', 'বাংলা', 'bn-BD'),
  m('bs', 'Bosnian', 'Bosanski', 'bs-BA'),
  m('bg', 'Bulgarian', 'Български', 'bg-BG'),
  m('my', 'Burmese', 'မြန်မာ', 'my-MM'),
  m('ca', 'Catalan', 'Català', 'ca-ES'),
  m('ceb', 'Cebuano', 'Cebuano', 'ceb-PH'),
  m('zh', 'Chinese (Simplified)', '中文', 'zh-CN'),
  m('hr', 'Croatian', 'Hrvatski', 'hr-HR'),
  m('cs', 'Czech', 'Čeština', 'cs-CZ'),
  m('da', 'Danish', 'Dansk', 'da-DK'),
  m('et', 'Estonian', 'Eesti', 'et-EE'),
  m('fi', 'Finnish', 'Suomi', 'fi-FI'),
  m('fr', 'French', 'Français', 'fr-FR'),
  m('gl', 'Galician', 'Galego', 'gl-ES'),
  m('ka', 'Georgian', 'ქართული', 'ka-GE'),
  m('de', 'German', 'Deutsch', 'de-DE'),
  m('el', 'Greek', 'Ελληνικά', 'el-GR'),
  m('gu', 'Gujarati', 'ગુજરાતી', 'gu-IN'),
  m('ht', 'Haitian Creole', 'Kreyòl ayisyen', 'ht-HT'),
  m('ha', 'Hausa', 'Hausa', 'ha-NG'),
  m('he', 'Hebrew', 'עברית', 'he-IL', true),
  m('hi', 'Hindi', 'हिन्दी', 'hi-IN'),
  m('hu', 'Hungarian', 'Magyar', 'hu-HU'),
  m('is', 'Icelandic', 'Íslenska', 'is-IS'),
  m('ig', 'Igbo', 'Igbo', 'ig-NG'),
  m('id', 'Indonesian', 'Bahasa Indonesia', 'id-ID'),
  m('ga', 'Irish', 'Gaeilge', 'ga-IE'),
  m('it', 'Italian', 'Italiano', 'it-IT'),
  m('ja', 'Japanese', '日本語', 'ja-JP'),
  m('jv', 'Javanese', 'Basa Jawa', 'jv-ID'),
  m('kn', 'Kannada', 'ಕನ್ನಡ', 'kn-IN'),
  m('kk', 'Kazakh', 'Қазақша', 'kk-KZ'),
  m('km', 'Khmer', 'ខ្មែរ', 'km-KH'),
  m('ko', 'Korean', '한국어', 'ko-KR'),
  m('lo', 'Lao', 'ລາວ', 'lo-LA'),
  m('lv', 'Latvian', 'Latviešu', 'lv-LV'),
  m('lt', 'Lithuanian', 'Lietuvių', 'lt-LT'),
  m('lb', 'Luxembourgish', 'Lëtzebuergesch', 'lb-LU'),
  m('mk', 'Macedonian', 'Македонски', 'mk-MK'),
  m('mg', 'Malagasy', 'Malagasy', 'mg-MG'),
  m('ms', 'Malay', 'Bahasa Melayu', 'ms-MY'),
  m('ml', 'Malayalam', 'മലയാളം', 'ml-IN'),
  m('mr', 'Marathi', 'मराठी', 'mr-IN'),
  m('mn', 'Mongolian', 'Монгол', 'mn-MN'),
  m('ne', 'Nepali', 'नेपाली', 'ne-NP'),
  m('no', 'Norwegian', 'Norsk', 'nb-NO'),
  m('ps', 'Pashto', 'پښتو', 'ps-AF', true),
  m('fa', 'Persian', 'فارسی', 'fa-IR', true),
  m('pl', 'Polish', 'Polski', 'pl-PL'),
  m('pt', 'Portuguese', 'Português', 'pt-BR'),
  m('pa', 'Punjabi', 'ਪੰਜਾਬੀ', 'pa-IN'),
  m('ro', 'Romanian', 'Română', 'ro-RO'),
  m('ru', 'Russian', 'Русский', 'ru-RU'),
  m('sr', 'Serbian', 'Српски', 'sr-RS'),
  m('si', 'Sinhala', 'සිංහල', 'si-LK'),
  m('sk', 'Slovak', 'Slovenčina', 'sk-SK'),
  m('sl', 'Slovenian', 'Slovenščina', 'sl-SI'),
  m('so', 'Somali', 'Soomaali', 'so-SO'),
  m('es', 'Spanish', 'Español', 'es-ES'),
  m('su', 'Sundanese', 'Basa Sunda', 'su-ID'),
  m('sw', 'Swahili', 'Kiswahili', 'sw-KE'),
  m('sv', 'Swedish', 'Svenska', 'sv-SE'),
  m('tl', 'Tagalog (Filipino)', 'Tagalog', 'fil-PH'),
  m('ta', 'Tamil', 'தமிழ்', 'ta-IN'),
  m('th', 'Thai', 'ไทย', 'th-TH'),
  m('tr', 'Turkish', 'Türkçe', 'tr-TR'),
  m('uk', 'Ukrainian', 'Українська', 'uk-UA'),
  m('ur', 'Urdu', 'اردو', 'ur-PK', true),
  m('uz', 'Uzbek', 'Oʻzbekcha', 'uz-UZ'),
  m('vi', 'Vietnamese', 'Tiếng Việt', 'vi-VN'),
  m('cy', 'Welsh', 'Cymraeg', 'cy-GB'),
  m('xh', 'Xhosa', 'isiXhosa', 'xh-ZA'),
  m('yo', 'Yoruba', 'Yorùbá', 'yo-NG'),
  m('zu', 'Zulu', 'isiZulu', 'zu-ZA'),
];

export const LANGUAGE_BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));
export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code);
export const isMachineLanguage = (code: string) => LANGUAGE_BY_CODE.get(code)?.quality === 'machine';

/** Best match for an OS locale such as "nl-NL", "pt-BR" or "zh-Hans-CN". Falls back to English. */
export function languageFromLocale(locale: string | undefined | null): string {
  const base = (locale ?? '').toLowerCase().split(/[-_]/)[0];
  if (base === 'nb' || base === 'nn') return 'no';
  if (base === 'fil') return 'tl';
  if (base === 'iw') return 'he';
  return LANGUAGE_BY_CODE.has(base) ? base : 'en';
}
