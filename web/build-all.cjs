const {spawnSync}=require('node:child_process');
for(const file of ['build.cjs','surgery-build.cjs','physiology-build.cjs','biochemistry-build.cjs','pathology-build.cjs','unified-build.cjs']){const r=spawnSync(process.execPath,[file],{cwd:__dirname,stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
