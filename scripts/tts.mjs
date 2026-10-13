#!/usr/bin/env node
// Озвучка через ElevenLabs (docs/ELEVENLABS.md). Ключ лише з .env, без нових залежностей.
//   node scripts/tts.mjs public/ideas/sites-01            → voice.txt → voice.mp3 + words.json (+ словник показу words.mjs)
//   node scripts/tts.mjs "Текст" out/sites/_voice-test/a  → a.mp3 + a.words.json
//   node scripts/tts.mjs --file script.txt out/sites/_voice-test/01
//   node scripts/tts.mjs voices | models | credits        → голоси акаунта / моделі / залишок кредитів
//   node scripts/tts.mjs selftest
// .env: ELEVENLABS_API_KEY (обов'язково), ELEVENLABS_VOICE_ID, ELEVENLABS_MODEL,
//       ELEVENLABS_STABILITY / ELEVENLABS_SIMILARITY / ELEVENLABS_STYLE (0..1), ELEVENLABS_SPEED (0.7..1.2) — необов'язково
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
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
if (!key) { console.error('Потрібен ELEVENLABS_API_KEY у .env (docs/ELEVENLABS.md)'); process.exit(1); }
const api = async (p, init = {}) => {
  const res = await fetch(`https://api.elevenlabs.io${p}`, { ...init, headers: { 'xi-api-key': key, 'Content-Type': 'application/json' } });
  if (!res.ok) { console.error(`HTTP ${res.status}: ${await res.text()}`); process.exit(1); }
  return res.json();
};

if (args[0] === 'voices') {
  const { voices } = await api('/v1/voices');
  voices.forEach((v) => console.log(`${v.voice_id}  ${v.category.padEnd(12)} ${v.name}`));
  process.exit(0);
}
if (args[0] === 'models') {
  (await api('/v1/models')).filter((m) => m.can_do_text_to_speech).forEach((m) =>
    console.log(`${m.model_id.padEnd(28)} uk:${m.languages?.some((l) => l.language_id === 'uk') ? 'так' : 'ні'}  ${m.name}`));
  process.exit(0);
}
if (args[0] === 'credits') {
  const s = await api('/v1/user/subscription');
  console.log(`${s.tier}: використано ${s.character_count} з ${s.character_limit}, оновлення ${new Date(s.next_character_count_reset_unix * 1000).toISOString().slice(0, 10)}`);
  process.exit(0);
}

const ideaDir = args.length === 1 && fs.existsSync(path.join(args[0], 'voice.txt')) ? args[0] : null;
const text = ideaDir ? fs.readFileSync(path.join(ideaDir, 'voice.txt'), 'utf8').trim() : args[0] === '--file' ? fs.readFileSync(args[1], 'utf8').trim() : args[0];
const out = ideaDir ? path.join(ideaDir, 'voice') : args[0] === '--file' ? args[2] : args[1];
if (!text || !out) {
  console.error('usage: node scripts/tts.mjs <public/ideas/xxx> | "текст" <out-без-розширення> | --file <txt> <out> | voices | models | credits | selftest');
  process.exit(1);
}
// ponytail: голос за замовчуванням — стоковий з Voice Library; свій клон через ELEVENLABS_VOICE_ID
const voice = process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
const model = process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
const num = (k) => (process.env[k] ? Number(process.env[k]) : undefined);
const voice_settings = { stability: num('ELEVENLABS_STABILITY'), similarity_boost: num('ELEVENLABS_SIMILARITY'), style: num('ELEVENLABS_STYLE'), speed: num('ELEVENLABS_SPEED') };
console.log(`${text.length} символів → ${voice} / ${model} ${JSON.stringify(voice_settings)}`);

const data = await api(`/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`, {
  method: 'POST',
  // без жодного ELEVENLABS_* налаштування — збережені налаштування голосу в акаунті
  body: JSON.stringify({ text, model_id: model, ...(Object.values(voice_settings).some((v) => v != null) && { voice_settings }) }),
});
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(`${out}.mp3`, Buffer.from(data.audio_base64, 'base64'));
const wordsFile = ideaDir ? path.join(ideaDir, 'words.json') : `${out}.words.json`;
fs.writeFileSync(wordsFile, JSON.stringify(toWords(data.alignment), null, 1));
// фонетика «клод код» → «Claude Code» у субтитрах: той самий словник, що для голосу з UI
if (ideaDir) spawnSync(process.execPath, ['scripts/words.mjs', ideaDir, '--redisplay'], { stdio: 'inherit' });
console.log(`✓ ${out}.mp3, ${wordsFile}`);
