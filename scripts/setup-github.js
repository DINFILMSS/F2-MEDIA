// Configura o usuário/repositório do GitHub no package.json (rodar uma única vez)
// Uso: npm run setup-github -- seu-usuario nome-do-repo
const fs = require('fs');
const path = require('path');
const [owner, repo = 'f2-equipamentos'] = process.argv.slice(2);
if (!owner) {
  console.log('Uso: npm run setup-github -- SEU-USUARIO [nome-do-repo]');
  process.exit(1);
}
const file = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(file, 'utf8'));
pkg.repository.url = `https://github.com/${owner}/${repo}.git`;
pkg.build.publish = [{ provider: 'github', owner, repo, releaseType: 'release' }];
fs.writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n');
console.log(`OK! Atualizações configuradas para github.com/${owner}/${repo}`);
