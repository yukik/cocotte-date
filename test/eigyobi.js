var format = require('../date-format');

var assert = require('assert');

assert.equal(format('2015-4-8', 'Y/m/d', 1), '2015/04/09');
assert.equal(format('2015-4-9', 'Y/m/d', 1), '2015/04/10');
assert.equal(format('2015-4-10', 'Y/m/d', 1), '2015/04/13');
assert.equal(format('2015-4-10', 'Y/m/d', 0), '2015/04/10');


assert.equal(format('2015-5-1', 'Y/m/d', 1), '2015/05/07');
assert.equal(format('2015-5-2', 'Y/m/d', 1), '2015/05/07');
assert.equal(format('2015-5-3', 'Y/m/d', 1), '2015/05/07');
assert.equal(format('2015-5-4', 'Y/m/d', 1), '2015/05/07');
assert.equal(format('2015-5-5', 'Y/m/d', 1), '2015/05/07');
assert.equal(format('2015-5-6', 'Y/m/d', 1), '2015/05/07');
assert.equal(format('2015-5-7', 'Y/m/d', 1), '2015/05/08');
