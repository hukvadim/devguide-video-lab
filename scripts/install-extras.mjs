import {spawnSync} from 'node:child_process';
const npm=process.platform==='win32'?'npm.cmd':'npm';
const args=process.argv.slice(2), choice=args[0]||'bits';
const map={bits:['remotion-bits'],rive:['@remotion/rive@4.0.534'],skia:['@remotion/skia@4.0.534','@shopify/react-native-skia']};
const packages=map[choice];if(!packages)throw Error('Choose bits, rive or skia');
const result=spawnSync(npm,['install','--save-exact',...packages],{stdio:'inherit',shell:process.platform==='win32'});
if(result.error)throw result.error;process.exit(result.status??1);
