import path from 'node:path';
import {Config} from '@remotion/cli/config';
import {enableTailwind} from '@remotion/tailwind-v4';
Config.setVideoImageFormat('jpeg');
Config.setChromiumOpenGlRenderer('angle');
// '@/...' alias is used by snapcn components copied via shadcn (see components.json).
Config.overrideWebpackConfig((config) => {
	const c = enableTailwind(config);
	return {...c, resolve: {...c.resolve, alias: {...(c.resolve?.alias as object), '@': path.join(process.cwd(), 'src')}}};
});
