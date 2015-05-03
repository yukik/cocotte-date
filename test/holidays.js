
// 祝日
var get = require(global.minify ? '../minify' : '../date-format').getHolidays;
var test = require('assert').deepEqual;

test(get(1948), {
  '923': '秋分の日',
  '1103': '文化の日',
  '1123': '勤労感謝の日',
});

test(get(1973), {
  '101': '元日',
  '115': '成人の日',
  '211': '建国記念の日',
  '321': '春分の日',
  '429': '天皇誕生日',
  '430': '振替休日',
  '503': '憲法記念日',
  '505': 'こどもの日',
  '915': '敬老の日',
  '923': '秋分の日',
  '924': '振替休日',
  '1010': '体育の日',
  '1103': '文化の日',
  '1123': '勤労感謝の日'
});

test(get(1988), {
  '101': '元日',
  '115': '成人の日',
  '211': '建国記念の日',
  '320': '春分の日',
  '321': '振替休日',
  '429': '天皇誕生日',
  '503': '憲法記念日',
  '504': '国民の休日',
  '505': 'こどもの日',
  '915': '敬老の日',
  '923': '秋分の日',
  '1010': '体育の日',
  '1103': '文化の日',
  '1123': '勤労感謝の日'
});


test(get(1996), {
  '101': '元日',
  '115': '成人の日',
  '211': '建国記念の日',
  '212': '振替休日',
  '320': '春分の日',
  '429': 'みどりの日',
  '503': '憲法記念日',
  '504': '国民の休日',
  '505': 'こどもの日',
  '506': '振替休日',
  '720': '海の日',
  '915': '敬老の日',
  '916': '振替休日',
  '923': '秋分の日',
  '1010': '体育の日',
  '1103': '文化の日',
  '1104': '振替休日',
  '1123': '勤労感謝の日',
  '1223': '天皇誕生日'
});



test(get(2005), {
  '101': '元日',
  '110': '成人の日',
  '211': '建国記念の日',
  '320': '春分の日',
  '321': '振替休日',
  '429': 'みどりの日',
  '503': '憲法記念日',
  '504': '国民の休日',
  '505': 'こどもの日',
  '718': '海の日',
  '919': '敬老の日',
  '923': '秋分の日',
  '1010': '体育の日',
  '1103': '文化の日',
  '1123': '勤労感謝の日',
  '1223': '天皇誕生日'
});


test(get(2009), {
  '101': '元日',
  '112': '成人の日',
  '211': '建国記念の日',
  '320': '春分の日',
  '429': '昭和の日',
  '503': '憲法記念日',
  '504': 'みどりの日',
  '505': 'こどもの日',
  '506': '振替休日',
  '720': '海の日',
  '921': '敬老の日',
  '922': '国民の休日',
  '923': '秋分の日',
  '1012': '体育の日',
  '1103': '文化の日',
  '1123': '勤労感謝の日',
  '1223': '天皇誕生日'
});

test(get(2010), {
  '101': '元日',
  '111': '成人の日',
  '211': '建国記念の日',
  '321': '春分の日',
  '322': '振替休日',
  '429': '昭和の日',
  '503': '憲法記念日',
  '504': 'みどりの日',
  '505': 'こどもの日',
  '719': '海の日',
  '920': '敬老の日',
  '923': '秋分の日',
  '1011': '体育の日',
  '1103': '文化の日',
  '1123': '勤労感謝の日',
  '1223': '天皇誕生日'
});

test(get(2011), {
  '101': '元日',
  '110': '成人の日',
  '211': '建国記念の日',
  '321': '春分の日',
  '429': '昭和の日',
  '503': '憲法記念日',
  '504': 'みどりの日',
  '505': 'こどもの日',
  '718': '海の日',
  '919': '敬老の日',
  '923': '秋分の日',
  '1010': '体育の日',
  '1103': '文化の日',
  '1123': '勤労感謝の日',
  '1223': '天皇誕生日'
});



test(get(2019), {
  '101': '元日',
  '114': '成人の日',
  '211': '建国記念の日',
  '321': '春分の日',
  '429': '昭和の日',
  '503': '憲法記念日',
  '504': 'みどりの日',
  '505': 'こどもの日',
  '506': '振替休日',
  '715': '海の日',
  '811': '山の日',
  '812': '振替休日',
  '916': '敬老の日',
  '923': '秋分の日',
  '1014': '体育の日',
  '1103': '文化の日',
  '1104': '振替休日',
  '1123': '勤労感謝の日',
  '1223': '天皇誕生日'
});






