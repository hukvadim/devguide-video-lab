import React from 'react';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Sequence} from 'remotion';
import {Sound} from './shared';
import {Motion} from './Motion';
import {Three} from './Three';
import {Vector} from './Vector';
import {Captions} from './Captions';
// Four technology demonstrations, not the final AI-directed creative edit.
export const Hybrid:React.FC=()=> <><TransitionSeries>
 <TransitionSeries.Sequence durationInFrames={225}><Motion/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:15})}/>
 <TransitionSeries.Sequence durationInFrames={225}><Three/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:15})}/>
 <TransitionSeries.Sequence durationInFrames={225}><Vector/></TransitionSeries.Sequence>
 <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames:15})}/>
 <TransitionSeries.Sequence durationInFrames={270}><Sequence from={0}><Captions/></Sequence></TransitionSeries.Sequence>
</TransitionSeries><Sound force/></>;
