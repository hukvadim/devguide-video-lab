import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Backdrop, FrameLabel, Sound, Title, CTA, colors} from './shared';
const Sculpture:React.FC=()=>{
 const f=useCurrentFrame();
 return <group rotation={[.20+Math.sin(f/100)*.1,f*.008,-.12]}>
  <mesh><torusKnotGeometry args={[1.25,.29,120,16]}/><meshStandardMaterial color={colors.accent} metalness={.65} roughness={.22}/></mesh>
  {[0,1,2].map(i=><mesh key={i} rotation={[Math.PI/2,i*Math.PI/3,0]}><torusGeometry args={[2.05,.015,8,100]}/><meshStandardMaterial color={i===1?'#83CFFF':'#ffffff'} metalness={.4}/></mesh>)}
 </group>;
};
export const Three:React.FC=()=>{
 const f=useCurrentFrame();const {fps}=useVideoConfig();
 const opacity=interpolate(f,[0,30],[0,1],{extrapolateRight:'clamp'});
 return <Backdrop><AbsoluteFill style={{top:150,height:1060,opacity}}>
  <ThreeCanvas width={1080} height={1060} camera={{position:[0,0,7],fov:45}}>
   <ambientLight intensity={.7}/><directionalLight position={[3,4,5]} intensity={3}/><pointLight position={[-4,-2,3]} color="#8EDFFF" intensity={20}/><Sculpture/>
  </ThreeCanvas></AbsoluteFill>
  <FrameLabel label="THREE / 3D"/>
  <div style={{position:'absolute',left:84,right:150,top:1130,opacity:spring({frame:f-20,fps}),transform:`translateY(${(1-spring({frame:f-20,fps}))*60}px)`}}>
   <Title>Створи<br/><span style={{color:colors.accent}}>своє майбутнє.</span></Title>
   <p style={{fontSize:34,lineHeight:1.5}}>Веброзробка. Практика. Менторство.</p><CTA/>
  </div><Sound/></Backdrop>;
};
