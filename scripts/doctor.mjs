import {createRequire} from 'node:module';
import {readFileSync,existsSync} from 'node:fs';
const require=createRequire(import.meta.url), pkg=JSON.parse(readFileSync('package.json','utf8'));
let failures=0;
if(Number(process.versions.node.split('.')[0])<22){console.error('Node.js 22+ required');failures++;}
for(const [name,expected] of Object.entries({...pkg.dependencies,...pkg.devDependencies})){
 try{require.resolve(name);console.log('OK',name,expected);}catch(e){
  // @types packages do not have a runtime entry point.
  if(existsSync(`node_modules/${name}/package.json`)) console.log('OK',name,expected);
  else{console.error('MISSING',name);failures++;}
 }
}
for(const name of Object.keys(pkg.dependencies).filter(x=>x==='remotion'||x.startsWith('@remotion/'))){
 const installed=JSON.parse(readFileSync(`node_modules/${name}/package.json`,'utf8')).version;
 if(installed!==pkg.dependencies.remotion){console.error('VERSION MISMATCH',name,installed);failures++;}
}
for(const path of ['src/index.ts','src/Root.tsx','public/assets/lab-bed.wav','data/brand.json'])if(!existsSync(path)){console.error('MISSING FILE',path);failures++;}
console.log(failures?'Fix the issues above.':'READY. Run npm start. Skills are installed separately: npm run setup:skills');
process.exitCode=failures?1:0;
