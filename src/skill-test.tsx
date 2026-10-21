import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {SKILL_TESTS} from './ideas/SkillTest';
import './style.css';

// Окремий вхід лише для SKILL-TEST: основний Root зараз не збирається (у робочій копії видалено public/ideas/ematbox*,
// а src/ideas/Ematbox*.tsx ще імпортуються). Рендер: npx remotion render src/skill-test.tsx SkillTest-<Id> ...
const V = {width: 1080, height: 1920, fps: 30} as const;
registerRoot(() => <>{SKILL_TESTS.map(({id, C, frames}) => <Composition key={id} id={`SkillTest-${id}`} component={C} {...V} durationInFrames={frames} />)}</>);
