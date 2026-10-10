import React from 'react';
import {Composition} from 'remotion';
import {SkiaLab, SKIA_LAB} from './SkiaLab';
import '../style.css';

export const SkiaRoot: React.FC = () => <Composition id="DevGuide-Skia-Lab" component={SkiaLab} width={1080} height={1920} fps={30} durationInFrames={SKIA_LAB} />;
