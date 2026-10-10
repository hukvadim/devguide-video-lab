import React from 'react';
import {Composition, Folder} from 'remotion';
import {EndCard, END_CARD} from './system/EndCard';
import {Idea001, Idea001Short, Idea001Thumb, IDEA_001, shortFrames} from './ideas/Idea001';
import './style.css';
const V = {width: 1080, height: 1920, fps: 30} as const;
// одне відео = папка ID-xxx: головне (16:9), мініатюра й похідні шорти в Shorts/. Спільне — System/.
export const Root: React.FC = () => <>
<Folder name="ID-001">
 <Composition id="Idea-001" component={Idea001} width={1920} height={1080} fps={30} durationInFrames={IDEA_001}/>
 <Composition id="Idea-001-Thumb" component={Idea001Thumb} width={1920} height={1080} fps={30} durationInFrames={1}/>
 <Folder name="Shorts">
  {["1", "2", "3"].map((n) => <Composition key={n} id={`Idea-001-Short${n}`} component={Idea001Short} {...V} durationInFrames={shortFrames(n)} defaultProps={{n}}/>)}
 </Folder>
</Folder>
<Folder name="System">
 <Composition id="System-EndCard" component={EndCard} {...V} durationInFrames={END_CARD}/>
</Folder>
</>;
