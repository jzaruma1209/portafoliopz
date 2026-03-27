const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf8');
let lines = content.split(/\r?\n/);

let importsIdx = lines.findIndex(l => l.includes('import LogoLoop from'));
lines.splice(importsIdx, 0, "import ScrollStack, { ScrollStackItem } from '@/app/components/ScrollStack';");

let projectTargetIdx = lines.findIndex(l => l.includes('Esta sección estará próximamente disponible...'));

if (projectTargetIdx !== -1) {
  lines.splice(projectTargetIdx - 1, 3,
    '          <ScrollStack className="mt-12 text-left">',
    '            <ScrollStackItem>',
    '              <h3 className="text-2xl font-bold mb-2">Card 1</h3>',
    '              <p className="text-slate-600 dark:text-slate-400">This is the first card in the stack</p>',
    '            </ScrollStackItem>',
    '            <ScrollStackItem>',
    '              <h3 className="text-2xl font-bold mb-2">Card 2</h3>',
    '              <p className="text-slate-600 dark:text-slate-400">This is the second card in the stack</p>',
    '            </ScrollStackItem>',
    '            <ScrollStackItem>',
    '              <h3 className="text-2xl font-bold mb-2">Card 3</h3>',
    '              <p className="text-slate-600 dark:text-slate-400">This is the third card in the stack</p>',
    '            </ScrollStackItem>',
    '          </ScrollStack>'
  );
}

fs.writeFileSync('app/page.tsx', lines.join('\r\n'));
console.log('Update Projects successful');
