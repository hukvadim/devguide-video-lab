import React from 'react';
import {Composition, Folder} from 'remotion';
import {Motion} from './Motion';
import {Three} from './Three';
import {Vector} from './Vector';
import {Captions} from './Captions';
import {Hybrid} from './Hybrid';
import {IdeaToCode, IDEA_TO_CODE} from './dg/scenes/IdeaToCode';
import {PhoneScene} from './dg/scenes/PhoneScene';
import {Tracks, TRACKS} from './dg/scenes/Tracks';
import {Mentor, MENTOR} from './dg/scenes/Mentor';
import {Journey, JOURNEY} from './dg/scenes/Journey';
import {EndCard, END_CARD} from './dg/scenes/EndCard';
import {Final, FINAL_DURATION} from './dg/Final';
import {AltKinetic, ALT_A} from './dg/AltKinetic';
import {AltDepth, ALT_B} from './dg/AltDepth';
import {AltExplainer, ALT_C} from './dg/AltExplainer';
import {Day5Epic, DAY5_DURATION} from './dg/Day5Epic';
import {ResourcePost, ResourcePostStatic, POST_DURATION} from './dg/ResourcePost';
import {Idea001, Idea001Short, Idea001Thumb, IDEA_001, shortFrames} from './ideas/Idea001';
import './style.css';
const V = {width: 1080, height: 1920, fps: 30} as const;
export const Root:React.FC=()=> <>
<Folder name="DevGuide-Lab">
 <Composition id="DevGuide-Motion" component={Motion} width={1080} height={1920} fps={30} durationInFrames={900}/>
 <Composition id="DevGuide-Three" component={Three} width={1080} height={1920} fps={30} durationInFrames={900}/>
 <Composition id="DevGuide-Vector" component={Vector} width={1080} height={1920} fps={30} durationInFrames={900}/>
 <Composition id="DevGuide-Captions" component={Captions} width={1080} height={1920} fps={30} durationInFrames={900}/>
 <Composition id="DevGuide-Hybrid" component={Hybrid} width={1080} height={1920} fps={30} durationInFrames={900}/>
</Folder>
<Folder name="DevGuide-Pro">
 <Composition id="DevGuide-Final" component={Final} {...V} durationInFrames={FINAL_DURATION}/>
 <Composition id="DevGuide-Day5-Epic" component={Day5Epic} {...V} durationInFrames={DAY5_DURATION}/>
 <Composition id="DevGuide-A-Kinetic" component={AltKinetic} {...V} durationInFrames={ALT_A}/>
 <Composition id="DevGuide-B-Depth" component={AltDepth} {...V} durationInFrames={ALT_B}/>
 <Composition id="DevGuide-C-Explainer" component={AltExplainer} {...V} durationInFrames={ALT_C}/>
</Folder>
<Folder name="DevGuide-Posts">
 <Composition id="DevGuide-Resources5" component={ResourcePost} {...V} durationInFrames={POST_DURATION}/>
 <Composition id="DevGuide-Resources5-Static" component={ResourcePostStatic} width={1080} height={1350} fps={30} durationInFrames={1}/>
</Folder>
<Folder name="DevGuide-Scenes">
 <Composition id="Scene-IdeaToCode" component={IdeaToCode} {...V} durationInFrames={IDEA_TO_CODE}/>
 <Composition id="Scene-Phone" component={PhoneScene} {...V} durationInFrames={180}/>
 <Composition id="Scene-Tracks" component={Tracks} {...V} durationInFrames={TRACKS}/>
 <Composition id="Scene-Mentor" component={Mentor} {...V} durationInFrames={MENTOR}/>
 <Composition id="Scene-Journey" component={Journey} {...V} durationInFrames={JOURNEY}/>
 <Composition id="Scene-EndCard" component={EndCard} {...V} durationInFrames={END_CARD}/>
</Folder>
<Folder name="Ideas">
 <Composition id="Idea-001" component={Idea001} width={1920} height={1080} fps={30} durationInFrames={IDEA_001}/>
 <Composition id="Idea-001-Thumb" component={Idea001Thumb} width={1920} height={1080} fps={30} durationInFrames={1}/>
 {["1", "2", "3"].map((n) => <Composition key={n} id={`Idea-001-Short${n}`} component={Idea001Short} {...V} durationInFrames={shortFrames(n)} defaultProps={{n}}/>)}
</Folder>
</>;
