import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const npx=process.platform==='win32'?'npx.cmd':'npx';
// Starter names (Motion, Three, Vector, Captions, Hybrid) or any full composition ID (e.g. DevGuide-Final).
const arg=process.argv[2]||'Hybrid';
const starters=['Motion','Three','Vector','Captions','Hybrid'];
const id=starters.includes(arg)?'DevGuide-'+arg:arg;
const frames=id==='DevGuide-Final'?[20,84,200,300,420,560,700,860,1000,1130]:[30,180,360,540,720,870];
mkdirSync('out/qa',{recursive:true});
for(const frame of frames){
 const r=spawnSync(npx,['remotion','still','src/index.ts',id,`out/qa/${arg}-${frame}.png`,'--frame='+frame,'--scale=0.5',...(process.argv.includes('--software')?['--gl=swangle']:[])],{stdio:'inherit',shell:process.platform==='win32'});
 if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);
}
