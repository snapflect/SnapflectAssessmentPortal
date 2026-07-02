const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      let matches = c.match(/<tr \*ngIf="loading[^>]*>/g);
      if (matches) {
        console.log(p);
        console.log(matches.join('\n'));
      }
    }
  });
}
walk('src/app/features');
