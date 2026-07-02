const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      let r = c.replace(/\(close\)="closeForm\(\)"/g, '(closeEvent)="closeForm()"');
      r = r.replace(/\(close\)="closeCompetencyForm\(\)"/g, '(closeEvent)="closeCompetencyForm()"');
      r = r.replace(/\(close\)="closeGroupForm\(\)"/g, '(closeEvent)="closeGroupForm()"');
      r = r.replace(/\(close\)="closeEditBank\(\)"/g, '(closeEvent)="closeEditBank()"');
      r = r.replace(/\(close\)="closeEditQuestion\(\)"/g, '(closeEvent)="closeEditQuestion()"');
      if (c !== r) {
        fs.writeFileSync(p, r);
        console.log('Updated ' + p);
      }
    }
  });
}
walk('src/app/features');
