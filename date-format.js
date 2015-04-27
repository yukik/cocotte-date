/**
 * 日時を書式に基づいて変換します
 *
 * PHPのdate関数をベースに和暦などを追加しています
 *  date関数: http://php.net/manual/ja/function.date.php
 *  タイムゾーン等一部のパターンは未実装です
 *
 * 西暦1年1月1日以降に対応
 *
 * 和暦表示対応
 *   年号は明治・大正・昭和・平成が登録されています
 *   明治6年1月1日より前の日付では、年号のかわりに西暦が使用されます
 *
 * @method date_format
 * @param  {Date}   value  日時形式の文字列の場合はDateオブジェクトに変換します
 * @param  {String} format 省略時は'Y-m-d H:i:s'
 * @return {String} result
 */
var date_format = (function (){

  // 一日のミリ秒
  var A_DAY = 86400000;

  // パラメータ文字列の変換定義
  var PARAMS = {

    //  -----  カスタマイズ  -----

    // 日付 2015/04/06
    hizuke : function (t) {
      return this.Y(t) + '/' + this.m(t) + '/' + this.d(t);
    },

    // 和暦-年区切り   平成1年1月7日
    wareki : function (t) {
      return this.nengo(t) + this.nen(t) + '年' + this.n(t) + '月' + this.j(t) + '日';
    },

    // 和暦-日付区切り 昭和64年1月7日
    wareki2 : function (t) {
      return this.Nengo(t) + this.Nen(t) + '年' + this.n(t) + '月' + this.j(t) + '日';
    },

    //  -----  年  -----

    // 西暦-4桁    2014
    Y    : function (t) {return t.getFullYear();},

    // 西暦-下2桁  14
    y: function (t) {return String(t.getFullYear()).slice(-2);},

    // うるう年判定  1:うるう年、0:平年
    L: function (t) {return new Date(t.getFullYear(), 1, 29).getDate() === 29 ? 1 : 0;},


    // -----  和暦 (年区切り)-----

    // 和暦-年号   平成
    nengo: function (t) {return getNengo(t).N;},

    // 和暦-年号   H
    nengo2: function (t) {return getNengo(t).n;},

    // 和暦-年     1,  27
    nen: function (t) {
      return t.getFullYear() - getNengo(t).y + 1;
    },

    // 和暦-年     元,  27
    nen2: function (t) {
      var n = t.getFullYear() - getNengo(t).y + 1;
      return n === 1 ? '元' : n;
    },

    // 和暦-年     元,  二十七,  一八七二  (西暦になった場合はnen4と同じ表記)
    nen3: function (t) {
      var n = t.getFullYear() - getNengo(t).y + 1;
      return n === 1 ? '元' : kan(n, 100 < n);
    },

    // 和暦-年     元,  二七,    一八七二
    nen4: function (t) {
      var n = t.getFullYear() - getNengo(t).y + 1;
      return n === 1 ? '元' : kan(n, true);
    },


    // -----  和暦 (日付区切り) -----

    // 和暦-年号  平成
    Nengo: function (t) {return getNengo(t, true).N;},

    // 和暦-年号  H
    Nengo2: function (t) {return getNengo(t, true).n;},

    // 和暦-年    1,  24
    Nen: function (t) {
      return t.getFullYear() - getNengo(t, true).y + 1;
    },

    // 和暦-年    元,  24
    Nen2: function (t) {
      var n = t.getFullYear() - getNengo(t, true).y + 1;
      return n === 1 ? '元' : n;
    },

    // 和暦-年    元,  二十四,  一八七二  (西暦になった場合はNen4と同じ表記)
    Nen3: function (t) {
      var n = t.getFullYear() - getNengo(t, true).y + 1;
      return n === 1 ? '元' : kan(n, 100 < n);
    },

    // 和暦-年    元,  二四,    一八七二
    Nen4: function (t) {
      var n = t.getFullYear() - getNengo(t, true).y + 1;
      return n === 1 ? '元' : kan(n, true);
    },


    // -----  月  -----

    // 0あり   08,  12 
    m    : function (t) {return ('0' + (t.getMonth() + 1)).slice(-2);},

    // 0無し    8,  12
    n: function (t) {return t.getMonth() + 1;},

    // 英語    August
    F: function (t) {return month[t.getMonth()];},

    // 英語    Aug
    M: function (t) {return month[t.getMonth()].substring(0, 3);},

    // 漢数字  八,  十二
    tuki: function (t) {return kan(t.getMonth() + 1);},

    // 漢数字  八,  一二
    tuki2: function (t) {return kan(t.getMonth() + 1, true);},

    // 月の日数 28, 29, 30, 31
    t: function (t) {
      var c = new Date(t.getFullYear(), t.getMonth() + 1, 0);
      return c.getDate();
    },


    // -----  週  -----

    // 週番号
    W: function (t) {return weeks(t);},


    // -----  日  -----

    // 05,  25
    d  : function (t) {return ('0' + t.getDate()).slice(-2);},

    //  5,  25
    j: function (t) {return t.getDate();},

    // 漢数字 二十四
    niti: function (t) {return kan(t.getDate());},

    // 漢数字 二四
    niti2: function (t) {return kan(t.getDate(), true);},

    // 接尾語 st nd rd th
    S: function (t) {return suffix[t.getDate()];},

    // 年通算日数  0から開始
    z: function (t) {return Math.floor((t.getTime() - new Date(t.getFullYear(), 0, 1).getTime()) / A_DAY); },


    // -----  曜日  -----

    // 日:0 -> 土:6
    w: function (t) {return t.getDay();},

    // 月:1 -> 日:7
    N: function (t) {return t.getDay() || 7;},

    // Monday
    l: function (t) {return week[t.getDay()];},

    // Mon
    D: function (t) {return week[t.getDay()].substring(0,3);},

    // 日本語 月 (曜日)
    yobi: function (t) {return jweek[t.getDay()];},



    //  -----  時  -----

    // 12時間 0無し    3
    g: function (t) {return t.getHours() % 12;},

    // 24時間 0無し    3, 15
    G: function (t) {return t.getHours();},

    // 12時間 0あり    03, 15
    h: function (t) {return ('0' + t.getHours() % 12).slice(-2);},

    // 24時間 0あり    15
    H: function (t) {return ('0' + t.getHours()).slice(-2);},


    //  -----  分  -----

    // 0あり  05,  38
    i: function (t) {return ('0' + t.getMinutes()).slice(-2);},


    //  -----  秒  -----

    // 0あり  07,  29
    s: function (t) {return ('0' + t.getSeconds()).slice(-2);},


    //  -----  マイクロ秒  -----

    // 065000  (ミリ秒までしか計測できないので下3桁は常に0になる)
    u: function (t) {return ('00' + t.getMilliseconds()).slice(-3) + '000'; },


    //  -----  午前午後  -----

    // am/pm
    a: function (t) {return t.getHours() < 12 ? 'am' : 'pm';},

    // AM/PM
    A: function (t) {return t.getHours() < 12 ? 'AM' : 'PM';},

    // 午前/午後
    aj: function (t) {return t.getHours() < 12 ? '午前' : '午後';}
  };


  // ここまでパラメータ文字列定義、ここからロジック


  var paramKeys = Object.keys(PARAMS).sort(function(x, y){
    return y.length - x.length;
  });

  // パラメータ文字列を{}付きするための正規表現
  var REG_MUSH = new RegExp(paramKeys.join('|'), 'g');

  // {}付きパラメータ文字列を検出する正規表現
  var REG_PLACE = /\{(\w+)\}/ig;

  // (exports)
  function formatDate (value, format) {
    if (typeof value === 'string') {
      value = new Date(value);
    } else if (!(value instanceof Date)) {
      return '';
    }

    if (Number.isNaN(value.getTime())) {
      return '';
    }

    format = format || formatDate.defaultFormat;
    if (!~format.indexOf('{')) {
      format = format.replace(REG_MUSH, function (x) { return '{' + x + '}';});
    }

    return format.replace(REG_PLACE, function (x, param){
      return param in PARAMS ? PARAMS[param](value) : '{' + param + '}';
    });
  }

  /**
   * 年号
   *  N: 年号の正式表記
   *  n: 年号の略式表記
   *  y: その年号の最初の年 (元年)
   *  d: その年号の最初の日
   */
  var NENGO = [
    {N: '平成', n: 'H', y: 1989, d: new Date('1989-01-08 00:00:00.000')},
    {N: '昭和', n: 'S', y: 1926, d: new Date('1926-12-25 00:00:00.000')},
    {N: '大正', n: 'T', y: 1912, d: new Date('1912-07-30 00:00:00.000')},
    {N: '明治', n: 'M', y: 1868, d: new Date('1868-01-25 00:00:00.000')},
    {N: '西暦', n: '' , y:    1, d: new Date('0001-01-01 00:00:00.000')}
  ];

  /**
   * 年号オブジェクトの取得
   * @method getNengo
   * @param  {Date}    date
   * @param  {Boolean} isStrict  true時は日付で年号の境を判定。falseでは年単位
   * @return {Object}  nengo
   */
  function getNengo (date, isStrict) {
    var seireki = NENGO[NENGO.length - 1];
    var Y = date.getFullYear();
    // 日本でのグレゴリア歴の導入は1873年（明治6年）以降。明治の元年〜5年は西暦を返す
    if (Y < 1873) {
      return seireki;
    }
    for(var i = 0, len = NENGO.length; i < len; i++) {
      var item = NENGO[i];
      if (isStrict && item.d <= date || !isStrict && item.y <= Y) {
        return item;
      }
    }
    return seireki;
  }

  // 月名一覧
  var month = ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'];

  /**
   * 週番号を取得
   * 月曜始まりに基づいています
   * @method weeks
   * @param  {Date}   t
   * @return {Number} weeks
   */
  function weeks (t) {
    var d1_1 = new Date(t.getFullYear(), 0, 1);         // 1月1日
    var index = (t - d1_1) / A_DAY + d1_1.getDay() - 1; // 日のインデックス
    return Math.floor(index / 7) + 1;
  }

  // 日の接尾語
  var suffix = [ '',
    'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
    'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'th',
    'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th', 'th', 'st'
  ];

  // 曜日一覧
  var week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
              'Thursday', 'Friday', 'Saturday'];

  // 曜日一覧 日本語
  var jweek = ['日', '月', '火', '水', '木', '金', '土'];

  // 漢数字
  var jnum = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

  /**
   * 漢数字変換
   * 年、月、日の数字を漢数字に変更します
   * 0-9999以外は空文字を返します
   * 第二引数(既定値:false)による動作の違いは以下のとおり
   *
   *        3    10    15    20     24      63        1998        2000      2015
   * false: 三   十   十五  二十  二十四  六十三  千九百九十八    二千    二千十五
   * true : 三  一〇  一五  二〇   二四    六三    一九九八     二〇〇〇  二〇一五
   * 
   * @method kan
   * @param  {Number}  num
   * @param  {Boolean} shrt
   * @return {String}  kansuji
   */
  function kan (num, shrt) {
    // イレギュラー
    if (num === 0) {
      return '〇';
    } else if (num < 0 || 9999 < num) {
      return '';
    }


    if (shrt) {
      return ('' + num).split('').map(function(x){
        return x === '0' ? '〇' : jnum[x * 1];
      }).join('');
    }

    var kurai = ('0000' + num).slice(-4).split('');
    var s = kurai[0] * 1;
    var h = kurai[1] * 1;
    var j = kurai[2] * 1;
    var i = kurai[3] * 1;

    return (s === 0 ? '' : s === 1 ? '千' : jnum[s] + '千') +
           (h === 0 ? '' : h === 1 ? '百' : jnum[h] + '百') +
           (j === 0 ? '' : j === 1 ? '十' : jnum[j] + '十') +
           (i === 0 ? '' : jnum[i]);
  }


  // 引数省略時のフォーマット
  formatDate.defaultFormat = 'Y-m-d H:i:s';

  // サポートしているパラメータ文字列
  formatDate.parameters = PARAMS;

  return formatDate;

})();

// node時
if (typeof global === 'object' && typeof module === 'object') {
  module.exports = exports = date_format;
}