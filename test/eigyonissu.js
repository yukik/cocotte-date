// 営業日数
var count = require(global.minify ? '../minify' : '../date-format').countEigyobi;
var test = require('assert').equal;

test(count('2015-1-1', '2015-1-1'), 0);
test(count('2015-1-1', '2015-1-31'), 19);
test(count('2015-5-1', '2015-5-31'), 18);
test(count('2015-1-1', '2015-12-31'), 242);





