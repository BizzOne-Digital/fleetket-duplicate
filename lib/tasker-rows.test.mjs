import test from 'node:test'
import assert from 'node:assert/strict'
import { groupByPin, sharedVisibility } from './tasker-rows.ts'

const pin = { lat: 43.64, lng: -79.39 }

test('categories added with a promo code take the approved status, visibility and pin of the account', () => {
  const rows = [
    { status: 'trial', published: true, location: pin }, // original category, approved
    { status: 'pending', published: true, location: null }, // added later, never approved or geocoded
    { status: 'trial', published: false, location: null },
  ]
  assert.deepEqual(sharedVisibility(rows), { status: 'trial', published: true, location: pin })
})

test('an approved row wins over pending, and active over trial', () => {
  assert.equal(sharedVisibility([{ status: 'pending' }, { status: 'active' }, { status: 'trial' }]).status, 'active')
})

test('a tasker nobody approved stays pending', () => {
  assert.equal(sharedVisibility([{ status: 'pending' }, { status: 'pending' }]).status, 'pending')
})

test('the pin comes from any located row when the best row has none', () => {
  assert.deepEqual(sharedVisibility([{ status: 'active', location: null }, { status: 'pending', location: pin }]).location, pin)
})

test('no pin anywhere leaves location untouched', () => {
  assert.equal('location' in sharedVisibility([{ status: 'active', location: null }]), false)
})

test('hidden everywhere stays hidden', () => {
  assert.equal(sharedVisibility([{ status: 'active', published: false }, { status: 'active', published: false }]).published, false)
})

test("a tasker's categories at one address share one map pin", () => {
  const groups = groupByPin([
    { ...pin, category: 'a' },
    { ...pin, category: 'b' },
    { ...pin, category: 'c' },
    { lat: 49.28, lng: -123.12, category: 'a' },
  ])
  assert.deepEqual(groups.map((g) => g.map((p) => p.category)), [['a', 'b', 'c'], ['a']])
})
