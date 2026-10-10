import React from 'react';
import {Series} from 'remotion';
import {Bgm} from './kit';
import {PhoneScene} from './scenes/PhoneScene';
import {Tracks} from './scenes/Tracks';
import {EndCard, END_CARD} from './scenes/EndCard';

// Alternative B — 30s premium 3D/2.5D: two Three.js phone shots with real devguide.com.ua screens
// (home: crane move, learning: orbit), a 2.5D tilted card deal, end card.
export const ALT_B = 900;

export const AltDepth: React.FC = () => (
	<>
		<Series>
			<Series.Sequence name="3D: головна" durationInFrames={240} premountFor={60}>
				<PhoneScene src="assets/site/home-mobile-clean.png" texAspect={2440 / 860} camera="crane" title={<>Гайди<br />й міні-курси</>} sub="devguide.com.ua" kicker="українською" duration={240} />
			</Series.Sequence>
			<Series.Sequence name="3D: шлях навчання" durationInFrames={240} premountFor={60}>
				<PhoneScene duration={240} />
			</Series.Sequence>
			<Series.Sequence name="2.5D: напрями" durationInFrames={180}>
				<Tracks tilt />
			</Series.Sequence>
			<Series.Sequence name="end" durationInFrames={END_CARD}>
				<EndCard fromLime={false} />
			</Series.Sequence>
		</Series>
		{/* drop lands on the learning-path reveal at f240 */}
		<Bgm offsetSec={29.55 - 240 / 30} total={ALT_B} vol={0.3} />
	</>
);
