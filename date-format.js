/*
 * Copyright(c) 2015 Yuki Kurata <yuki.kurata@gmail.com>
 * MIT Licensed
 */

/*jshint maxparams:8 */

/**
 * 日時を書式に基づいて変換します
 * 日本の年号、祝日、営業日に対応しています
 *
 * フォーマット文字列はPHPのdate関数をベースに拡張しています
 *  date関数: http://php.net/manual/ja/function.date.php
 *  タイムゾーン等一部のパターンは未実装です
 *
 * 西暦1年1月1日以降に対応
 *
 * 和暦表示対応
 *   年号は明治・大正・昭和・平成が登録されています
 *   未来の年号と年の一致は保証されていません
 *   新しい年号はNENGOに追加してください
 *   明治6年1月1日より前の日付では、年号のかわりに西暦が使用されます
 *
 * 祝日対応
 *   祝日法施行以降([昭和23年]1948/7/20-)の祝日にのみ対応しています
 *   それ以前に祝日とされていた四大節等には対応していません
 *   将来の春分の日、秋分の日は予測になり、保証するものではありません
 *   新しい祝日は都度HOLIDAYSに追加してください
 *   ある年の祝日をオブジェクトで取得する関数を利用することもできます
 *     date_format.getHolidays(year)
 *   
 *
 * 営業日
 *   date_formatには簡易的に営業日を算出する機能があります
 *   第三引数に数字を設定することによりその日数分だけ、営業日へ対象をずらし
 *   書式を変更することができます
 *   営業日の計算は次の条件で行います
 *    日本の祝日を適用する
 *    土日を定休日とする
 *    年末年始は12/29-1/3を休業日とする
 *   あくまで簡易的な機能のため、複雑な営業日の計算を行いたい場合は、
 *   次の関数であらかじめ営業日を算出してから第一引数に設定する必要があります
 *   date_format.addEigyobi(date, days, include, season, regular, holidays)
 *   関数の使用方法は、addEigyobiのコメントを確認してください
 *   また、補助関数として営業日数をカウントするものが用意されています
 *   date_format.countEigyobi(from, to, season, regular, holidays)
 *     (この関数は書式変換では使用しませんが、便利であるため定義されています)
 * 
 * @method date_format
 * @param  {Date}   value   日時形式の文字列の場合はDateオブジェクトに変換します
 * @param  {String} format  省略時は'Y-m-d H:i:s'
 * @param  {Number} eigyobi 営業日
 * @return {String} formatString
 */
var date_format = (function (){

  /**
   * *********************************************************
   *                       定数定義
   * *********************************************************
   * (関数可)は、固定値の代わりにDateを受け取りBoolean(休みかどうか)を
   * 返す関数を定義することもできます
   */

  // 既定のフォーマット
  var DEFAULT_FORMAT = 'Y-m-d H:i:s';

  // 一日のミリ秒
  var A_DAY = 86400000;

  // 定休日 (関数可)
  var REGULAR_HOLIDAY = '土,日';

  // 年末年始・お盆の休みの定義 (関数可)
  var SEASON_HOLIDAY = '12/29-1/3';

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
   * 祝日法施行以降(1948/7/20-)の祝日を定義する
   */
  var HOLIDAYS = [

    // 祝日
    '元日         1/1',
    '成人の日     -1999/1/15  2000-/1/2Mon',
    '建国記念の日 1967-/2/11',
    '春分の日',   // 計算
    '天皇誕生日   -1988/4/29',
    'みどりの日   1989-2006/4/29',
    '昭和の日     2007-/4/29',
    '憲法記念日   5/3',
    'みどりの日   2007-/5/4',
    'こどもの日   5/5',
    '海の日       1996-2002/7/20  2003-/7/3Mon',
    '山の日       2016-/8/11',
    '敬老の日     1966-2002/9/15  2003-/9/3Mon',
    '秋分の日',   // 計算
    '体育の日     1966-1999/10/10 2000-/10/2Mon',
    '文化の日     11/3',
    '勤労感謝の日 11/23',
    '天皇誕生日   1989-/12/23',

    // 皇室慶弔行事
    '皇太子・明仁親王の結婚の儀  1959/4/10',
    '昭和天皇の大喪の礼          1989/2/24',
    '即位の礼正殿の儀            1990/11/12',
    '皇太子・徳仁親王の結婚の儀  1993/6/9'

  ];

  /**
   * HOLIDAYSの代わりに祝日を判定する関数
   * @param  {Date}    date
   * @return {Boolean} isHoliday
   */
  var HOLIDAYS_FN = null;

  /**
   * *********************************************************
   *               パラメータ文字列の変換定義
   * *********************************************************
   */
  var PARAMS = {

    //  -----  カスタマイズ  -----

    // 日付 2015/04/06
    hizuke: function (t) {
      return this.Y(t) + '/' + this.m(t) + '/' + this.d(t);
    },

    // 和暦-年区切り   平成1年1月7日
    wareki: function (t) {
      return this.nengo(t) + this.nen(t) + '年' + this.n(t) + '月' + this.j(t) + '日';
    },

    // 和暦-日付区切り 昭和64年1月7日
    wareki2: function (t) {
      return this.Nengo(t) + this.Nen(t) + '年' + this.n(t) + '月' + this.j(t) + '日';
    },

    //  -----  年  -----

    // 西暦-4桁    2014
    Y: function (t) {return t.getFullYear();},

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
    S: function (t) {return SUFFIX[t.getDate()];},

    // 年通算日数  0から開始
    z: function (t) {return Math.floor((t.getTime() - new Date(t.getFullYear(), 0, 1).getTime()) / A_DAY); },


    // -----  曜日  -----

    // 日:0 -> 土:6
    w: function (t) {return t.getDay();},

    // 月:1 -> 日:7
    N: function (t) {return t.getDay() || 7;},

    // Monday
    l: function (t) {return WEEK[t.getDay()];},

    // Mon
    D: function (t) {return WEEK_SHORT[t.getDay()];},

    // 日本語 月, 火, 水
    yobi: function (t) {return JWEEK[t.getDay()];},

    // 日本語 月, 火, 祝
    yobi2: function (t) {return this.holiday(t) ? '祝' : this.yobi(t);},

    // 日本語 月曜日, 火曜日, 祝日
    yobi3: function (t) {
      var y = this.yobi2(t);
      return y + ( y === '祝' ? '日' : '曜日');
    },


    //  -----  営業日  -----

    // 月, 火, 休
    eigyo: function (t) { return isOpened(t) ? this.yobi(t) : '休';},

    // 月曜日, 火曜日, 休業日
    eigyo2: function (t) {
      var eg = this.eigyo(t);
      return eg + (eg === '休' ? '業日' : '曜日');
    },


    //  -----  祝日  -----

    // 祝日名  元日, 成人の日
    holiday: function (t) {
      var key = (t.getMonth() + 1) * 100 + t.getDate();
      return getHolidays(t.getFullYear())[key] || '';
    },

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

  /**
   * *********************************************************
   *                    フォーマット関数
   * *********************************************************
   */

  // パラメータ文字列を文字長が大きい順に並びかえる(REG_MUSH用)
  var paramKeys = Object.keys(PARAMS).sort(function(x, y){
    return y.length - x.length;
  });

  // パラメータ文字列を{}付きするための正規表現
  var REG_MUSH = new RegExp(paramKeys.join('|'), 'g');

  // {}付きパラメータ文字列を検出する正規表現
  var REG_PLACE = /\{(\w+)\}/g;

  // (exports)  定義コメントはヘッダーで確認
  function formatDate (value, format, eigyobi) {
    value = toDate(value);
    if (!value) {
      return '';
    }

    if (typeof eigyobi === 'number') {
      value = addEigyobi(value, eigyobi);
    }

    format = format || DEFAULT_FORMAT;
    if (!~format.indexOf('{')) {
      format = format.replace(REG_MUSH, function (x) { return '{' + x + '}';});
    }

    return format.replace(REG_PLACE, function (x, param){
      return param in PARAMS ? PARAMS[param](value) : x;
    });
  }

  // ['平成', 'H', '昭和', 'S',...]  正規表現やtoDateの中で使用
  var NENGO_NAMES = NENGO.reduce(function(x, nengo) {
    if (nengo.n) {
      x.push(nengo.N);
      x.push(nengo.n);
    }
    return x;
  }, []);

  // 和暦 -> 西暦 変換用 正規表現
  var REG_NENGO = new RegExp('^(' + NENGO_NAMES.join('|') + ')(\\d+)\\D+(\\d+)\\D+(\\d+)\\D*$');

  /**
   * Dateオブジェクトを作成
   * 
   * 文字列からDateに対応
   * 和暦から西暦にも対応
   * @method toDate
   * @param  {Date|String} value
   * @return {Date}        date
   */
  function toDate(value) {
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? null : new Date(value);
    }
    if (typeof value !== 'string') {
      return null;
    }
    // 和暦時西暦に変換
    value = value.replace(REG_NENGO, function(x, n, y, m, d) {
      var idx = parseInt(NENGO_NAMES.indexOf(n) / 2, 10);
      return (NENGO[idx].y + y * 1 - 1) + '-' + m + '-' + d;
    });
    value = new Date(value);
    return Number.isNaN(value.getTime()) ? null : value;
  }

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
    // 日本でのグレゴリオ歴の導入は1873年（明治6年）以降。明治の元年〜5年は西暦を返す
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
  var month = ('January,February,March,April,May,June,' +
      'July,August,September,October,November,December').split(',');
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
  var SUFFIX = ('0,' +
    'st,nd,rd,th,th,th,th,th,th,th,' +
    'th,th,th,th,th,th,th,th,th,th,' +
    'st,nd,rd,th,th,th,th,th,th,th,st').split(',');

  // 曜日一覧
  var WEEK = 'Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'.split(',');
  var WEEK_SHORT = 'Sun,Mon,Tue,Wed,Thu,Fri,Sat'.split(',');

  // 曜日一覧 日本語
  var JWEEK = '日月火水木金土'.split('');

  // 漢数字
  var JNUM = ',一,二,三,四,五,六,七,八,九'.split(',');

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
        return x === '0' ? '〇' : JNUM[x * 1];
      }).join('');
    }

    var kurai = ('0000' + num).slice(-4).split('');
    var s = kurai[0] * 1;
    var h = kurai[1] * 1;
    var j = kurai[2] * 1;
    var i = kurai[3] * 1;

    return (s === 0 ? '' : s === 1 ? '千' : JNUM[s] + '千') +
           (h === 0 ? '' : h === 1 ? '百' : JNUM[h] + '百') +
           (j === 0 ? '' : j === 1 ? '十' : JNUM[j] + '十') +
           (i === 0 ? '' : JNUM[i]);
  }

  /**
   * *********************************************************
   *                       営業日計算
   * *********************************************************
   */

  /**
   * 営業日の算出
   *
   * 営業日を計算します
   * 時間部分の値は変化しません
   * 
   * 営業日のルールは以下のとおり
   *
   * 加算する日数に1以上の場合は、翌営業日からカウントして算出します
   * 加算する日数が0の場合は、dataが営業日であればdateを、そうでない場合は翌営業日を返します
   * 加算する日数が-1以下の場合は、さかのぼって算出します
   *
   * その際includeがtrueの場合、dateもカウントの対象に含みます
   * 加算する日数が0の場合はincludeは無視されます
   * 
   * regularは定休日を指定します。文字列で曜日を記述します複数ある場合はカンマ区切り
   * 既定値は定数のREGULAR_HOLIDAYです
   * 関数を指定した場合は、引数に日にちが渡され休みの場合にtrue、営業日にfalseを返すようにします
   *
   * seasonに年末年始/お盆の休みを指定することができます
   * 文字列で休みの日にちもしくは期間を指定してください。複数指定する場合はカンマ区切り
   * 既定値は定数のSEASON_HOLIDAYです
   *
   * holidaysは月/日をカンマ区切りで指定することで祝日を指定することができます
   * 設定しない場合は、日本の祝日を自動計算し休業日とします
   * 関数を指定した場合は、引数に日にちが渡され休みの場合にtrue、営業日にfalseを返すようにします
   * 既定値はHOLIDAY_FNです(HOLIDAY_FNがnullの場合は自動計算です)
   * 
   * @method addEigyobi
   * @param  {Date|String}     date
   * @param  {Number}          days     加算する日数
   * @param  {Boolean}         include  初日を含む
   * @param  {String}          season   年末年始/お盆の休み
   * @param  {String|Function} regular  定休日(週)
   * @param  {String|Function} holidays 祝日
   */
  function addEigyobi(date, days, include, season, regular, holidays) {
    date = toDate(date);
    if (!date) {
      return null;
    }

    // 0の場合の補正  +1営業日で前日からにすると同じ
    if (days === 0) {
      days = 1;
      date.setTime(date.getTime() - A_DAY);

    } else if (include) {
      // 当日を含む場合は、一日前（先）にずらして調査すると同じ
      date.setTime(date.getTime() + (0 < days ? -A_DAY : A_DAY));
    }

    // 営業日判別の設定取得
    var config = getOpenedConfig(season, regular, holidays);

    // 最大調査日数
    var max = 365;

    // 以下営業日の計算
    while(days) {
      date.setTime(date.getTime() + (0 < days ? A_DAY : -A_DAY));
      if (isOpened(date, config)) {
        days = 0 < days ? days - 1 : days + 1;
      }
      if (--max < 0) {
        return null;
      }
    }
    return date;
  }

  /**
   * 営業日数の調査
   * @method countEigyobi
   * @param  {String|Date}     from
   * @param  {String|Date}     to
   * @param  {String}          season   年末年始/お盆の休み
   * @param  {String|Function} regular  定休日(週)
   * @param  {String|Function} holidays 祝日
   * @return {Number}          count
   */
  function countEigyobi (from, to, season, regular, holidays) {
    from = toDate(from);
    to = toDate(to);
    if (!from || !to) {
      return null;
    }
    // 時分秒は切り捨てる
    from = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    to = new Date(to.getFullYear(), to.getMonth(), to.getDate());
    if (to.getTime() < from.getTime()) {
      return null;
    }

    // 営業日判別の設定取得
    var config = getOpenedConfig(season, regular, holidays);

    // 営業日数調査
    var count = 0;
    while(from.getTime() <= to.getTime()) {
      if (isOpened(from, config)) {
        count++;
      }
      from.setTime(from.getTime() + A_DAY);
    }

    return count;
  }

  /**
   * 営業日判別の設定取得
   * @method getOpenedConfig
   * @param  {String}          season   年末年始/お盆の休み
   * @param  {String|Function} regular  定休日(週)
   * @param  {String|Function} holidays 祝日
   * @return {Object}          config   営業日判別の設定
   */
  function getOpenedConfig (season, regular, holidays) {

    // 規定値
    if (season === undefined || season === null) {
      season = SEASON_HOLIDAY;
    }
    if (regular === undefined || regular === null) {
      regular = REGULAR_HOLIDAY;
    }
    if (holidays === undefined || holidays === null) {
      holidays = HOLIDAYS_FN;
    }

    // 定休日(週)
    var regularWeek = null;

    // 休日
    var closed;

    // 祝日を自動計算するかどうか
    var holidayAuto = holidays === null;

    // 定休日のカスタム関数
    var regularFn = typeof regular === 'function' ? regular : null;

    // 祝日のカスタム関数
    var holidayFn = typeof holidays === 'function' ? holidays : null;

    // 定休日(週)
    if (typeof regular === 'string') {
      var weeks = [].slice.call(WEEK).concat(WEEK_SHORT).concat(JWEEK);
      regularWeek = regular.split(',').map(function(w){
                      return weeks.indexOf(w.trim()) % 7;
                    }).filter(function(x){return ~x;});
      regularWeek = regularWeek.length ? regularWeek : null;
    }

    // 年末年始/お盆休み
    if (season === '') {
      closed = [];
    } else if (typeof season === 'string') {
      closed = getDateArray(season);
    }

    // 祝日を固定で指定
    if (typeof holidays === 'string') {
      closed = closed.concat(getDateArray(holidays));
    }

    return {
      regularWeek: regularWeek,
      closed     : closed,
      holidayAuto: holidayAuto,
      regularFn  : regularFn,
      holidayFn  : holidayFn
    };
  }

  /**
   * 営業日なのかどうか
   * @method isOpened
   * @param  {Date}  date
   * @param  {Object}  config
   * @return {Boolean} opened
   */
  function isOpened(date, config) {
    config = config || getOpenedConfig();

    // 日付キー
    var key = (date.getMonth() + 1) * 100 + date.getDate() * 1;

    // 曜日の定休日のチェック
    if (config.regularWeek && ~config.regularWeek.indexOf(date.getDay())) {
      return false;
    }

    // 日付指定の休日チェック (年末年始、お盆、自動計算ではない祝日)
    if (~config.closed.indexOf(key)) {
      return false;
    }

    // 祝日（自動計算）によるチェック
    if (config.holidayAuto && (key in getHolidays(date.getFullYear()))) {
      return false;
    }

    // 定休日のカスタム関数でチェック
    if (config.regularFn && config.regularFn(date)) {
      return false;
    }

    // 祝日のカスタム関数でチェック
    if (config.holidayFn && config.holidayFn(date)) {
      return false;
    }

    return true;
  }

  // 月日の期間の正規表現
  var REG_DATE_LIST = /^(\d{1,2})\/(\d{1,2})(?:-(\d{1,2})\/(\d{1,2}))?$/;

  /**
   * 文字列から月日の配列を作成する
   *
   * '12/29-1/3, 8/16-8/18, 10/10'
   *     -> [1229, 1230, 1231, 101, 102, 103, 816, 817, 818, 1010] 
   * @method getDateArray
   * @param  {String}     value
   * @return {Array}
   */
  function getDateArray(value) {
    var result = [];
    value.split(',').forEach(function(s){
      var m = s.trim().match(REG_DATE_LIST);
      if (m && m[3]) {
        var m1 = m[1] * 1;
        var d1 = m[2] * 1;
        var m2 = m[3] * 1;
        var d2 = m[4] * 1;
        if (m2 < m1) {
          m2 += 12;
        }
        while(m1 * 100 + d1 <= m2 * 100 + d2) {
          result.push((12 < m1 ? m1 - 12 : m1) * 100 + d1);
          if (31 <= d1) {
            m1++;
            d1 = 1;
          } else {
            d1++;
          }
        }
      } else if (m){
        result.push(m[1]*100 + m[2]*1);
      }
    });
    return result;
  }

  /**
   * *********************************************************
   *                       祝日の計算
   * *********************************************************
   */

  // キャッシュ
  var holidayCache = {};

  /**
   * 祝日一覧を取得する
   * キーに日にち、値に祝日名が設定されたオブジェクトを返す
   * 
   *  {'101': '元日', '111': '成人の日', '211': '建国記念日', （省略...）
   * 
   * @method getHolidays
   * @param  {Number}   year
   * @return {Object}   holidays
   */
  function getHolidays(year) {
    var holidays = holidayCache[year];
    if (holidays) {
      return holidays;
    }
    // 祝日法が制定される前は計算しない
    if (year < 1948) {
      return {};
    }

    // 祝日を計算し追加
    holidays = {};
    HOLIDAYS.forEach(function (item) {
      var h = parseHoliday(year, item);
      if (h) {
        var key = h[0] * 100 + h[1];
        holidays[key] = h[2];
      }
    });

    // 振替休日・国民の休日を設定
    setKyujitu(year, holidays);

    // 1948/1/1-1948/7/19の施行前なので消す
    if (year === 1948) {
      Object.keys(holidays).forEach(function(key){
        if (key*1 < 720) {
          delete holidays[key];
        }
      });
    }

    // キャッシュに保存
    holidayCache[year] = holidays;

    return holidays;
  }

  // 祝日定義の日にち部分の正規表現
  var REG_HOLIDAY = /^(?:(\d+)?(-)?(\d+)?\/)?(\d+)\/(\d+)(Sun|Mon|Tue|Wed|Thu|Fri|Sat)?$/;

  /**
   * 祝日の定義から、祝日であれば日にちを返す。祝日でないならnullを返す
   *   例
   *     year    = 2016
   *     item    = '海の日 1996-2002/7/20  2003-/7/3Mon'
   *     holiday = [7, 18, '海の日']
   * 
   * @method parseHoliday
   * @param  {Number}     year
   * @param  {String}     item
   * @return {Array}      holiday
   */
  function parseHoliday(year, item) {
    var data = item.match(/(\S+)/g);
    var name = data[0];
    if (name === '春分の日') {
      return getShunbun(year);
    }
    if (name === '秋分の日') {
      return getShubun(year);
    }
    for(var i = 1; i < data.length; i++) {
      var m = data[i].match(REG_HOLIDAY);
      if (m) {
        var month = m[4] * 1;
        var from = (m[1] || (month < 7 ? 1949 : 1948)) * 1;
        var to = (m[3] || (m[2] ? year : (m[1] || year))) * 1;
        var day = m[6] ? getXDay(year, month, m[5], m[6]) : m[5] * 1;
        if (from <= year && year <= to) {
          return [month, day, name];
        }
      }
    }
    return null;
  }

  /**
   * 春分の日 (wikiの簡易計算より)
   * @method getShunbun
   * @param  {Number}   year
   * @return {Array}    shunbun
   */
  function getShunbun(year) {
    if (2099 < year) {
      return null;
    }
    var day;
    switch(year % 4) {
    case 0:
      day = year <= 1956 ? 21 : year <= 2088 ? 20 : 19;
      break;
    case 1:
      day = year <= 1989 ? 21 : 20;
      break;
    case 2:
      day = year <= 2022 ? 21 : 20;
      break;
    case 3:
      day = year <= 1923 ? 22 : year <= 2055 ? 21 : 20;
    }
    return [3, day, '春分の日'];
  }

  /**
   * 秋分の日 (wikiの簡易計算より)
   * @method getShubun
   * @param  {Number}  year
   * @return {Array}   shubun
   */
  function getShubun(year) {
    if (2099 < year) {
      return null;
    }
    var day;
    switch(year % 4) {
    case 0:
      day = year <= 2008 ? 23 : 22;
      break;
    case 1:
      day = year <= 1917 ? 24 : year <= 2041 ? 23 : 22;
      break;
    case 2:
      day = year <= 1946 ? 24 : year <= 2074 ? 23 : 22;
      break;
    case 3:
      day = year <= 1979 ? 24 : 23;
    }
    return [9, day, '秋分の日'];
  }

  /**
   * 振替休日・国民の休日を設定する
   * @method setKyujitu
   * @param  {Number}   year
   * @param  {Object}   holidays
   */
  function setKyujitu(year, holidays) {
    var last = null;

    /**
     * 国民の休日
     * 施行: 1988-
     */
    var kokumin = [];
    if (1988 <= year) {
      Object.keys(holidays).forEach(function(md) {
        var date = new Date(year, md.slice(0, -2) * 1 - 1, md.slice(-2) * 1);
        if (last){
          last.setTime(last.getTime() + A_DAY);
          if (last.getTime() + A_DAY === date.getTime()) {
            kokumin.push((last.getMonth() + 1) * 100 + last.getDate());
          }
        }
        last = date;
      });
    }

    /**
     * 振替休日
     * 施行: 1973/4/30-
     */
    var furikae = [];
    if (1973 <= year) {
      var activeTime = new Date(1973, 4-1, 29).getTime(); // 施行前日の祝日から適用
      var flg = false;
      var keys = Object.keys(holidays);
      keys.push('1231');
      keys.forEach(function(md) {
        var date = new Date(year, md.slice(0, -2) * 1 - 1, md.slice(-2) * 1);
        if (flg) {
          last.setTime(last.getTime() + A_DAY);
          if (last.getTime() !== date.getTime()) {
            furikae.push((last.getMonth() + 1) * 100 + last.getDate());
            flg = false;
          }
        } else {
          flg = date.getDay() === 0 && activeTime <= date.getTime();
        }
        last = date;
      });
    }

    furikae.forEach(function(x){
      holidays[x] = '振替休日';
    });

    kokumin.forEach(function (x){
      if (x in holidays) {
        return;
      }
      holidays[x] = '国民の休日';
    });
  }

  /**
   * 第x name曜日の日にちを返す
   * @method getXDay
   * @param  {Number} year
   * @param  {Number} month
   * @param  {Number} x
   * @param  {String} name   Sun/Mon/Tue/Wed/Thu/Fri/Sat
   * @return {Number} day
   */
  function getXDay(year, month, x, name) {
    var w = WEEK_SHORT.indexOf(name);               // 曜日のインデックス
    var f = new Date(year, month - 1, 1).getDay(); // 1日のインデックス
    var d1 = 1 + w - f + (w < f ? 7 : 0);          // 第1の日にち
    return d1 + (x - 1) * 7;                       // 第xの日にち
  }

  /**
   * *********************************************************
   *                  読取専用プロパティ
   * *********************************************************
   */
  // 引数省略時のフォーマット
  formatDate.defaultFormat = DEFAULT_FORMAT;

  // サポートしているパラメータ文字列一覧
  formatDate.paramKeys = Object.keys(PARAMS);

  /**
   * *********************************************************
   *                       補助関数
   * *********************************************************
   */
  // 営業日の計算関数
  formatDate.addEigyobi = addEigyobi;

  // 営業日数の計算関数
  formatDate.countEigyobi = countEigyobi;

  // 休日取得関数
  formatDate.getHolidays = getHolidays;

  return formatDate;
})();

// node時
if (typeof global === 'object' && typeof module === 'object') {
  module.exports = date_format;
}