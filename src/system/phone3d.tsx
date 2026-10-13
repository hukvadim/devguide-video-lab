import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, staticFile} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useLoader} from '@react-three/fiber';
import * as THREE from 'three';
import {C, F, Kicker, clamp, easeInOut, ramp} from './kit';

// 3D-телефон зі скриншотом сайту, що прокручується (з DevGuide-B-Depth, git 852b0d0:src/dg/scenes/PhoneScene.tsx).
// Тут — картка для BeatVideo: час t і старт a в секундах, без власного Stage і SFX (їх дає картка/відео).
const W = 3.0, H = 6.3, D = 0.3, R = 0.46;

const roundedRect = (w: number, h: number, r: number) => {
	const s = new THREE.Shape();
	const x = -w / 2, y = -h / 2;
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

// UV ShapeGeometry — в одиницях фігури; переводимо в 0..1, щоб текстура заповнила екран.
const screenGeometry = (w: number, h: number, r: number) => {
	const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 24);
	const pos = g.attributes.position, uv = g.attributes.uv;
	for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
	uv.needsUpdate = true;
	return g;
};

const Phone: React.FC<{src: string; texAspect: number; scroll: number; rot: [number, number, number]; pos: [number, number, number]}> = ({src, texAspect, scroll, rot, pos}) => {
	// useLoader підвисає в Suspense всередині ThreeCanvas, той тримає рендер через delayRender (асинхронний TextureLoader давав чорні кадри).
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
	const SW = W - 0.2, SH = H - 0.2;
	const screen = useMemo(() => screenGeometry(SW, SH, R - 0.1), [SW, SH]);
	const vis = Math.min(1, SH / SW / texAspect); // видима частка високого скриншота; scroll 0 = верх, 1 = низ
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
			{/* без «острова»: чорна плашка закривала заголовок сайту */}
		</group>
	);
};

/** Орбіта: телефон прилітає з глибини, розвертається, екран прокручується; підпис унизу. dur — тривалість картки, с. */
export const Phone3D: React.FC<{t: number; a: number; dur: number; src: string; texAspect: number; kicker?: string; title: React.ReactNode; sub?: string}> = ({t, a, dur, src, texAspect, kicker, title, sub}) => {
	const f = (t - a) * 30, d = dur * 30;
	const arrive = ramp(f, 0, 20);
	const scroll = ramp(f, 30, d - 10, 0, 0.92, easeInOut);
	const rotY = interpolate(arrive, [0, 1], [1.4, -0.38]) + ramp(f, 20, d, 0, 0.6, easeInOut);
	const rotX = interpolate(arrive, [0, 1], [0.5, 0.08]);
	const z = interpolate(arrive, [0, 1], [-14, 0]) + ramp(f, 20, d, 0, 0.6);
	const textIn = ramp(f, 18, 34);
	const flash = interpolate(f, [0, 2, 12], [0.6, 0.4, 0], clamp);
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'radial-gradient(520px 260px at 540px 1370px, #C3FF5530, transparent 70%)'}} />
			<ThreeCanvas width={1080} height={1920} camera={{position: [0, 0, 16.6], fov: 38}} gl={{antialias: true}}>
				<ambientLight intensity={0.35} />
				<directionalLight position={[4, 6, 8]} intensity={2.2} />
				<pointLight position={[-5, 2, -2]} intensity={60} color={C.lime} />
				<pointLight position={[5, -3, 3]} intensity={30} color={C.blue} />
				<Phone src={src} texAspect={texAspect} scroll={scroll} rot={[rotX, rotY, -0.05]} pos={[0, 0.55, z]} />
			</ThreeCanvas>
			{kicker ? <div style={{position: 'absolute', top: 190, width: '100%', textAlign: 'center', opacity: textIn}}><Kicker style={{fontSize: 34}}>{kicker}</Kicker></div> : null}
			<div style={{position: 'absolute', left: 84, right: 84, top: 1420, textAlign: 'center', opacity: textIn, transform: `translateY(${(1 - textIn) * 40}px)`}}>
				<div style={{fontFamily: F.display, fontWeight: 900, fontSize: 84, letterSpacing: -2, lineHeight: 1.05}}>{title}</div>
				{sub ? <div style={{marginTop: 22, fontFamily: F.mono, fontSize: 36, color: C.lime}}>{sub}</div> : null}
			</div>
			<AbsoluteFill style={{background: C.lime, opacity: flash, mixBlendMode: 'screen'}} />
		</AbsoluteFill>
	);
};
