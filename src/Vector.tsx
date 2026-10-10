import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {Lottie} from '@remotion/lottie';
import {evolvePath} from '@remotion/paths';
import orbit from './orbit.json';
import {Backdrop, FrameLabel, Sound, Title, CTA, colors} from './shared';
export const Vector:React.FC=()=>{
 const f=useCurrentFrame();
 const path='M 90 300 C 200 300 200 80 370 80 S 550 300 730 300';
 const draw=evolvePath(interpolate(f,[20,160],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}),path);
 return <Backdrop><FrameLabel label="SVG / LOTTIE"/>
  <div style={{position:'absolute',top:370,left:84,right:150}}><Title>Твій шлях<br/><span style={{color:colors.accent}}>у веброзробці.</span></Title></div>
  <svg width="920" height="480" viewBox="0 0 820 400" style={{position:'absolute',top:780,left:40}}>
   <path d={path} fill="none" stroke="#ffffff16" strokeWidth={14}/>
   <path d={path} fill="none" stroke={colors.accent} strokeWidth={14} strokeLinecap="round" strokeDasharray={draw.strokeDasharray} strokeDashoffset={draw.strokeDashoffset}/>
   {[['ІДЕЯ',90,300],['КОД',370,80],['ПРОЄКТ',730,300]].map(([label,x,y],i)=><g key={String(label)} opacity={interpolate(f,[20+i*45,40+i*45],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}><circle cx={Number(x)} cy={Number(y)} r={20} fill={colors.accent}/><text x={Number(x)} y={Number(y)+65} fill="white" fontSize={26} textAnchor="middle">{label}</text></g>)}
  </svg>
  <Lottie animationData={orbit} loop style={{position:'absolute',top:1100,left:360,width:360,height:360}}/>
  <div style={{position:'absolute',top:1470,left:84,right:150}}><CTA/></div><Sound/></Backdrop>;
};
