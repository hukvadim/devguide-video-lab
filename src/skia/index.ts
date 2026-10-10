// Separate entry point for the Skia experiment: the WASM binary must load before registerRoot().
// Render with: npx remotion render src/skia/index.ts DevGuide-Skia-Lab out/... --config=remotion.skia.config.ts
import {LoadSkia} from '@shopify/react-native-skia/lib/module/web';
import {registerRoot} from 'remotion';

(async () => {
	await LoadSkia();
	const {SkiaRoot} = await import('./Root');
	registerRoot(SkiaRoot);
})();
