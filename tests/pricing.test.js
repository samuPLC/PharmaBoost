import {test} from 'node:test';
import assert from 'node:assert/strict';
import {unitPrice} from '../web/pricing.js';
test('Descuento se aplica en el umbral y redondea el precio unitario a COP entero',()=>{const p={price:10001,discount_min:3,discount_percent:10};assert.equal(unitPrice(p,2),10001);assert.equal(unitPrice(p,3),9001);assert.equal(unitPrice(p,10),9001);assert.equal(unitPrice({...p,discount_min:0,discount_percent:0},10),10001);});
