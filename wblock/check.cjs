const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(path.join(__dirname, 'fireflies.user.js'), 'utf8');
assert(source.includes('// @connect      api.deepseek.com'));
assert(source.includes('// @inject-into  content'));
assert(!/sk-[a-zA-Z0-9]{16,}/.test(source));
const nodes = new Map();
const context = {
  document: {getElementById: () => null},
  window: {},
  lastRequest: null,
  GM_xmlhttpRequest(details) {
    context.lastRequest = details;
    setTimeout(() => details.onload({status: 200, responseText: '{"choices":[]}'}), 0);
    return {abort() {details.onabort();}};
  }
};
context.window.top = context.window;
context.window.self = context.window;
vm.createContext(context);
vm.runInContext(source.replace('  bootstrap();', `
  root = {getElementById(id) {
    if (!globalThis.nodes.has(id)) globalThis.nodes.set(id, {checked:false});
    return globalThis.nodes.get(id);
  }};
  Object.assign(globalThis, {validateAssignment, validateAnswers, parseCompletion, callDeepSeek,
    cancel: () => cancelRequest?.()});
`), Object.assign(context, {nodes}));
const assignment = {article: 'Article', questions: [{question: 'Question', options: [{id:'rb_0_2', text:'B. Option'}]}]};
const answer = {question_number:1, option_id:'rb_0_2', reason:'Evidence', confidence:.9};
context.validateAssignment(assignment);
const completion = {choices:[{finish_reason:'stop',message:{content:JSON.stringify({answers:[answer]})}}]};
assert.equal(context.parseCompletion(completion, assignment)[0].option_id, answer.option_id);
completion.choices[0].finish_reason = 'length';
assert.throws(() => context.parseCompletion(completion, assignment), /finish_reason=length/);
(async () => {
  await context.callDeepSeek({model:'deepseek-flash'}, 'test-key');
  assert.equal(context.lastRequest.url, 'https://api.deepseek.com/chat/completions');
  assert.equal(context.lastRequest.anonymous, true);
  assert.equal(context.lastRequest.headers.Authorization, 'Bearer test-key');
  assert.equal(context.lastRequest.timeout, 240000);
  context.GM_xmlhttpRequest = (details) => {
    setTimeout(() => details.onload({status:401,responseText:''}),0);
    return {abort() {}};
  };
  await assert.rejects(() => context.callDeepSeek({},'test-key'), /HTTP 401/);
  context.GM_xmlhttpRequest = (details) => ({abort() {details.onabort();}});
  const cancelled = context.callDeepSeek({},'test-key');
  context.cancel();
  await assert.rejects(() => cancelled, /已取消/);
  console.log('wBlock metadata, response validation, GM request, HTTP error and cancellation checks passed.');
})().catch((error) => {console.error(error); process.exitCode = 1;});
