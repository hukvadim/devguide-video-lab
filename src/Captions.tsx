import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import type {Caption} from '@remotion/captions';
import {Backdrop, FrameLabel, Sound, Title, CTA, colors} from './shared';
const phrases=['Хочеш навчитися веброзробки?', 'Пиши код і створюй власний проєкт.', 'Рухайся далі разом із ментором.', 'Почни свій шлях із DevGuide.'];
// Editorial timecodes, NOT speech-aligned transcription. Replace after adding narration.
const captions:Caption[]=phrases.map((text,i)=>({text,startMs:i*7500,endMs:(i+1)*7500,timestampMs:null,confidence:null}));
export const Captions:React.FC=()=>{
 const f=useCurrentFrame(), ms=f/30*1000;
 const active=captions.find(c=>ms>=c.startMs&&ms<c.endMs)??captions[0];
 const index=captions.indexOf(active), local=f-index*225;
 return <Backdrop><FrameLabel label="CAPTIONS / TYPE"/>
  <div style={{position:'absolute',top:380,left:84,right:150}}><Title>Менше хаосу.<br/><span style={{color:colors.accent}}>Більше практики.</span></Title></div>
  <div style={{position:'absolute',top:950,left:84,right:150,fontSize:64,fontWeight:800,lineHeight:1.25}}>
   {active.text.split(' ').map((word,i)=><span key={`${index}-${i}`} style={{display:'inline-block',marginRight:18,color:local>i*12?colors.accent:'#61707A',opacity:interpolate(local,[i*7,i*7+10],[.25,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}}>{word}</span>)}
  </div><div style={{position:'absolute',top:1450,left:84,right:150}}><CTA/></div><Sound/></Backdrop>;
};
