const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const url = 'https://fireflies.chiculture.org.hk/app/assignments/2026-10-07';
const questions = [0, 1].map((n) => ({
  question: `Question ${n}`, options: [{id: `rb_${n}_2`, name: `answers.${n}.answered`, value: '2', text: 'B. Option'}]
}));
let state = [false, false];
let inputs;
function rebuild() {
  inputs = questions.map((q, n) => ({...q.options[0], type: 'radio', disabled: false, checked: state[n],
    click() {
      const captured = state.slice(); captured[n] = true;
      setTimeout(() => {state = captured; rebuild();}, 15);
    }
  }));
}
rebuild();
const controls = new Map();
const labels = (n) => [
  {htmlFor: questions[n].options[0].id, innerText: 'B.', click: () => inputs[n].click()},
  {htmlFor: questions[n].options[0].id, innerText: 'Option', click: () => inputs[n].click()}
];
const cards = questions.map((q, n) => ({
  querySelector: () => ({innerText: q.question}),
  querySelectorAll: (selector) => selector === 'label' ? labels(n) : [inputs[n]]
}));
const context = {
  URLSearchParams, setTimeout, location: {search: '?tab=1', href: url},
  chrome: {storage: {local: {get: () => new Promise(() => {})}}},
  document: {
    getElementById(id) {
      if (id.startsWith('rb_')) return inputs.find((input) => input.id === id);
      if (!controls.has(id)) controls.set(id, {addEventListener() {}});
      return controls.get(id);
    },
    querySelector: () => ({innerText: 'Article'}),
    querySelectorAll: (selector) => selector === 'form .card' ? cards : questions.flatMap((_, n) => labels(n))
  }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), context);
(async () => {
  const source = {url, article: 'Article', questions};
  const choices = questions.map((q, n) => ({question_number: n + 1, option_id: q.options[0].id}));
  const originalInputs = inputs.slice();
  const result = await context.fillPage(source, choices);
  assert(result.ok);
  assert.deepEqual(state, [true, true]);
  assert.notEqual(inputs[0], originalInputs[0]);
  assert((await context.fillPage(source, choices)).ok);
  inputs[0].disabled = true;
  const disabled = await context.fillPage(source, choices);
  assert(!disabled.ok);
  assert.match(disabled.error, /第 1 题/);
  assert.equal(disabled.phase, '检查页面');
  rebuild(); state = [false, false]; rebuild();
  inputs[0].click = () => {};
  const failure = await context.fillPage(source, choices);
  assert(!failure.ok);
  assert.equal(failure.failed[0], 1);
  assert.equal(state[1], false);
  context.location.href = 'https://fireflies.chiculture.org.hk/app';
  const navigated = await context.fillPage(source, choices);
  assert(!navigated.ok);
  assert.match(navigated.error, /页面已改变/);
  console.log('Asynchronous re-render, repeated fill, disabled and rejected click checks passed.');
})().catch((error) => {console.error(error); process.exitCode = 1;});
