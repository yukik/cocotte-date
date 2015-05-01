

//営業日加算

var format = require('../date-format');
// var format = require('../minify');
var test = require('assert').equal;

test(format('2015-4-8', 'Y/m/d', 1), '2015/04/09');
test(format('2015-4-9', 'Y/m/d', 1), '2015/04/10');
test(format('2015-4-10', 'Y/m/d', 1), '2015/04/13');
test(format('2015-4-10', 'Y/m/d', 0), '2015/04/10');


test(format('2015-5-1', 'Y/m/d', 1), '2015/05/07');
test(format('2015-5-2', 'Y/m/d', 1), '2015/05/07');
test(format('2015-5-3', 'Y/m/d', 1), '2015/05/07');
test(format('2015-5-4', 'Y/m/d', 1), '2015/05/07');
test(format('2015-5-5', 'Y/m/d', 1), '2015/05/07');
test(format('2015-5-6', 'Y/m/d', 1), '2015/05/07');
test(format('2015-5-7', 'Y/m/d', 1), '2015/05/08');