const fs   = require('fs');
const path = require('path');

let passed = 0, failed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅  ${name}`);
    passed++;
    results.push({ name, status: 'pass' });
  } catch (e) {
    console.error(`  ❌  ${name}\n       → ${e.message}`);
    failed++;
    results.push({ name, status: 'fail', error: e.message });
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const js   = fs.readFileSync(path.resolve(__dirname, '../main.js'), 'utf8');

console.log('\n⬡  PORTFOLIO TEST SUITE\n');

console.log('── Structure ──────────────────────────────────');
test('Has DOCTYPE',           () => assert(html.startsWith('<!DOCTYPE html>'), 'Missing DOCTYPE'));
test('Has lang attribute',    () => assert(html.includes('<html lang='), 'Missing lang'));
test('Has meta charset',      () => assert(html.includes('meta charset'), 'Missing charset'));
test('Has meta viewport',     () => assert(html.includes('meta name="viewport"'), 'Missing viewport'));
test('Has title tag',         () => assert(/<title>.+<\/title>/.test(html), 'Missing title'));
test('Links main.js',         () => assert(html.includes('main.js'), 'main.js not linked'));
test('Links style.css',       () => assert(html.includes('style.css'), 'style.css not linked'));

console.log('\n── Sections ───────────────────────────────────');
test('Has #hero',    () => assert(html.includes('id="hero"'),    'Missing #hero'));
test('Has #about',   () => assert(html.includes('id="about"'),   'Missing #about'));
test('Has #skills',  () => assert(html.includes('id="skills"'),  'Missing #skills'));
test('Has #certs',   () => assert(html.includes('id="certs"'),   'Missing #certs'));
test('Has #contact', () => assert(html.includes('id="contact"'), 'Missing #contact'));

console.log('\n── Content ────────────────────────────────────');
test('Has Joel Saju name',    () => assert(html.includes('Joel') && html.includes('Saju'), 'Name not found'));
test('Has JS.DEV logo',       () => assert(html.includes('JS'), 'Logo missing'));
test('Has 8 cert cards',      () => assert((html.match(/cert-card/g)||[]).length >= 8, 'Need 8 cert cards'));
test('Has skill bars',        () => assert(html.includes('skill-bar'), 'No skill bars'));

console.log('\n── Supabase ───────────────────────────────────');
test('Has SB_URL',            () => assert(js.includes('SB_URL'), 'SB_URL missing'));
test('Has SB_KEY',            () => assert(js.includes('SB_KEY'), 'SB_KEY missing'));
test('Has supabase.co URL',   () => assert(js.includes('supabase.co'), 'Supabase URL missing'));
test('Uses POST method',      () => assert(js.includes("method: 'POST'") || js.includes('method:"POST"') || js.includes("method:'POST'"), 'No POST call'));

console.log('\n── Accessibility ──────────────────────────────');
test('No img missing alt',    () => {
  const imgs = html.match(/<img[^>]*>/g) || [];
  const bad  = imgs.filter(t => !t.includes('alt='));
  assert(bad.length === 0, `${bad.length} img(s) missing alt`);
});
test('Has footer',            () => assert(html.includes('<footer'), 'No footer'));

console.log('\n───────────────────────────────────────────────');
console.log(`  Passed: ${passed} ✅  Failed: ${failed} ❌`);
console.log('───────────────────────────────────────────────\n');

// Write JUnit XML for CircleCI
const dir = path.resolve(__dirname, '../test-results');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
fs.writeFileSync(path.join(dir, 'results.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<testsuite name="portfolio" tests="${passed+failed}" failures="${failed}">\n` +
  results.map(r => `  <testcase name="${r.name}">${r.status==='fail'?`\n    <failure>${r.error}</failure>\n  `:''}</testcase>`).join('\n') +
  '\n</testsuite>');

if (failed > 0) process.exit(1);
