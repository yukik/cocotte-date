/*jshint maxlen:500*/

var format = require('./date-format');

var assert = require('assert');


// デフォルトフォーマット
assert.equal(format('2015-4-5'), '2015-04-05 00:00:00');

// hiduke
assert.equal(format('2015-4-5', 'hizuke'), '2015/04/05');
assert.equal(format('2015-4-5', 'hizuke'), format('2015-4-5', 'Y/m/d'));

// wareki, wareki2
assert.equal(format('2015-4-5', 'wareki') , format('2015-4-5', 'nengonen年n月j日'));
assert.equal(format('2015-4-5', 'wareki2'), format('2015-4-5', 'NengoNen年n月j日'));

// wareki,wareki2,nengo,nengo2,nen,nen2,nen3,nen4,Nengo,Nengo2,Nen,Nen2,Nen3,Nen4
var warekiHeader = ['', 'wareki'     , 'wareki2'           , 'nengo', 'nengo2', 'nen' , 'nen2', 'nen3'    , 'nen4'    , 'Nengo', 'Nengo2', 'Nen' , 'Nen2', 'Nen3'    , 'Nen4'    ];
var warekiData = [
  ['1872-01-01', '西暦1872年1月1日'  , '西暦1872年1月1日'  , '西暦' , ''      , '1872', '1872', '一八七二', '一八七二', '西暦' , ''      , '1872', '1872', '一八七二', '一八七二'],
  ['1872-12-31', '西暦1872年12月31日', '西暦1872年12月31日', '西暦' , ''      , '1872', '1872', '一八七二', '一八七二', '西暦' , ''      , '1872', '1872', '一八七二', '一八七二'],
  ['1873-01-01', '明治6年1月1日'     , '明治6年1月1日'     , '明治' , 'M'     , '6'   , '6'   , '六'      , '六'      , '明治' , 'M'     , '6'   , '6'   , '六'      , '六'      ],
  ['1911-12-31', '明治44年12月31日'  , '明治44年12月31日'  , '明治' , 'M'     , '44'  , '44'  , '四十四'  , '四四'    , '明治' , 'M'     , '44'  , '44'  , '四十四'  , '四四'    ],
  ['1912-01-01', '大正1年1月1日'     , '明治45年1月1日'    , '大正' , 'T'     , '1'   , '元'  , '元'      , '元'      , '明治' , 'M'     , '45'  , '45'  , '四十五'  , '四五'    ],
  ['1912-07-29', '大正1年7月29日'    , '明治45年7月29日'   , '大正' , 'T'     , '1'   , '元'  , '元'      , '元'      , '明治' , 'M'     , '45'  , '45'  , '四十五'  , '四五'    ],
  ['1912-07-30', '大正1年7月30日'    , '大正1年7月30日'    , '大正' , 'T'     , '1'   , '元'  , '元'      , '元'      , '大正' , 'T'     , '1'   , '元'  , '元'      , '元'      ],
  ['1925-12-31', '大正14年12月31日'  , '大正14年12月31日'  , '大正' , 'T'     , '14'  , '14'  , '十四'    , '一四'    , '大正' , 'T'     , '14'  , '14'  , '十四'    , '一四'    ],
  ['1926-01-01', '昭和1年1月1日'     , '大正15年1月1日'    , '昭和' , 'S'     , '1'   , '元'  , '元'      , '元'      , '大正' , 'T'     , '15'  , '15'  , '十五'    , '一五'    ],
  ['1926-12-24', '昭和1年12月24日'   , '大正15年12月24日'  , '昭和' , 'S'     , '1'   , '元'  , '元'      , '元'      , '大正' , 'T'     , '15'  , '15'  , '十五'    , '一五'    ],
  ['1926-12-25', '昭和1年12月25日'   , '昭和1年12月25日'   , '昭和' , 'S'     , '1'   , '元'  , '元'      , '元'      , '昭和' , 'S'     , '1'   , '元'  , '元'      , '元'      ],
  ['1988-12-31', '昭和63年12月31日'  , '昭和63年12月31日'  , '昭和' , 'S'     , '63'  , '63'  , '六十三'  , '六三'    , '昭和' , 'S'     , '63'  , '63'  , '六十三'  , '六三'    ],
  ['1989-01-01', '平成1年1月1日'     , '昭和64年1月1日'    , '平成' , 'H'     , '1'   , '元'  , '元'      , '元'      , '昭和' , 'S'     , '64'  , '64'  , '六十四'  , '六四'    ],
  ['1989-01-07', '平成1年1月7日'     , '昭和64年1月7日'    , '平成' , 'H'     , '1'   , '元'  , '元'      , '元'      , '昭和' , 'S'     , '64'  , '64'  , '六十四'  , '六四'    ],
  ['1989-01-08', '平成1年1月8日'     , '平成1年1月8日'     , '平成' , 'H'     , '1'   , '元'  , '元'      , '元'      , '平成' , 'H'     , '1'   , '元'  , '元'      , '元'      ],
  ['1990-01-01', '平成2年1月1日'     , '平成2年1月1日'     , '平成' , 'H'     , '2'   , '2'   , '二'      , '二'      , '平成' , 'H'     , '2'   , '2'   , '二'      , '二'      ],
  ['2015-04-27', '平成27年4月27日'   , '平成27年4月27日'   , '平成' , 'H'     , '27'  , '27'  , '二十七'  , '二七'    , '平成' , 'H'     , '27'  , '27'  , '二十七'  , '二七'    ]
];
warekiData.forEach(function(x){
  for(var i = 1, len = warekiHeader.length; i < len; i++) {
    assert.equal(format(x[0], warekiHeader[i]), x[i]);
  }
});

// Y
assert.equal(format('2015-4-5', 'Y'), '2015');

// y
assert.equal(format('2015-4-5', 'y'), '15');

// L
assert.equal(format('1900-1-1', 'L'), '0');
assert.equal(format('2000-1-1', 'L'), '1');
assert.equal(format('2004-1-1', 'L'), '1');
assert.equal(format('2100-1-1', 'L'), '0');
assert.equal(format('2015-4-5', 'L'), '0');
assert.equal(format('2016-1-1', 'L'), '1');

// m
assert.equal(format('2015-4-27' , 'm'), '04');
assert.equal(format('2015-12-27', 'm'), '12');

// n
assert.equal(format('2015-4-27' , 'n'), '4');
assert.equal(format('2015-12-27', 'n'), '12');

// F
assert.equal(format('2015-1-1' , 'F'), 'January');
assert.equal(format('2015-2-1' , 'F'), 'February');
assert.equal(format('2015-3-1' , 'F'), 'March');
assert.equal(format('2015-4-1' , 'F'), 'April');
assert.equal(format('2015-5-1' , 'F'), 'May');
assert.equal(format('2015-6-1' , 'F'), 'June');
assert.equal(format('2015-7-1' , 'F'), 'July');
assert.equal(format('2015-8-1' , 'F'), 'August');
assert.equal(format('2015-9-1' , 'F'), 'September');
assert.equal(format('2015-10-1', 'F'), 'October');
assert.equal(format('2015-11-1', 'F'), 'November');
assert.equal(format('2015-12-1', 'F'), 'December');

// M
assert.equal(format('2015-1-1' , 'M'), 'Jan');
assert.equal(format('2015-2-1' , 'M'), 'Feb');
assert.equal(format('2015-3-1' , 'M'), 'Mar');
assert.equal(format('2015-4-1' , 'M'), 'Apr');
assert.equal(format('2015-5-1' , 'M'), 'May');
assert.equal(format('2015-6-1' , 'M'), 'Jun');
assert.equal(format('2015-7-1' , 'M'), 'Jul');
assert.equal(format('2015-8-1' , 'M'), 'Aug');
assert.equal(format('2015-9-1' , 'M'), 'Sep');
assert.equal(format('2015-10-1', 'M'), 'Oct');
assert.equal(format('2015-11-1', 'M'), 'Nov');
assert.equal(format('2015-12-1', 'M'), 'Dec');


// tuki
assert.equal(format('2015-1-1' , 'tuki'), '一');
assert.equal(format('2015-2-1' , 'tuki'), '二');
assert.equal(format('2015-3-1' , 'tuki'), '三');
assert.equal(format('2015-4-1' , 'tuki'), '四');
assert.equal(format('2015-5-1' , 'tuki'), '五');
assert.equal(format('2015-6-1' , 'tuki'), '六');
assert.equal(format('2015-7-1' , 'tuki'), '七');
assert.equal(format('2015-8-1' , 'tuki'), '八');
assert.equal(format('2015-9-1' , 'tuki'), '九');
assert.equal(format('2015-10-1', 'tuki'), '十');
assert.equal(format('2015-11-1', 'tuki'), '十一');
assert.equal(format('2015-12-1', 'tuki'), '十二');

// tuki2
assert.equal(format('2015-1-1' , 'tuki2'), '一');
assert.equal(format('2015-2-1' , 'tuki2'), '二');
assert.equal(format('2015-3-1' , 'tuki2'), '三');
assert.equal(format('2015-4-1' , 'tuki2'), '四');
assert.equal(format('2015-5-1' , 'tuki2'), '五');
assert.equal(format('2015-6-1' , 'tuki2'), '六');
assert.equal(format('2015-7-1' , 'tuki2'), '七');
assert.equal(format('2015-8-1' , 'tuki2'), '八');
assert.equal(format('2015-9-1' , 'tuki2'), '九');
assert.equal(format('2015-10-1', 'tuki2'), '一〇');
assert.equal(format('2015-11-1', 'tuki2'), '一一');
assert.equal(format('2015-12-1', 'tuki2'), '一二');

// t
assert.equal(format('2015-1-1' , 't'), '31');
assert.equal(format('2015-2-1' , 't'), '28');
assert.equal(format('2016-2-1' , 't'), '29');
assert.equal(format('2015-3-1' , 't'), '31');
assert.equal(format('2015-4-1' , 't'), '30');
assert.equal(format('2015-5-1' , 't'), '31');
assert.equal(format('2015-6-1' , 't'), '30');
assert.equal(format('2015-7-1' , 't'), '31');
assert.equal(format('2015-8-1' , 't'), '31');
assert.equal(format('2015-9-1' , 't'), '30');
assert.equal(format('2015-10-1', 't'), '31');
assert.equal(format('2015-11-1', 't'), '30');
assert.equal(format('2015-12-1', 't'), '31');

// W
assert.equal(format('2015-1-1' , 'W'), '1');
assert.equal(format('2015-2-1' , 'W'), '5');
assert.equal(format('2015-3-1' , 'W'), '9');
assert.equal(format('2015-4-1' , 'W'), '14');
assert.equal(format('2015-5-1' , 'W'), '18');
assert.equal(format('2015-6-1' , 'W'), '23');
assert.equal(format('2015-7-1' , 'W'), '27');
assert.equal(format('2015-8-1' , 'W'), '31');
assert.equal(format('2015-9-1' , 'W'), '36');
assert.equal(format('2015-10-1', 'W'), '40');
assert.equal(format('2015-11-1', 'W'), '44');
assert.equal(format('2015-12-1', 'W'), '49');

// d
var i;
for(i = 1; i <= 9; i++) {
  assert.equal(format('2015-1-' + i , 'd'), '0' + i);
}
for(i = 10; i <= 31; i++) {
  assert.equal(format('2015-1-' + i , 'd'), ''  + i);
}

// j
var i;
for(i = 1; i <= 31; i++) {
  assert.equal(format('2015-1-' + i , 'j'), ''  + i);
}

// niti
assert.equal(format('2015-1-1' , 'niti'), '一');
assert.equal(format('2015-1-2' , 'niti'), '二');
assert.equal(format('2015-1-3' , 'niti'), '三');
assert.equal(format('2015-1-4' , 'niti'), '四');
assert.equal(format('2015-1-5' , 'niti'), '五');
assert.equal(format('2015-1-6' , 'niti'), '六');
assert.equal(format('2015-1-7' , 'niti'), '七');
assert.equal(format('2015-1-8' , 'niti'), '八');
assert.equal(format('2015-1-9' , 'niti'), '九');
assert.equal(format('2015-1-10', 'niti'), '十');
assert.equal(format('2015-1-11', 'niti'), '十一');
assert.equal(format('2015-1-12', 'niti'), '十二');
assert.equal(format('2015-1-13', 'niti'), '十三');
assert.equal(format('2015-1-14', 'niti'), '十四');
assert.equal(format('2015-1-15', 'niti'), '十五');
assert.equal(format('2015-1-16', 'niti'), '十六');
assert.equal(format('2015-1-17', 'niti'), '十七');
assert.equal(format('2015-1-18', 'niti'), '十八');
assert.equal(format('2015-1-19', 'niti'), '十九');
assert.equal(format('2015-1-20', 'niti'), '二十');
assert.equal(format('2015-1-21', 'niti'), '二十一');
assert.equal(format('2015-1-22', 'niti'), '二十二');
assert.equal(format('2015-1-23', 'niti'), '二十三');
assert.equal(format('2015-1-24', 'niti'), '二十四');
assert.equal(format('2015-1-25', 'niti'), '二十五');
assert.equal(format('2015-1-26', 'niti'), '二十六');
assert.equal(format('2015-1-27', 'niti'), '二十七');
assert.equal(format('2015-1-28', 'niti'), '二十八');
assert.equal(format('2015-1-29', 'niti'), '二十九');
assert.equal(format('2015-1-30', 'niti'), '三十');
assert.equal(format('2015-1-31', 'niti'), '三十一');

// niti2
assert.equal(format('2015-1-1' , 'niti2'), '一');
assert.equal(format('2015-1-2' , 'niti2'), '二');
assert.equal(format('2015-1-3' , 'niti2'), '三');
assert.equal(format('2015-1-4' , 'niti2'), '四');
assert.equal(format('2015-1-5' , 'niti2'), '五');
assert.equal(format('2015-1-6' , 'niti2'), '六');
assert.equal(format('2015-1-7' , 'niti2'), '七');
assert.equal(format('2015-1-8' , 'niti2'), '八');
assert.equal(format('2015-1-9' , 'niti2'), '九');
assert.equal(format('2015-1-10', 'niti2'), '一〇');
assert.equal(format('2015-1-11', 'niti2'), '一一');
assert.equal(format('2015-1-12', 'niti2'), '一二');
assert.equal(format('2015-1-13', 'niti2'), '一三');
assert.equal(format('2015-1-14', 'niti2'), '一四');
assert.equal(format('2015-1-15', 'niti2'), '一五');
assert.equal(format('2015-1-16', 'niti2'), '一六');
assert.equal(format('2015-1-17', 'niti2'), '一七');
assert.equal(format('2015-1-18', 'niti2'), '一八');
assert.equal(format('2015-1-19', 'niti2'), '一九');
assert.equal(format('2015-1-20', 'niti2'), '二〇');
assert.equal(format('2015-1-21', 'niti2'), '二一');
assert.equal(format('2015-1-22', 'niti2'), '二二');
assert.equal(format('2015-1-23', 'niti2'), '二三');
assert.equal(format('2015-1-24', 'niti2'), '二四');
assert.equal(format('2015-1-25', 'niti2'), '二五');
assert.equal(format('2015-1-26', 'niti2'), '二六');
assert.equal(format('2015-1-27', 'niti2'), '二七');
assert.equal(format('2015-1-28', 'niti2'), '二八');
assert.equal(format('2015-1-29', 'niti2'), '二九');
assert.equal(format('2015-1-30', 'niti2'), '三〇');
assert.equal(format('2015-1-31', 'niti2'), '三一');

// S
assert.equal(format('2015-1-1' , 'S'), 'st');
assert.equal(format('2015-1-2' , 'S'), 'nd');
assert.equal(format('2015-1-3' , 'S'), 'rd');
assert.equal(format('2015-1-4' , 'S'), 'th');
assert.equal(format('2015-1-5' , 'S'), 'th');
assert.equal(format('2015-1-6' , 'S'), 'th');
assert.equal(format('2015-1-7' , 'S'), 'th');
assert.equal(format('2015-1-8' , 'S'), 'th');
assert.equal(format('2015-1-9' , 'S'), 'th');
assert.equal(format('2015-1-10', 'S'), 'th');
assert.equal(format('2015-1-11', 'S'), 'th');
assert.equal(format('2015-1-12', 'S'), 'th');
assert.equal(format('2015-1-13', 'S'), 'th');
assert.equal(format('2015-1-14', 'S'), 'th');
assert.equal(format('2015-1-15', 'S'), 'th');
assert.equal(format('2015-1-16', 'S'), 'th');
assert.equal(format('2015-1-17', 'S'), 'th');
assert.equal(format('2015-1-18', 'S'), 'th');
assert.equal(format('2015-1-19', 'S'), 'th');
assert.equal(format('2015-1-20', 'S'), 'th');
assert.equal(format('2015-1-21', 'S'), 'st');
assert.equal(format('2015-1-22', 'S'), 'nd');
assert.equal(format('2015-1-23', 'S'), 'rd');
assert.equal(format('2015-1-24', 'S'), 'th');
assert.equal(format('2015-1-25', 'S'), 'th');
assert.equal(format('2015-1-26', 'S'), 'th');
assert.equal(format('2015-1-27', 'S'), 'th');
assert.equal(format('2015-1-28', 'S'), 'th');
assert.equal(format('2015-1-29', 'S'), 'th');
assert.equal(format('2015-1-30', 'S'), 'th');
assert.equal(format('2015-1-31', 'S'), 'st');

// z
assert.equal(format('2015-1-1' , 'z'), '0');
assert.equal(format('2015-1-2' , 'z'), '1');
assert.equal(format('2015-1-3' , 'z'), '2');
assert.equal(format('2015-1-4' , 'z'), '3');
assert.equal(format('2015-1-5' , 'z'), '4');
assert.equal(format('2015-1-6' , 'z'), '5');
assert.equal(format('2015-1-7' , 'z'), '6');
assert.equal(format('2015-1-8' , 'z'), '7');
assert.equal(format('2015-1-9' , 'z'), '8');
assert.equal(format('2015-1-10', 'z'), '9');
assert.equal(format('2015-1-11', 'z'), '10');
assert.equal(format('2015-1-12', 'z'), '11');
assert.equal(format('2015-1-13', 'z'), '12');
assert.equal(format('2015-1-14', 'z'), '13');
assert.equal(format('2015-1-15', 'z'), '14');
assert.equal(format('2015-1-16', 'z'), '15');
assert.equal(format('2015-1-17', 'z'), '16');
assert.equal(format('2015-1-18', 'z'), '17');
assert.equal(format('2015-1-19', 'z'), '18');
assert.equal(format('2015-1-20', 'z'), '19');
assert.equal(format('2015-1-21', 'z'), '20');
assert.equal(format('2015-1-22', 'z'), '21');
assert.equal(format('2015-1-23', 'z'), '22');
assert.equal(format('2015-1-24', 'z'), '23');
assert.equal(format('2015-1-25', 'z'), '24');
assert.equal(format('2015-1-26', 'z'), '25');
assert.equal(format('2015-1-27', 'z'), '26');
assert.equal(format('2015-1-28', 'z'), '27');
assert.equal(format('2015-1-29', 'z'), '28');
assert.equal(format('2015-1-30', 'z'), '29');
assert.equal(format('2015-1-31', 'z'), '30');
assert.equal(format('2015-2-1' , 'z'), '31');
assert.equal(format('2015-2-2' , 'z'), '32');
assert.equal(format('2015-2-3' , 'z'), '33');
assert.equal(format('2015-2-4' , 'z'), '34');
assert.equal(format('2015-2-5' , 'z'), '35');
assert.equal(format('2015-2-6' , 'z'), '36');
assert.equal(format('2015-2-7' , 'z'), '37');
assert.equal(format('2015-2-8' , 'z'), '38');
assert.equal(format('2015-2-9' , 'z'), '39');
assert.equal(format('2015-2-10', 'z'), '40');
assert.equal(format('2015-2-11', 'z'), '41');
assert.equal(format('2015-2-12', 'z'), '42');
assert.equal(format('2015-2-13', 'z'), '43');
assert.equal(format('2015-2-14', 'z'), '44');
assert.equal(format('2015-2-15', 'z'), '45');
assert.equal(format('2015-2-16', 'z'), '46');
assert.equal(format('2015-2-17', 'z'), '47');
assert.equal(format('2015-2-18', 'z'), '48');
assert.equal(format('2015-2-19', 'z'), '49');
assert.equal(format('2015-2-20', 'z'), '50');
assert.equal(format('2015-2-21', 'z'), '51');
assert.equal(format('2015-2-22', 'z'), '52');
assert.equal(format('2015-2-23', 'z'), '53');
assert.equal(format('2015-2-24', 'z'), '54');
assert.equal(format('2015-2-25', 'z'), '55');
assert.equal(format('2015-2-26', 'z'), '56');
assert.equal(format('2015-2-27', 'z'), '57');
assert.equal(format('2015-2-28', 'z'), '58');
assert.equal(format('2015-3-1' , 'z'), '59');
assert.equal(format('2016-2-29', 'z'), '59'); // 閏年
assert.equal(format('2016-3-1' , 'z'), '60'); // 閏年
assert.equal(format('2015-12-31', 'z'), '364');
assert.equal(format('2016-12-31', 'z'), '365'); // 閏年

// w
assert.equal(format('2015-1-1' , 'w'), '4');
assert.equal(format('2015-1-2' , 'w'), '5');
assert.equal(format('2015-1-3' , 'w'), '6');
assert.equal(format('2015-1-4' , 'w'), '0');
assert.equal(format('2015-1-5' , 'w'), '1');
assert.equal(format('2015-1-6' , 'w'), '2');
assert.equal(format('2015-1-7' , 'w'), '3');

// N
assert.equal(format('2015-1-1' , 'N'), '4');
assert.equal(format('2015-1-2' , 'N'), '5');
assert.equal(format('2015-1-3' , 'N'), '6');
assert.equal(format('2015-1-4' , 'N'), '7');
assert.equal(format('2015-1-5' , 'N'), '1');
assert.equal(format('2015-1-6' , 'N'), '2');
assert.equal(format('2015-1-7' , 'N'), '3');

// l
assert.equal(format('2015-1-1' , 'l'), 'Thursday');
assert.equal(format('2015-1-2' , 'l'), 'Friday');
assert.equal(format('2015-1-3' , 'l'), 'Saturday');
assert.equal(format('2015-1-4' , 'l'), 'Sunday');
assert.equal(format('2015-1-5' , 'l'), 'Monday');
assert.equal(format('2015-1-6' , 'l'), 'Tuesday');
assert.equal(format('2015-1-7' , 'l'), 'Wednesday');

// D
assert.equal(format('2015-1-1' , 'D'), 'Thu');
assert.equal(format('2015-1-2' , 'D'), 'Fri');
assert.equal(format('2015-1-3' , 'D'), 'Sat');
assert.equal(format('2015-1-4' , 'D'), 'Sun');
assert.equal(format('2015-1-5' , 'D'), 'Mon');
assert.equal(format('2015-1-6' , 'D'), 'Tue');
assert.equal(format('2015-1-7' , 'D'), 'Wed');

// yobi
assert.equal(format('2015-1-1' , 'yobi'), '木');
assert.equal(format('2015-1-2' , 'yobi'), '金');
assert.equal(format('2015-1-3' , 'yobi'), '土');
assert.equal(format('2015-1-4' , 'yobi'), '日');
assert.equal(format('2015-1-5' , 'yobi'), '月');
assert.equal(format('2015-1-6' , 'yobi'), '火');
assert.equal(format('2015-1-7' , 'yobi'), '水');

// g
assert.equal(format('2015-1-1 0:00' , 'g'),  '0');
assert.equal(format('2015-1-1 1:00' , 'g'),  '1');
assert.equal(format('2015-1-1 10:00', 'g'), '10');
assert.equal(format('2015-1-1 12:00', 'g'),  '0');
assert.equal(format('2015-1-1 13:00', 'g'),  '1');
assert.equal(format('2015-1-1 23:00', 'g'), '11');

// G
assert.equal(format('2015-1-1 0:00' , 'G'),  '0');
assert.equal(format('2015-1-1 1:00' , 'G'),  '1');
assert.equal(format('2015-1-1 10:00', 'G'), '10');
assert.equal(format('2015-1-1 12:00', 'G'), '12');
assert.equal(format('2015-1-1 13:00', 'G'), '13');
assert.equal(format('2015-1-1 23:00', 'G'), '23');

// h
assert.equal(format('2015-1-1 0:00' , 'h'), '00');
assert.equal(format('2015-1-1 1:00' , 'h'), '01');
assert.equal(format('2015-1-1 10:00', 'h'), '10');
assert.equal(format('2015-1-1 12:00', 'h'), '00');
assert.equal(format('2015-1-1 13:00', 'h'), '01');
assert.equal(format('2015-1-1 23:00', 'h'), '11');

// H
assert.equal(format('2015-1-1 0:00' , 'H'), '00');
assert.equal(format('2015-1-1 1:00' , 'H'), '01');
assert.equal(format('2015-1-1 10:00', 'H'), '10');
assert.equal(format('2015-1-1 12:00', 'H'), '12');
assert.equal(format('2015-1-1 13:00', 'H'), '13');
assert.equal(format('2015-1-1 23:00', 'H'), '23');

// i
assert.equal(format('2015-1-1 00:00', 'i'), '00');
assert.equal(format('2015-1-1 00:01', 'i'), '01');
assert.equal(format('2015-1-1 00:10', 'i'), '10');

// s
assert.equal(format('2015-1-1 00:00:00', 's'), '00');
assert.equal(format('2015-1-1 00:00:01', 's'), '01');
assert.equal(format('2015-1-1 00:00:10', 's'), '10');

// u
assert.equal(format('2015-1-1 00:00:00.000', 'u'), '000000');
assert.equal(format('2015-1-1 00:00:00.001', 'u'), '001000');
assert.equal(format('2015-1-1 00:00:00.010', 'u'), '010000');
assert.equal(format('2015-1-1 00:00:00.100', 'u'), '100000');

// a
assert.equal(format('2015-1-1 0:00' , 'a'), 'am');
assert.equal(format('2015-1-1 1:00' , 'a'), 'am');
assert.equal(format('2015-1-1 10:00', 'a'), 'am');
assert.equal(format('2015-1-1 12:00', 'a'), 'pm');
assert.equal(format('2015-1-1 13:00', 'a'), 'pm');
assert.equal(format('2015-1-1 23:00', 'a'), 'pm');

// A
assert.equal(format('2015-1-1 0:00' , 'A'), 'AM');
assert.equal(format('2015-1-1 1:00' , 'A'), 'AM');
assert.equal(format('2015-1-1 10:00', 'A'), 'AM');
assert.equal(format('2015-1-1 12:00', 'A'), 'PM');
assert.equal(format('2015-1-1 13:00', 'A'), 'PM');
assert.equal(format('2015-1-1 23:00', 'A'), 'PM');

// aj
assert.equal(format('2015-1-1 0:00' , 'aj'), '午前');
assert.equal(format('2015-1-1 1:00' , 'aj'), '午前');
assert.equal(format('2015-1-1 10:00', 'aj'), '午前');
assert.equal(format('2015-1-1 12:00', 'aj'), '午後');
assert.equal(format('2015-1-1 13:00', 'aj'), '午後');
assert.equal(format('2015-1-1 23:00', 'aj'), '午後');

// エスケープ
assert.equal(format('2015-4-10', '{Y}/{m}/{d} updated'), '2015/04/10 updated');
assert.equal(format('2015-4-10', 'nennen2{nen3}nen4'), 'nennen2二十七nen4');

// 混合
assert.equal(format('2015-4-10', 'Ymd'), '20150410');
assert.equal(format('2015-4-10', 'nennen2nen3nen4'), '2727二十七二七');




