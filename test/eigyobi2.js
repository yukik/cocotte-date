
// 営業日計算


var add = require('../date-format').addEigyobi;
// var add = require('../minify').addEigyobi;

var eq = require('assert').equal;

function test(actual, expected) {
  eq(actual ? actual.toString() : null, expected ? new Date(expected).toString() : null);
}

// var eigyobi = date_format.addEigyobi(date, days, include, season, regular, holidays)

test(add('2015-5-1', 0), '2015-5-1');
test(add('2015-5-2', 0), '2015-5-7');
test(add('2015-5-3', 0), '2015-5-7');
test(add('2015-5-4', 0), '2015-5-7');
test(add('2015-5-5', 0), '2015-5-7');
test(add('2015-5-6', 0), '2015-5-7');
test(add('2015-5-7', 0), '2015-5-7');
test(add('2015-5-1', 1), '2015-5-7');
test(add('2015-5-2', 1), '2015-5-7');
test(add('2015-5-3', 1), '2015-5-7');
test(add('2015-5-4', 1), '2015-5-7');
test(add('2015-5-5', 1), '2015-5-7');
test(add('2015-5-6', 1), '2015-5-7');
test(add('2015-5-7', 1), '2015-5-8');

// include
test(add('2015-5-1', 1, true), '2015-5-1');
test(add('2015-5-2', 1, true), '2015-5-7');
test(add('2015-5-6', 1, true), '2015-5-7');
test(add('2015-5-7', 1, true), '2015-5-7');
test(add('2015-5-1', 1, false), '2015-5-7');
test(add('2015-5-2', 1, false), '2015-5-7');
test(add('2015-5-6', 1, false), '2015-5-7');
test(add('2015-5-7', 1, false), '2015-5-8');

// 年中無休
test(add('2015-1-1', 1, null, '', '', ''), '2015-1-2');
test(add('2015-1-2', 1, null, '', '', ''), '2015-1-3');
test(add('2015-1-3', 1, null, '', '', ''), '2015-1-4');
test(add('2015-1-4', 1, null, '', '', ''), '2015-1-5');
test(add('2015-1-11', 1, null, '', '', ''), '2015-1-12');

// season
test(add('2015-1-1', 1, null, ''), '2015-1-2');
test(add('2015-1-1', 1, null, '12/29-12/31'), '2015-1-2');
test(add('2015-1-1', 1, null, '12/20-1/20'), '2015-1-21');
test(add('2015-1-1', 1, null, '1/1-1/5'), '2015-1-6');
test(add('2015-1-1', 1, null, '12/29-1/6, 1/8'), '2015-1-7');
test(add('2015-1-1', 1, null, '1/1-12/31'), null); // 全休

// regular
test(add('2015-2-13', 1, null, null, null), '2015-2-16');
test(add('2015-2-13', 1, null, null, ''), '2015-2-14');
test(add('2015-2-9', 1, null, null, '木'), '2015-2-10');
test(add('2015-2-10', 1, null, null, '木'), '2015-2-13');
test(add('2015-2-13', 1, null, null, '木'), '2015-2-14');
test(add('2015-2-13', 1, null, null, '月,火,水,木,金,土,日'), null);
function checkRegular (t) {
  // 毎月 10日, 20日, 30日は定休日
  return t.getDate() % 10 === 0;
}
test(add('2015-2-8', 1, null, null, checkRegular), '2015-2-9');
test(add('2015-2-9', 1, null, null, checkRegular), '2015-2-12');
test(add('2015-2-19', 1, null, null, checkRegular), '2015-2-21');
test(add('2015-4-28', 1, null, null, checkRegular), '2015-5-1');

// holidays
var holidays = '1/5, 2/10, 3/5-3/10';
test(add('2015-1-1', 1, null, '', '', holidays), '2015-1-2');
test(add('2015-1-4', 1, null, '', '', holidays), '2015-1-6');
test(add('2015-2-8', 2, null, '', '', holidays), '2015-2-11');
test(add('2015-3-4', 1, null, '', '', holidays), '2015-3-11');
function checkHolidays (t) {
  // 東京オリンピックの年は7月が休み
  return t.getFullYear() === 2020 && t.getMonth() === 6;
}
test(add('2020-6-29', 1, null, '', '', checkHolidays), '2020-6-30');
test(add('2020-7-4', 1, null, '', '', checkHolidays), '2020-8-1');
test(add('2015-10-10', 1, null, '', '', '1/1-12/31'), null);  // 全休
test(add('2015-10-10', 1, null, '', '', function(){return true;}), null);  // 全休




