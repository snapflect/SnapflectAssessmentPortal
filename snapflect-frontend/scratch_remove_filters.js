const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (p.endsWith('.ts')) {
      let c = fs.readFileSync(p, 'utf8');
      
      const filterRegex = /<button class="btn-secondary text-sm">\s*<svg class="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-\.293\.707l-6\.414 6\.414a1 1 0 00-\.293\.707V17l-4 4v-6\.586a1 1 0 00-\.293-\.707L3\.293 7\.293A1 1 0 013 6\.586V4z"><\/path><\/svg>\s*Filters\s*<\/button>/g;
      
      let r = c.replace(filterRegex, '');
      if (c !== r) {
        fs.writeFileSync(p, r);
        console.log('Updated ' + p);
      }
    }
  });
}
walk('src/app/features');
