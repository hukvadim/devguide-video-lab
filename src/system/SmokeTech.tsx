import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {RemotionRiveCanvas} from '@remotion/rive';
import {FadeIn} from '@/system/onda/fade-in/FadeIn';

// Smoke-тести встановлених технологій. Не для продакшну: rive-smoke.riv — публічний зразок Rive.
export const SMOKE_FRAMES = 90;

export const SmokeRive: React.FC = () => (
	<AbsoluteFill style={{background: '#0b1020'}}>
		<RemotionRiveCanvas src={staticFile('assets/rive-smoke.riv')} fit="contain" />
	</AbsoluteFill>
);

export const SmokeOnda: React.FC = () => (
	<AbsoluteFill style={{background: '#0b1020', justifyContent: 'center', alignItems: 'center'}}>
		<FadeIn kind="fade-in" delay={0} text="Onda fade-in" duration={18} align="center" fontFamily="Inter, sans-serif" fontSize={110} color="#F2F2F4" />
	</AbsoluteFill>
);
