import path from 'node:path';
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind-v4';
import {enableSkia} from '@remotion/skia/enable';
// Used only for the Skia lab (src/skia/index.ts) so the main bundle stays untouched.
Config.setVideoImageFormat('jpeg');
Config.setChromiumOpenGlRenderer('angle');
Config.overrideWebpackConfig((config) => {
	const c = enableSkia(enableTailwind(config));
	return {...c, resolve: {...c.resolve, alias: {...(c.resolve?.alias as object), '@': path.join(process.cwd(), 'src')}}};
});
