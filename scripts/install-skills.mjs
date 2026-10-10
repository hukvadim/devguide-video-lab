import {spawnSync} from 'node:child_process';
const npx=process.platform==='win32'?'npx.cmd':'npx';
const repos=['remotion-dev/skills','snapcndev/snapcn','Vincentwei1021/video-shotcraft'];
for(const repo of repos){
 console.log('Installing agent skills:',repo);
 const result=spawnSync(npx,['-y','skills@latest','add',repo,'--agent','claude-code','codex','--copy','-y'],{stdio:'inherit',shell:process.platform==='win32'});
 if(result.error)throw result.error;if(result.status!==0)process.exit(result.status??1);
}
console.log('Done. Restart the coding agent. npm install installs packages; this command installs agent instructions.');
