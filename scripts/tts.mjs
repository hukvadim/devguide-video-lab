#!/usr/bin/env node
// Озвучка через ElevenLabs (docs/ELEVENLABS.md). Ключ лише з .env, без нових залежностей.
//   node scripts/tts.mjs "Текст" public/voice/test        → test.mp3 + test.words.json
//   node scripts/tts.mjs --file script.txt public/voice/step-06
//   node scripts/tts.mjs selftest
// .env: ELEVENLABS_API_KEY (обов'язково), ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL (необов'язково)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// символьне вирівнювання ElevenLabs → слова { w, s, e } (той самий вигляд, що й слова в Text.tsx скіла)
export function toWords({ characters, character_start_times_seconds: st, character_end_times_seconds: en }) {
  const words = [];
  let cur = null;
  characters.forEach((ch, i) => {
    if (/\s/.test(ch)) { cur = null; return; }
    if (!cur) words.push(cur = { w: '', s: st[i], e: en[i] });
    cur.w += ch;
    cur.e = en[i];
  });
  return words;
}

const args = process.argv.slice(2);
if (args[0] === 'selftest') {
  assert.deepEqual(toWords({ characters: [...'Привіт, світ'], character_start_times_seconds: [...Array(12).keys()], character_end_times_seconds: [...Array(12).keys()].map((x) => x + 0.5) }),
    [{ w: 'Привіт,', s: 0, e: 6.5 }, { w: 'світ', s: 8, e: 11.5 }]);
  console.log('selftest ok');
  process.exit(0);
}

try { process.loadEnvFile('.env'); } catch {}
const key = process.env.ELEVENLABS_API_KEY;
const text = args[0] === '--file' ? fs.readFileSync(args[1], 'utf8').trim() : args[0];
const out = args[0] === '--file' ? args[2] : args[1];
if (!key || !text || !out) {
  console.error('usage: node scripts/tts.mjs "текст" <out-без-розширення> | --file <txt> <out> | selftest\nПотрібен ELEVENLABS_API_KEY у .env');
  process.exit(1);
}
// ponytail: голос за замовчуванням — стоковий з Voice Library; замінити на свій клон через ELEVENLABS_VOICE_ID
const voice = process.env.ELEVENLABS_VOICE_ID ?? 'JBFqnCBsd6RMkjVDRZzb';
const model = process.env.ELEVENLABS_MODEL ?? 'eleven_multilingual_v2';
console.log(`${text.length} символів → ${voice} / ${model}`);

const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
  method: 'POST',
  headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ text, model_id: model }),
});
if (!res.ok) { console.error(`HTTP ${res.status}: ${await res.text()}`); process.exit(1); }
const data = await res.json();
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(`${out}.mp3`, Buffer.from(data.audio_base64, 'base64'));
fs.writeFileSync(`${out}.words.json`, JSON.stringify(toWords(data.alignment), null, 1));
console.log(`✓ ${out}.mp3, ${out}.words.json`);
