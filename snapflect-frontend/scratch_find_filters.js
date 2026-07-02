const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      if (c.includes('Filters')) {
        console.log(p);
      }
    }
  });
}
walk('src/app/features');
