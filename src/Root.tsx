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
import {Sites01, SITES_01} from './ideas/Sites01';
import {AdsA, AdsAVoice, AdsAVoice45, AdsB, AdsBVoice, AdsBVoice45, AdsBanner, ADS_A, ADS_A_VOICE, ADS_B, ADS_B_VOICE} from './ideas/Ads';
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
</Folder>
{STEPS.map(([n, C, d]) => <Folder key={n} name={`ID-${n}`}><Composition id={`Idea-${n}`} component={C} {...V} durationInFrames={d}/></Folder>)}
{/* Meta-реклама менторства: ADS/, src/ideas/Ads.tsx */}
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
