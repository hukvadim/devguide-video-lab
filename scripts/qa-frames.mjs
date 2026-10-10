import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const npx=process.platform==='win32'?'npx.cmd':'npx';
// usage: node scripts/qa-frames.mjs <CompositionId> [--software]   (кадри -> out/<id>/qa/, clean.mjs прибере їх після фіналу)
const id=process.argv[2];
if(!id)throw Error('usage: qa-frames.mjs <CompositionId>');
const frames=[30,180,360,540,720,870];
const qa=`out/${id.toLowerCase().replace(/^devguide-/,'')}/qa`;
mkdirSync(qa,{recursive:true});
for(const frame of frames){
 const r=spawnSync(npx,['remotion','still','src/index.ts',id,`${qa}/${frame}.png`,'--frame='+frame,'--scale=0.5',...(process.argv.includes('--software')?['--gl=swangle']:[])],{stdio:'inherit',shell:process.platform==='win32'});
 if(r.error)throw r.error;if(r.status!==0)process.exit(r.status??1);
}
