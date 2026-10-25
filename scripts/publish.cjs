const fs = require('node:fs'), path = require('node:path'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const web = path.join(root, 'web'), docs = path.join(root, 'docs');
const build = cp.spawnSync(process.execPath, [path.join(web,'build-all.cjs')], {cwd:web,stdio:'inherit'});
if (build.status !== 0) process.exit(build.status || 1);
fs.mkdirSync(docs, {recursive:true});
let copied = 0;
for (const file of fs.readdirSync(path.join(web,'dist'), {withFileTypes:true})) {
  if (!file.isFile() || !/\.(html|json|md)$/.test(file.name)) throw Error('Unexpected build output: '+file.name);
  fs.copyFileSync(path.join(web,'dist',file.name), path.join(docs,file.name));
  copied++;
}
console.log('Updated '+copied+' GitHub Pages files; commit and push docs/ with the source changes.');
