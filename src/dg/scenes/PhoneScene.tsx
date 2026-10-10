import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';
import {C, F, Kicker, Sfx, Stage, clamp, easeInOut, ramp} from '../kit';

// Real devguide.com.ua screenshot (captured 2026-10-09, see data/brand.json) on a 3D phone.
// All motion is a function of useCurrentFrame(); no useFrame loop.

const W = 3.0;
const H = 6.3;
const D = 0.3;
const R = 0.46;

const roundedRect = (w: number, h: number, r: number) => {
	const s = new THREE.Shape();
	const x = -w / 2;
	const y = -h / 2;
	s.moveTo(x + r, y);
	s.lineTo(x + w - r, y);
	s.quadraticCurveTo(x + w, y, x + w, y + r);
	s.lineTo(x + w, y + h - r);
	s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
	s.lineTo(x + r, y + h);
	s.quadraticCurveTo(x, y + h, x, y + h - r);
	s.lineTo(x, y + r);
	s.quadraticCurveTo(x, y, x + r, y);
	return s;
};

// ShapeGeometry UVs are in shape units; remap to 0..1 so the texture fills the screen.
const screenGeometry = (w: number, h: number, r: number) => {
	const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 24);
	const pos = g.attributes.position;
	const uv = g.attributes.uv;
	for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
	uv.needsUpdate = true;
	return g;
};

const Phone: React.FC<{src: string; texAspect: number; scroll: number; rot: [number, number, number]; pos: [number, number, number]}> = ({src, texAspect, scroll, rot, pos}) => {
	// Suspends inside <ThreeCanvas>, whose Suspense boundary holds the render via delayRender.
	const loaded = useLoader(THREE.TextureLoader, staticFile(src));
	const tex = useMemo(() => {
		const t = loaded.clone();
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = 8;
		t.needsUpdate = true;
		return t;
	}, [loaded]);
	const body = useMemo(() => {
		const g = new THREE.ExtrudeGeometry(roundedRect(W, H, R), {depth: D, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 6, curveSegments: 24});
		g.translate(0, 0, -D / 2);
		return g;
	}, []);
	const SW = W - 0.2;
	const SH = H - 0.2;
	const screen = useMemo(() => screenGeometry(SW, SH, R - 0.1), [SW, SH]);
	// visible fraction of the tall screenshot (screen h/w over image h/w); scroll 0 = top, 1 = bottom
	const vis = Math.min(1, SH / SW / texAspect);
	tex.repeat.set(1, vis);
	tex.offset.set(0, (1 - vis) * (1 - scroll));
	return (
		<group rotation={rot} position={pos}>
			<mesh geometry={body}>
				<meshPhysicalMaterial color="#1B2229" metalness={0.85} roughness={0.28} clearcoat={1} clearcoatRoughness={0.2} />
			</mesh>
			<mesh geometry={screen} position={[0, 0, D / 2 + 0.065]}>
				<meshBasicMaterial map={tex} toneMapped={false} />
			</mesh>
			{/* dynamic island */}
			<mesh position={[0, SH / 2 - 0.28, D / 2 + 0.07]}>
				<planeGeometry args={[0.8, 0.2]} />
				<meshBasicMaterial color="#05070A" />
			</mesh>
		</group>
	);
};

export const PhoneScene: React.FC<{
	src?: string;
	texAspect?: number; // image height / width
	kicker?: string;
	title?: React.ReactNode;
	sub?: string;
	duration?: number;
	camera?: 'orbit' | 'crane';
	sfx?: boolean;
}> = ({src = 'assets/site/learning-mobile.png', texAspect = 3000 / 860, kicker = 'devguide.com.ua', title = 'Шлях навчання', sub = 'devguide.com.ua/learning', duration = 180, camera = 'orbit', sfx = true}) => {
	const f = useCurrentFrame();
	const arrive = ramp(f, 0, 22);
	const scroll = ramp(f, 46, duration - 30, 0, 0.92, easeInOut);
	const crane = camera === 'crane';
	const rotY = crane ? interpolate(f, [0, duration], [0.5, -0.18]) : interpolate(arrive, [0, 1], [1.4, -0.38]) + ramp(f, 22, duration, 0, 0.6, easeInOut);
	const rotX = crane ? interpolate(f, [0, duration], [-0.55, -0.08], clamp) : interpolate(arrive, [0, 1], [0.5, 0.08]);
	const z = interpolate(arrive, [0, 1], [-14, 0]) + ramp(f, 22, duration, 0, 0.6);
	const y = crane ? interpolate(f, [0, duration], [0.35, 1.0], clamp) : 0.55;
	const textIn = crane ? ramp(f, 70, 92) : ramp(f, 26, 46);
	const flash = interpolate(f, [0, 2, 14], [0.75, 0.5, 0], clamp);
	return (
		<Stage glow={[540, 820]}>
			<AbsoluteFill style={{background: 'radial-gradient(520px 260px at 540px 1370px, #C3FF5530, transparent 70%)'}} />
			<ThreeCanvas width={1080} height={1920} camera={{position: [0, 0, 16.6], fov: 38}} gl={{antialias: true}}>
				<ambientLight intensity={0.35} />
				<directionalLight position={[4, 6, 8]} intensity={2.2} />
				<pointLight position={[-5, 2, -2]} intensity={60} color={C.lime} />
				<pointLight position={[5, -3, 3]} intensity={30} color={C.blue} />
				<Phone src={src} texAspect={texAspect} scroll={scroll} rot={[rotX, rotY, crane ? 0.06 : -0.05]} pos={[0, y, z]} />
			</ThreeCanvas>
			<div style={{position: 'absolute', top: 190, width: '100%', textAlign: 'center', opacity: textIn}}>
				<Kicker style={{fontSize: 34}}>{kicker}</Kicker>
			</div>
			<div style={{position: 'absolute', left: 84, right: 84, top: 1440, textAlign: 'center', opacity: textIn, transform: `translateY(${(1 - textIn) * 40}px)`}}>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 92, letterSpacing: -2, lineHeight: 1.05}}>{title}</div>
				<div style={{marginTop: 22, fontFamily: F.mono, fontSize: 38, color: C.lime}}>{sub}</div>
			</div>
			<AbsoluteFill style={{background: C.lime, opacity: flash, mixBlendMode: 'screen'}} />
			{sfx ? (
				<>
					<Sfx at={0} src="impact-cine-big.mp3" vol={0.7} dur={150} />
					<Sfx at={0} src="whoosh-swirl.mp3" vol={0.35} dur={40} />
				</>
			) : null}
		</Stage>
	);
};
