import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api, fixture, textFromCoords } from './load.mjs';

test('single-column PDF: contact, jobs, education, extras', () => {
  const o = api.parse(textFromCoords('cv-single-column.json')).o;
  assert.equal(o.name, 'Amara Njoroge');
  assert.equal(o.title, 'Senior Data Analyst');
  assert.equal(o.email, 'amara.njoroge@example.com');
  assert.equal(o.phone, '+254 700 123 456');
  assert.equal(o.location, 'Nairobi, Kenya');
  assert.match(o.summary, /6 years of experience/);
  assert.equal(o.exp.length, 2);
  assert.deepEqual([o.exp[0].role, o.exp[0].company, o.exp[0].start, o.exp[0].end], ['Senior Data Analyst', 'Savanna Logistics', 'Mar 2021', '']);
  assert.deepEqual([o.exp[1].role, o.exp[1].company, o.exp[1].end], ['Data Analyst', 'Lakeview Bank', 'Feb 2021']);
  assert.equal(o.exp[0].bul.split('\n').length, 2);
  assert.deepEqual([o.edu[0].deg, o.edu[0].inst, o.edu[0].year], ['BSc Statistics', 'University of Nairobi', '2013 – 2017']);
  assert.equal(o.certs.split('\n').length, 2);
  assert.match(o.refs, /Jane Mwangi/);
  const w = api.check(o);
  assert.equal(w.length, 0, w.join(' | ')); // complete CV: nothing flagged
});

test('two-column PDF keeps reading order (sidebar then main column)', () => {
  const t = textFromCoords('cv-two-column.json');
  assert.ok(t.indexOf('Site Engineer') > t.indexOf('EXPERIENCE'));
  const o = api.parse(t).o;
  assert.equal(o.name, 'Peter Otieno');
  assert.equal(o.email, 'peter.otieno@example.com');
  assert.equal(o.phone, '+254 722 555 019');
  assert.equal(o.exp.length, 2);
  assert.deepEqual([o.exp[0].role, o.exp[0].company], ['Site Engineer', 'Coast Builders Ltd']);
  assert.deepEqual([o.exp[1].role, o.exp[1].company], ['Graduate Engineer', 'Kenya Roads Authority']);
  assert.deepEqual([o.edu[0].deg, o.edu[0].inst], ['BSc Civil Engineering', 'Technical University of Kenya']);
});

test('Word text with list bullets and dates on their own line', () => {
  const o = api.parse(fixture('cv-word.txt')).o;
  assert.equal(o.name, 'Grace Atieno');
  assert.equal(o.exp.length, 2);
  assert.deepEqual([o.exp[0].role, o.exp[0].company, o.exp[0].start], ['Senior Staff Nurse', 'Aga Khan Hospital', '2020']);
  assert.equal(o.exp[1].company, 'Jaramogi Oginga Odinga Teaching Hospital');
  assert.equal(o.edu[0].inst, 'Moi University');
  assert.equal(o.refs, ''); // "available on request" is not a referee
});

test('Europass-style text: dd/mm/yyyy dates, EQF level, CEFR languages, merged bullets', () => {
  const t = `Jane Example
Date of birth: 01/02/1995 Nationality: Kenyan Gender: Female Address: Nairobi, Kenya
EDUCATION AND TRAINING
01/09/2014 – 30/06/2018 Nairobi, Kenya
CIVIL ENGINEERING Example University
Level in EQF EQF level 6
WORK EXPERIENCE
SITE ENGINEER – EXAMPLE BUILDERS LTD – 01/07/2018 – 30/08/2020 – NAIROBI , KENYA
• Supervised site works.• Prepared weekly reports.
LANGUAGE SKILLS
Mother tongue(s): SWAHILI
Other language(s):
ENGLISH C2 C2 C2 C2 C2`;
  const o = api.parse(api.cleanText(t)).o;
  assert.deepEqual([o.dob, o.nat, o.gen, o.addr], ['01/02/1995', 'Kenyan', 'Female', 'Nairobi, Kenya']);
  assert.deepEqual([o.edu[0].deg, o.edu[0].inst, o.edu[0].eqf, o.edu[0].year], ['Civil Engineering', 'Example University', '6', '01/09/2014 – 30/06/2018']);
  assert.deepEqual([o.exp[0].role, o.exp[0].company, o.exp[0].start, o.exp[0].end], ['Site Engineer', 'Example Builders Ltd', '01/07/2018', '30/08/2020']);
  assert.equal(o.exp[0].bul.split('\n').length, 2);
  assert.deepEqual([o.mother, o.langs], ['Swahili', 'English – C2']);
});

test('heading variants map to the right sections', () => {
  const t = `Sam Example
sam@example.com
CAREER SUMMARY
Experienced builder.
Employment
Foreman, Acme Ltd, Mombasa
2019 - 2022
• Led crews
ACADEMIC BACKGROUND
Diploma in Building
Mombasa Polytechnic
2015 - 2017
Referees
Pat Boss, Director, Acme Ltd`;
  const o = api.parse(t).o;
  assert.match(o.summary, /Experienced builder/);
  assert.equal(o.exp.length, 1);
  assert.equal(o.edu.length, 1);
  assert.match(o.refs, /Pat Boss/);
});

test('missing information is reported, never silent', () => {
  const w = api.check(api.parse('Just some words with nothing useful').o);
  assert.ok(w.some(x => /name/i.test(x)) || w.some(x => /email/i.test(x)));
  assert.ok(w.some(x => /experience/i.test(x)));
});

test('cleanText fixes glyph bullets and merged bullet lines', () => {
  assert.equal(api.cleanText('a(cid:127) b'), 'a• b');
  assert.equal(api.cleanText('Did X.• Did Y'), 'Did X.\n• Did Y');
});
