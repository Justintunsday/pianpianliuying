const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const nodes = new Map();
const context = {
  URLSearchParams, location: {search: '?tab=1'},
  document: {getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, {addEventListener() {}});
    return nodes.get(id);
  }},
  chrome: {storage: {local: {get: () => new Promise(() => {})}}}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8') + '\nthis.testValidUrl = validUrl;', context);
const source = {article: '文章', questions: [{question: '题目', options: [{id: 'rb_0_2', text: 'B. 选项'}]}]};
context.validateAssignment(source);
const good = {question_number: 1, option_id: 'rb_0_2', reason: '文章依据', confidence: .9};
assert.equal(context.validateAnswers({answers: [good]}, source)[0].option_id, 'rb_0_2');
for (const invalid of [
  {...good, option_id: 'rb_0_1'}, {...good, confidence: 2},
  {...good, question_number: 2}, {...good, reason: ''}
]) assert.throws(() => context.validateAnswers({answers: [invalid]}, source));
assert.throws(() => context.validateAnswers({answers: []}, source));
const completion = {
  choices: [{finish_reason: 'stop', message: {content: JSON.stringify({answers: [good]})}}]
};
assert.equal(context.parseCompletion(completion, source)[0].option_id, good.option_id);
completion.choices[0].message.content = '```json\n' + JSON.stringify({answers: [good]}) + '\n```';
assert.equal(context.parseCompletion(completion, source)[0].option_id, good.option_id);
for (const reason of ['length', 'content_filter', 'aborted', 'insufficient_system_resource']) {
  completion.choices[0].finish_reason = reason;
  assert.throws(() => context.parseCompletion(completion, source), new RegExp('finish_reason=' + reason));
}
completion.choices[0].finish_reason = 'stop';
completion.choices[0].message.content = '';
assert.throws(() => context.parseCompletion(completion, source), /正文为空/);
completion.choices[0].message.content = '{"answers":[';
assert.throws(() => context.parseCompletion(completion, source), /完整的 JSON/);
assert.throws(() => context.parseCompletion({}, source), /未返回/);
assert(context.testValidUrl('https://fireflies.chiculture.org.hk/app/assignments/2026-10-07'));
assert(!context.testValidUrl('https://example.org/app/assignments/2026-10-07'));
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
assert.equal(manifest.manifest_version, 3);
for (const file of ['app.html', 'app.js', 'app.css', 'config.js', manifest.background.service_worker]) {
  assert(fs.existsSync(path.join(__dirname, file)));
}
console.log('Manifest, URL scope and answer validation checks passed.');
