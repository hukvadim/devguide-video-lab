import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate, spring, useVideoConfig} from 'remotion';
import {useGsapTimeline} from '@remotion/gsap';
import {Backdrop, FrameLabel, Sound, Title, CTA, colors} from './shared';
const Beat:React.FC<{index:number}>=({index})=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 const ref=useGsapTimeline<HTMLDivElement>(({timeline,selector})=>{
  timeline.from(selector('[data-line]'),{y:90,opacity:0,rotation:3,stagger:.10,duration:.7,ease:'power3.out'})
   .from(selector('[data-card]'),{y:80,opacity:0,scale:.92,stagger:.12,duration:.65,ease:'back.out(1.2)'},.4);
 });
 const blocks=[['Дивишся','уроки?'],['Пиши код.','Створюй своє.'],['Разом','із ментором.'],['Від ідеї —','до проєкту.']];
 return <AbsoluteFill ref={ref} style={{padding:'420px 150px 330px 84px',justifyContent:'center'}}>
  <div style={{fontSize:25,color:colors.accent,letterSpacing:5,marginBottom:36}}>0{index+1} / ШЛЯХ РОЗРОБНИКА</div>
  <Title>{blocks[index].map((line,i)=><div data-line key={line} style={{color:i?colors.accent:colors.text}}>{line}</div>)}</Title>
  <div data-card style={{marginTop:70,padding:36,borderRadius:28,border:'1px solid #ffffff25',background:'#12181F',transform:`translateY(${Math.sin(f/35)*4}px)`}}>
   {index===0?<><div style={{fontSize:26,color:'#84909B'}}>ЗНАННЯ → ПРАКТИКА</div><div style={{height:10,background:'#ffffff15',borderRadius:5,marginTop:26}}><div style={{height:10,width:`${interpolate(f,[0,150],[3,100],{extrapolateRight:'clamp'})}%`,background:colors.accent,borderRadius:5}}/></div></>:index===1?<div style={{fontFamily:'monospace',fontSize:33,lineHeight:1.6,color:'#A8D9FF'}}>{'<Idea />'}<br/>{'→ <Project />'}<br/><span style={{color:colors.accent}}>npm run build</span></div>:index===2?<div style={{display:'flex',gap:20,flexWrap:'wrap'}}>{['HTML / CSS','JavaScript','React'].map((s,i)=><span key={s} style={{fontSize:27,padding:20,borderRadius:15,background:'#ffffff0c',opacity:spring({frame:f-i*12,fps})}}>{s}</span>)}</div>:<div style={{fontSize:38,lineHeight:1.4}}>Навчання веброзробки.<br/>Практика на власному проєкті.</div>}
  </div>
  {index===3?<div data-card><CTA/></div>:null}
 </AbsoluteFill>;
};
export const Motion:React.FC=()=> <Backdrop><FrameLabel label="MOTION / GSAP"/>{[0,1,2,3].map(i=><Sequence key={i} from={i*225} durationInFrames={225}><Beat index={i}/></Sequence>)}<Sound/></Backdrop>;
