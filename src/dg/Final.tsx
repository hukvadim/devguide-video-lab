import React from 'react';
import {Series} from 'remotion';
import {Bgm} from './kit';
import {IdeaToCode, IDEA_TO_CODE} from './scenes/IdeaToCode';
import {PhoneScene} from './scenes/PhoneScene';
import {Tracks, TRACKS} from './scenes/Tracks';
import {Mentor, MENTOR} from './scenes/Mentor';
import {Journey, JOURNEY} from './scenes/Journey';
import {EndCard, END_CARD} from './scenes/EndCard';

// DevGuide-Final, 38s. Hard cuts are motivated inside each scene (push-in, iris, slide);
// the music drop (cat-walk.mp3 @ 29.55s) is pinned to the 3D phone reveal at f270.
export const FINAL_DURATION = IDEA_TO_CODE + 180 + TRACKS + MENTOR + JOURNEY + END_CARD;
const DROP_FRAME = IDEA_TO_CODE;
const DROP_IN_TRACK = 29.55;

export const Final: React.FC = () => (
	<>
		<Series>
			<Series.Sequence name="Hook: ІДЕЯ -> код" durationInFrames={IDEA_TO_CODE} premountFor={30}>
				<IdeaToCode />
			</Series.Sequence>
			<Series.Sequence name="3D: шлях навчання" durationInFrames={180} premountFor={60}>
				<PhoneScene />
			</Series.Sequence>
			<Series.Sequence name="8 напрямів" durationInFrames={TRACKS} premountFor={30}>
				<Tracks />
			</Series.Sequence>
			<Series.Sequence name="Ментор" durationInFrames={MENTOR} premountFor={30}>
				<Mentor />
			</Series.Sequence>
			<Series.Sequence name="Шлях" durationInFrames={JOURNEY} premountFor={30}>
				<Journey />
			</Series.Sequence>
			<Series.Sequence name="End card" durationInFrames={END_CARD} premountFor={30}>
				<EndCard />
			</Series.Sequence>
		</Series>
		<Bgm offsetSec={DROP_IN_TRACK - DROP_FRAME / 30} total={FINAL_DURATION} vol={0.3} fadeIn={40} fadeOut={90} />
	</>
);
