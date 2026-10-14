import React from 'react';
import {Composition, Folder} from 'remotion';
import {EndCard, END_CARD} from './system/EndCard';
import {Idea001, Idea001Short, Idea001Thumb, IDEA_001, shortFrames} from './ideas/Idea001';
import {Idea002, Idea002Short, Idea002Thumb, IDEA_002, SHORT_FRAMES} from './ideas/Idea002';
import {Idea004, IDEA_004} from './ideas/Idea004';
import {Idea005, IDEA_005} from './ideas/Idea005';
import {Idea006, IDEA_006} from './ideas/Idea006';
import {Idea007, IDEA_007} from './ideas/Idea007';
import {Idea008, IDEA_008} from './ideas/Idea008';
import {Idea009, IDEA_009} from './ideas/Idea009';
import {Idea010, IDEA_010} from './ideas/Idea010';
import {Idea011, IDEA_011} from './ideas/Idea011';
import {Idea012, IDEA_012} from './ideas/Idea012';
import {Idea013, IDEA_013} from './ideas/Idea013';
import {Idea014, IDEA_014} from './ideas/Idea014';
import {Idea015, IDEA_015} from './ideas/Idea015';
import {Idea016, IDEA_016} from './ideas/Idea016';
import {Sites01, Sites01Wide, SITES_01} from './ideas/Sites01';
import {Sites02, Sites02Wide, SITES_02} from './ideas/Sites02';
import {Sites03, Sites03Wide, SITES_03} from './ideas/Sites03';
import {Sites04, Sites04Wide, SITES_04} from './ideas/Sites04';
import {Sites05, Sites05Wide, SITES_05} from './ideas/Sites05';
import {Sites06, Sites06Wide, SITES_06} from './ideas/Sites06';
import {Sites07, Sites07Wide, SITES_07} from './ideas/Sites07';
import {Sites09, Sites09Wide, SITES_09} from './ideas/Sites09';
import {Sites10, Sites10Wide, SITES_10} from './ideas/Sites10';
import {Sites11, Sites11Wide, SITES_11} from './ideas/Sites11';
import {Sites12, Sites12Wide, SITES_12} from './ideas/Sites12';
import {Sites13, Sites13Wide, SITES_13} from './ideas/Sites13';
import {Sites14, Sites14Wide, SITES_14} from './ideas/Sites14';
import {Sites15, Sites15Wide, SITES_15} from './ideas/Sites15';
import {Sites16, Sites16Wide, SITES_16} from './ideas/Sites16';
import {Sites20, Sites20Wide, SITES_20} from './ideas/Sites20';
import {Sites21, Sites21Wide, SITES_21} from './ideas/Sites21';
import {Sites22, Sites22Wide, SITES_22} from './ideas/Sites22';
import {AdsA, AdsAVoice, AdsAVoice45, AdsB, AdsBVoice, AdsBVoice45, AdsBanner, ADS_A, ADS_A_VOICE, ADS_B, ADS_B_VOICE} from './ideas/Ads';
import {Insta50Cover} from './ideas/Insta50Cover';
import {StepPreview} from './system/step';
import {LAB, LAB_FRAMES} from './lab/Lab';
import {TIPS_LIST} from './tips/Tips';
import './style.css';
const V = {width: 1080, height: 1920, fps: 30} as const;
// шлях «Claude / AI»: один шорт на крок (ID-004…), спільне — src/system/step.tsx
const STEPS: [string, React.FC, number][] = [['004', Idea004, IDEA_004], ['005', Idea005, IDEA_005], ['006', Idea006, IDEA_006], ['007', Idea007, IDEA_007], ['008', Idea008, IDEA_008], ['009', Idea009, IDEA_009], ['010', Idea010, IDEA_010], ['011', Idea011, IDEA_011], ['012', Idea012, IDEA_012], ['013', Idea013, IDEA_013], ['014', Idea014, IDEA_014], ['015', Idea015, IDEA_015], ['016', Idea016, IDEA_016]];
// одне відео = папка ID-xxx: головне (16:9), мініатюра й похідні шорти в Shorts/. Спільне — System/.
export const Root: React.FC = () => <>
<Folder name="ID-001">
 <Composition id="Idea-001" component={Idea001} width={1920} height={1080} fps={30} durationInFrames={IDEA_001}/>
 <Composition id="Idea-001-Thumb" component={Idea001Thumb} width={1920} height={1080} fps={30} durationInFrames={1}/>
 <Folder name="Shorts">
  {["1", "2", "3"].map((n) => <Composition key={n} id={`Idea-001-Short${n}`} component={Idea001Short} {...V} durationInFrames={shortFrames(n)} defaultProps={{n}}/>)}
 </Folder>
</Folder>
 <Folder name="ID-002">
 <Composition id="Idea-002" component={Idea002} width={1920} height={1080} fps={30} durationInFrames={IDEA_002}/>
 <Composition id="Idea-002-Thumb" component={Idea002Thumb} width={1920} height={1080} fps={30} durationInFrames={1}/>
 <Folder name="Shorts">
  <Composition id="Idea-002-Short1" component={Idea002Short} {...V} durationInFrames={SHORT_FRAMES}/>
 </Folder>
</Folder>
{/* шлях «Сайти»: Sites-NN = крок NN (C:/DevGuide/helpers/websites-videos), seed — вигляд рендеру (палітра + рух), у Studio міняй seed у props */}
<Folder name="Sites">
	<Composition id="Sites-01" component={Sites01} {...V} durationInFrames={SITES_01} defaultProps={{seed: 0}}/>
	<Composition id="Sites-01-Wide" component={Sites01Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_01} defaultProps={{seed: 0, kicker: 'Крок 1 · Організація'}}/>
	<Composition id="Sites-02" component={Sites02} {...V} durationInFrames={SITES_02} defaultProps={{seed: 0}}/>
	<Composition id="Sites-02-Wide" component={Sites02Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_02} defaultProps={{seed: 0, kicker: 'Крок 2 · Організація'}}/>
	<Composition id="Sites-03" component={Sites03} {...V} durationInFrames={SITES_03} defaultProps={{seed: 0}}/>
	<Composition id="Sites-03-Wide" component={Sites03Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_03} defaultProps={{seed: 0, kicker: 'Крок 3 · Організація'}}/>
	<Composition id="Sites-04" component={Sites04} {...V} durationInFrames={SITES_04} defaultProps={{seed: 0}}/>
	<Composition id="Sites-04-Wide" component={Sites04Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_04} defaultProps={{seed: 0, kicker: 'Крок 4 · Організація'}}/>
	<Composition id="Sites-05" component={Sites05} {...V} durationInFrames={SITES_05} defaultProps={{seed: 0}}/>
	<Composition id="Sites-05-Wide" component={Sites05Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_05} defaultProps={{seed: 0, kicker: 'Крок 5 · Організація'}}/>
	<Composition id="Sites-06" component={Sites06} {...V} durationInFrames={SITES_06} defaultProps={{seed: 0}}/>
	<Composition id="Sites-06-Wide" component={Sites06Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_06} defaultProps={{seed: 0, kicker: 'Крок 6 · Організація'}}/>
	<Composition id="Sites-07" component={Sites07} {...V} durationInFrames={SITES_07} defaultProps={{seed: 0}}/>
	<Composition id="Sites-07-Wide" component={Sites07Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_07} defaultProps={{seed: 0, kicker: 'Крок 7 · Організація'}}/>
	<Composition id="Sites-09" component={Sites09} {...V} durationInFrames={SITES_09} defaultProps={{seed: 0}}/>
	<Composition id="Sites-09-Wide" component={Sites09Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_09} defaultProps={{seed: 0, kicker: 'Крок 9 · Імітація клієнта'}}/>
	<Composition id="Sites-10" component={Sites10} {...V} durationInFrames={SITES_10} defaultProps={{seed: 0}}/>
	<Composition id="Sites-10-Wide" component={Sites10Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_10} defaultProps={{seed: 0, kicker: 'Крок 10 · ТЗ'}}/>
	<Composition id="Sites-11" component={Sites11} {...V} durationInFrames={SITES_11} defaultProps={{seed: 0}}/>
	<Composition id="Sites-11-Wide" component={Sites11Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_11} defaultProps={{seed: 0, kicker: 'Крок 11 · ТЗ'}}/>
	<Composition id="Sites-12" component={Sites12} {...V} durationInFrames={SITES_12} defaultProps={{seed: 0}}/>
	<Composition id="Sites-12-Wide" component={Sites12Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_12} defaultProps={{seed: 0, kicker: 'Крок 12 · Розробка'}}/>
	<Composition id="Sites-13" component={Sites13} {...V} durationInFrames={SITES_13} defaultProps={{seed: 0}}/>
	<Composition id="Sites-13-Wide" component={Sites13Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_13} defaultProps={{seed: 0, kicker: 'Крок 13 · Розробка'}}/>
	<Composition id="Sites-14" component={Sites14} {...V} durationInFrames={SITES_14} defaultProps={{seed: 0}}/>
	<Composition id="Sites-14-Wide" component={Sites14Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_14} defaultProps={{seed: 0, kicker: 'Крок 14 · Розробка'}}/>
	<Composition id="Sites-15" component={Sites15} {...V} durationInFrames={SITES_15} defaultProps={{seed: 0}}/>
	<Composition id="Sites-15-Wide" component={Sites15Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_15} defaultProps={{seed: 0, kicker: 'Крок 15 · Розробка'}}/>
	<Composition id="Sites-16" component={Sites16} {...V} durationInFrames={SITES_16} defaultProps={{seed: 0}}/>
	<Composition id="Sites-16-Wide" component={Sites16Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_16} defaultProps={{seed: 0, kicker: 'Крок 16 · Правки'}}/>
	<Composition id="Sites-20" component={Sites20} {...V} durationInFrames={SITES_20} defaultProps={{seed: 0}}/>
	<Composition id="Sites-20-Wide" component={Sites20Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_20} defaultProps={{seed: 0, kicker: 'Крок 20 · Запуск'}}/>
	<Composition id="Sites-21" component={Sites21} {...V} durationInFrames={SITES_21} defaultProps={{seed: 0}}/>
	<Composition id="Sites-21-Wide" component={Sites21Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_21} defaultProps={{seed: 0, kicker: 'Крок 21 · Запуск'}}/>
	<Composition id="Sites-22" component={Sites22} {...V} durationInFrames={SITES_22} defaultProps={{seed: 0}}/>
	<Composition id="Sites-22-Wide" component={Sites22Wide} width={1920} height={1080} fps={30} durationInFrames={SITES_22} defaultProps={{seed: 0, kicker: 'Крок 22 · Запуск'}}/>
</Folder>
{STEPS.map(([n, C, d]) => <Folder key={n} name={`ID-${n}`}><Composition id={`Idea-${n}`} component={C} {...V} durationInFrames={d}/></Folder>)}
{/* Meta-реклама менторства: ADS/, src/ideas/Ads.tsx */}
{/* Банк «50 ідей рілсів без зйомки»: обкладинки docs/insta-50/NN-slug/cover.png (node scripts/insta50.mjs) */}
<Composition id="Insta50-Cover" component={Insta50Cover} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{n: 1, layout: 'number', theme: 'light', title: '5 промптів на щодень', sub: 'економлять годину', num: '5', cta: 'ПРОМПТ', account: 'особистий'} as const}/>
<Folder name="ADS">
 <Composition id="Ads-A-Abroad" component={AdsA} {...V} durationInFrames={ADS_A}/>
 <Composition id="Ads-A-Voice" component={AdsAVoice} {...V} durationInFrames={ADS_A_VOICE}/>
 <Composition id="Ads-B-Voice" component={AdsBVoice} {...V} durationInFrames={ADS_B_VOICE}/>
 <Composition id="Ads-A-Voice-45" component={AdsAVoice45} width={1080} height={1350} fps={30} durationInFrames={ADS_A_VOICE}/>
 <Composition id="Ads-B-Voice-45" component={AdsBVoice45} width={1080} height={1350} fps={30} durationInFrames={ADS_B_VOICE}/>
 <Composition id="Ads-Banner-45" component={AdsBanner} width={1080} height={1350} fps={30} durationInFrames={1}/>
 <Composition id="Ads-Banner-Story" component={AdsBanner} width={1080} height={1920} fps={30} durationInFrames={1} defaultProps={{h: 1920}}/>
 <Composition id="Ads-B-Business" component={AdsB} {...V} durationInFrames={ADS_B}/>
</Folder>
<Folder name="Lab">
 {Object.entries(LAB).map(([n, C]) => <Composition key={n} id={`Lab-${n.padStart(2, "0")}`} component={C} {...V} durationInFrames={LAB_FRAMES[+n]}/>)}
</Folder>
{/* «Секретні коди»: корисності без голосу для Instagram, src/tips/Tips.tsx + data/tips.json */}
<Folder name="Tips">
 {TIPS_LIST.map(({id, C, frames}) => <Composition key={id} id={`Tips-${id}`} component={C} {...V} durationInFrames={frames}/>)}
</Folder>
<Folder name="System">
 <Composition id="System-Step" component={StepPreview} {...V} durationInFrames={420}/>
 <Composition id="System-EndCard" component={EndCard} {...V} durationInFrames={END_CARD}/>
</Folder>
</>;
