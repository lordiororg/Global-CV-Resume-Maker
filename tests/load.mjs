// Loads the browser scripts (rules + parser) into an isolated context so they can be tested without a DOM.
import fs from 'node:fs';
import vm from 'node:vm';
const read = p => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const ctx = vm.createContext({});
vm.runInContext(`${read('src/rules.js')}\n${read('src/parser.js')}\nglobalThis.api={COUNTRIES,P,G,X,SR,profileFor,parse,order,check,cleanText,blank};`, ctx);
export const api = ctx.api;
export const fixture = n => fs.readFileSync(new URL(`./fixtures/${n}`, import.meta.url), 'utf8');
export const textFromCoords = n => { const j = JSON.parse(fixture(n)); return api.cleanText(api.order(j.items, j.W)); };
