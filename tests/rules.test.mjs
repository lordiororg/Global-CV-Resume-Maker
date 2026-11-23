import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api } from './load.mjs';

const EU27 = ['Austria','Belgium','Bulgaria','Croatia','Cyprus','Czechia','Denmark','Estonia','Finland','France','Germany','Greece','Hungary','Ireland','Italy','Latvia','Lithuania','Luxembourg','Malta','Netherlands','Poland','Portugal','Romania','Slovakia','Slovenia','Spain','Sweden'];
const REQUIRED = ['t','pg','mx','ref','s','pp','lay','ac','ff','o','r','w'];

test('country list is complete and unique', () => {
  assert.ok(api.COUNTRIES.length >= 190);
  assert.equal(new Set(api.COUNTRIES).size, api.COUNTRIES.length);
});

test('every country resolves to a complete template', () => {
  for (const c of api.COUNTRIES) {
    const p = api.profileFor(c);
    for (const k of REQUIRED) assert.ok(p[k] !== undefined && p[k] !== '', `${c}: missing ${k}`);
    assert.ok(['classic','tab','side','box','mini','eu'].includes(p.lay), `${c}: bad layout`);
    assert.equal(new Set(p.o).size, p.o.length, `${c}: duplicate section in order "${p.o}"`);
    for (const s of p.r) assert.ok(api.SR[s], `${c}: unknown source ${s}`);
  }
});

test('overrides and source links are valid', () => {
  for (const k of Object.keys(api.X)) assert.ok(api.COUNTRIES.includes(k), `override for unknown country ${k}`);
  for (const [k, v] of Object.entries(api.SR)) assert.match(v[1], /^https:\/\//, k);
});

test('EU members use the Europass layout', () => {
  for (const c of EU27) assert.equal(api.profileFor(c).lay, 'eu', c);
  for (const c of ['Norway','Iceland','Switzerland','Liechtenstein']) assert.equal(api.profileFor(c).lay, 'eu', c);
});

test('regional rules follow the guide', () => {
  const us = api.profileFor('United States');
  assert.deepEqual([us.ph, us.dob, us.nat, us.mar, us.ref], [0, 0, 0, 0, 0]);
  assert.equal(us.pp, 'Letter');
  for (const c of ['United Kingdom','Australia','New Zealand']) assert.equal(api.profileFor(c).ph, 0, c);
  for (const c of ['Germany','France','United Arab Emirates','Japan','Brazil','India','Kenya']) assert.equal(api.profileFor(c).ph, 1, c);
  for (const c of ['Netherlands','Sweden','Ireland']) assert.equal(api.profileFor(c).ph, 0, c);
  assert.equal(api.profileFor('Germany').sig, 1);
  assert.equal(api.profileFor('Kenya').ref, 2);
  assert.equal(api.profileFor('United Arab Emirates').pj, 'Key Projects');
});
