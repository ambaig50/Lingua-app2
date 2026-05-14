export const LANGUAGES = [
  { name: 'Arabic',     code: 'ar' },
  { name: 'Chinese',    code: 'zh' },
  { name: 'French',     code: 'fr' },
  { name: 'German',     code: 'de' },
  { name: 'Hindi',      code: 'hi' },
  { name: 'Italian',    code: 'it' },
  { name: 'Japanese',   code: 'ja' },
  { name: 'Korean',     code: 'ko' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Russian',    code: 'ru' },
  { name: 'Spanish',    code: 'es' },
  { name: 'Turkish',    code: 'tr' },
  { name: 'Urdu',       code: 'ur' },
];

export const LANGUAGE_NAMES = LANGUAGES.map(l => l.name);

export async function translateText(text: string, targetLang: string): Promise<string> {
  const lang = LANGUAGES.find(l => l.name === targetLang);
  const tgt = lang?.code ?? 'es';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tgt}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Translation failed');
  const data = await res.json();
  return data[0].map((chunk: any[]) => chunk[0]).join('');
}
