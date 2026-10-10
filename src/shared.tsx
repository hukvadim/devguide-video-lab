import React from 'react';
import {AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import brand from '../data/brand.json';
export const colors = brand.palette;
export const Backdrop: React.FC<{children?: React.ReactNode}> = ({children}) => {
 const f=useCurrentFrame();
 return <AbsoluteFill style={{background: colors.background, color: colors.text, overflow:'hidden',fontFamily:'Inter, Arial, sans-serif'}}>
  <AbsoluteFill style={{backgroundImage:'linear-gradient(#ffffff08 1px, transparent 1px),linear-gradient(90deg,#ffffff08 1px,transparent 1px)',backgroundSize:'80px 80px', transform:`translateY(${f*0.08}px)`}}/>
  <div style={{position:'absolute',width:850,height:850,borderRadius:'50%',background:'radial-gradient(circle,#C3FF5520,transparent 68%)',left:-300,top:150}}/>
  {children}
 </AbsoluteFill>;
};
export const FrameLabel: React.FC<{label:string}> = ({label}) => <>
 <div style={{position:'absolute',top:140,left:84,right:140,display:'flex',justifyContent:'space-between',fontSize:25,letterSpacing:3,color:colors.accent}}><b>DEVGUIDE</b><span>{label}</span></div>
 <div style={{position:'absolute',bottom:270,left:84,fontSize:26,color:'#ffffff88'}}>{brand.url}</div>
</>;
export const Sound:React.FC<{force?:boolean}>=({force=false})=> {const {id}=useVideoConfig(); if(id==='DevGuide-Hybrid'&&!force)return null; return <Audio src={staticFile('assets/lab-bed.wav')} volume={f=>interpolate(f,[0,30,840,900],[0,.35,.35,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}/>;};
export const Title:React.FC<{children:React.ReactNode}> = ({children}) => <div style={{fontSize:94,fontWeight:800,lineHeight:1.05,letterSpacing:-5}}>{children}</div>;
export const CTA:React.FC=()=> <div style={{marginTop:35,padding:'26px 34px',borderRadius:20,background:colors.accent,color:colors.background,fontWeight:800,fontSize:30,display:'inline-block'}}>{brand.cta} ↗</div>;
