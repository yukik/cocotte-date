
// カレンダーデータの取得
var get = require(global.minify ? '../minify' : '../date-format').getCalendarData;
var eq = require('assert').deepEqual;


console.log(get('2015/1', 'sun'));

 /**
  * カレンダーデータ
  *
  * カレンダーを作成しやすい元データを提供します
  * データはオプションの指定より
  * 
  * som    : 月のはじめ (start of month)
  * eom    : 月の終わり (end of month)
  * year   : 年
  * month  : 月
  * day    : 日
  * week   : 曜日 0:日->6:土
  * opened : 業務日ならtrue
  * holiday: 祝日名、祝日ではない場合はnull
  * 
  * sow    : 週のはじめ (start of week)   startWeek !== null時のみ
  * eow    : 週の終わり (end of week)     startWeek !== null時のみ
  * real   : ゴースト日はfalse            startWeek !== null時のみ
  * block  : 月ブロックのキー 2015-01     startWeek !== null時のみ
  * 
  *
  * @method getCalendarData
  * @param  {Number|String} range     期間     2015, '2015/4' 2015/4-2016/3'
  * @param  {String}        startWeek 開始曜日 規定値 null
  *                             指定した場合は、ghost/sow/eowが追加されます
  * @param  {Boolean}       six       月を6週分までghostを取るように設定します
  *                                       
  * @return {Array.Object} data 
  */