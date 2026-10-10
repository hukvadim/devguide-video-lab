import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
const npx=process.platform==='win32'?'npx.cmd':'npx';
const args=process.argv.slice(2), draft=args.includes('--draft');
const names=args.includes('--all')?['Motion','Three','Vector','Captions','Hybrid']:[args.find(x=>!x.startsWith('--'))||'Hybrid'];
for(const name of names){
 if(!['Motion','Three','Vector','Captions','Hybrid'].includes(name)) throw Error('Unknown composition: '+name);
 mkdirSync('out/'+name.toLowerCase(),{recursive:true});
 const result=spawnSync(npx,['remotion','render','src/index.ts','DevGuide-'+name,`out/${name.toLowerCase()}/devguide-${name.toLowerCase()}${draft?'-draft':''}.mp4`,'--codec=h264','--crf='+ (draft?'25':'18'),'--concurrency=2',...(args.includes('--software')?['--gl=swangle']:[]),...(draft?['--scale=0.5']:[])],{stdio:'inherit',shell:process.platform==='win32'});
 if(result.error) throw result.error;if(result.status!==0)process.exit(result.status??1);
}
