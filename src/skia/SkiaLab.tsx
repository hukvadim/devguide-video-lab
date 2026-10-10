import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {SkiaCanvas} from '@remotion/skia';
import {Fill, Shader, Skia} from '@shopify/react-native-skia';
import {C, F, Sfx, clamp, easeInOut, ramp} from '../dg/kit';

// DevGuide-Skia-Lab, 10s. One SkSL runtime shader, every uniform driven by useCurrentFrame():
// topographic noise contours -> contours of a signed-distance "< >" mark -> filled lime symbol.
export const SKIA_LAB = 300;

const source = Skia.RuntimeEffect.Make(`
uniform float2 res;
uniform float t;
uniform float order;
uniform float fill;

float hash(float2 p) { return fract(sin(dot(p, float2(127.1, 311.7))) * 43758.5453); }
float vnoise(float2 p) {
  float2 i = floor(p); float2 f = fract(p);
  float2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + float2(1, 0)), u.x), mix(hash(i + float2(0, 1)), hash(i + float2(1, 1)), u.x), u.y);
}
float fbm(float2 p) { float s = 0.0; float a = 0.5; for (int k = 0; k < 4; k++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
float seg(float2 p, float2 a, float2 b) { float2 pa = p - a; float2 ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
float mark(float2 p) {
  float l = min(seg(p, float2(-0.12, 0.26), float2(-0.42, 0.0)), seg(p, float2(-0.42, 0.0), float2(-0.12, -0.26)));
  float r = min(seg(p, float2(0.12, 0.26), float2(0.42, 0.0)), seg(p, float2(0.42, 0.0), float2(0.12, -0.26)));
  return min(l, r) - 0.055;
}
half4 main(float2 xy) {
  float2 p = (xy - 0.5 * res) / res.x;
  p.y = -p.y;
  float n = fbm(p * 3.2 + float2(t * 0.15, -t * 0.1)) * 0.9;
  float d = mark(p / 0.72) * 0.72; // symbol inside the 84px safe margins
  float field = mix(n, d * 2.2, order);
  float lines = abs(fract(field * 14.0) - 0.5);

  float ink = 1.0 - smoothstep(0.025, 0.07, lines); // SkSL has no fwidth(): fixed line width
  float fade = mix(0.55, 1.0, order) * smoothstep(0.75, 0.0, length(p) * (1.0 - order * 0.35));
  float3 bg = float3(0.031, 0.043, 0.055);
  float3 lime = float3(0.765, 1.0, 0.333);
  float3 col = bg + lime * ink * fade * mix(0.35, 0.8, order);
  float solid = 1.0 - smoothstep(-0.004, 0.004, d);
  col = mix(col, lime, solid * fill);
  return half4(half3(col), 1.0);
}
`)!;

export const SkiaLab: React.FC = () => {
	const f = useCurrentFrame();
	const order = ramp(f, 60, 190, 0, 1, easeInOut);
	const fill = ramp(f, 196, 214);
	const text = ramp(f, 214, 236);
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<SkiaCanvas width={1080} height={1920}>
				<Fill>
					<Shader source={source} uniforms={{res: [1080, 1920], t: f / 30, order, fill}} />
				</Fill>
			</SkiaCanvas>
			<div style={{position: 'absolute', left: 84, right: 84, top: 1330, color: C.text, textAlign: 'center', opacity: text, transform: `translateY(${(1 - text) * 30}px)`}}>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 104, letterSpacing: -3}}>
					DEV<span style={{color: C.lime}}>GUIDE</span>
				</div>
				<div style={{marginTop: 20, fontSize: 48, color: '#C9D2D9'}}>Від хаосу — до коду.</div>
			</div>
			<div style={{position: 'absolute', left: 84, top: 190, fontFamily: F.mono, fontSize: 30, letterSpacing: 4, color: C.lime, opacity: interpolate(f, [0, 20, 260, 290], [0, 1, 1, 0], clamp)}}>SKIA · SKSL SHADER</div>
			<Sfx at={60} src="riser-procedural.wav" vol={0.4} dur={90} />
			<Sfx at={150} src="riser-procedural.wav" vol={0.5} dur={50} />
			<Sfx at={196} src="impact-movie-epic.mp3" vol={0.6} dur={100} />
		</AbsoluteFill>
	);
};
