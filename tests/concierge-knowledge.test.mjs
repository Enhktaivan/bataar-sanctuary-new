import {test} from 'node:test';
import assert from 'node:assert/strict';
import knowledge from '../src/campKnowledge.json' with {type:'json'};
import {conciergeReply,publicKnowledgeReply,publicConciergeCopy} from '../src/conciergeReplies.ts';

test('nine languages resolve applicable intents from the published public snapshot',()=>{
 const intents={rooms:'room price',location:'route',facilities:'Starlink',tours:'tour',contact:'contact',booking_request:'booking',payment:'QPay',unspecified_policy:'refund'};
 assert.equal(knowledge.languages.length,9);
 for(const {code} of knowledge.languages) for(const [id,query] of Object.entries(intents)) {
  const expected=knowledge.facts.find(f=>f.id===id).locales[code].content;
  assert.equal(publicKnowledgeReply(id,code),expected,`${code}/${id} helper`);
  assert.equal(conciergeReply(query,code),expected,`${code}/${id} intent`);
 }
});
test('greeting and unknown replies retain their own guidance rather than invent an answer',()=>{
 for(const {code} of knowledge.languages){
  assert.equal(conciergeReply('hello',code),publicConciergeCopy(code).welcome);
  const fallback=conciergeReply('zzyyxx',code);
  assert.ok(fallback.length>10);
  assert.notEqual(fallback,publicKnowledgeReply('unspecified_policy',code));
 }
 assert.equal(publicKnowledgeReply('private_booking','en'),undefined);
 assert.equal(publicKnowledgeReply('rooms','invalid'),publicKnowledgeReply('rooms','en'));
 assert.equal(conciergeReply('zzyyxx','invalid'),conciergeReply('zzyyxx','en'));
});
test('public snapshot schema cannot carry customer records or credential fields',()=>{
 assert.deepEqual(Object.keys(knowledge).sort(),['facts','languages','schemaVersion']);
 for(const fact of knowledge.facts){
  assert.deepEqual(Object.keys(fact).sort(),['id','locales']);
  for(const locale of Object.values(fact.locales)) assert.deepEqual(Object.keys(locale).sort(),['content','title']);
 }
 assert.doesNotMatch(JSON.stringify(knowledge),/customer_email|booking_id|callback_token|MAKE_WEBHOOK|NOTION_TOKEN|ADMIN_TOKEN/);
});
