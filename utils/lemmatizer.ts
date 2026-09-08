/**
 * Tiện ích Lemmatizer (Hình thái học & Từ nguyên tiếng Anh)
 * Hỗ trợ nhận diện từ gốc (Lemma/Base form) từ các biến thể thì (verb tenses),
 * số nhiều (plurals), so sánh (comparatives) và dạng bất quy tắc (irregular forms).
 */

/**
 * Bảng tra cứu các biến thể bất quy tắc phổ biến nhất trong tiếng Anh
 * Gồm: Động từ bất quy tắc (V2/V3 -> V1), Danh từ số nhiều bất quy tắc, So sánh hơn/nhất
 */
export const IRREGULAR_WORDS_MAP: Record<string, string> = {
  // --- Động từ bất quy tắc thông dụng (Past & Past Participle -> Base form) ---
  bought: 'buy',
  went: 'go',
  gone: 'go',
  goes: 'go',
  came: 'come',
  did: 'do',
  done: 'do',
  does: 'do',
  saw: 'see',
  seen: 'see',
  had: 'have',
  has: 'have',
  said: 'say',
  says: 'say',
  made: 'make',
  makes: 'make',
  took: 'take',
  taken: 'take',
  got: 'get',
  gotten: 'get',
  knew: 'know',
  known: 'know',
  thought: 'think',
  felt: 'feel',
  became: 'become',
  left: 'leave',
  brought: 'bring',
  began: 'begin',
  begun: 'begin',
  kept: 'keep',
  held: 'hold',
  wrote: 'write',
  written: 'write',
  stood: 'stand',
  heard: 'hear',
  meant: 'mean',
  met: 'meet',
  ran: 'run',
  paid: 'pay',
  sat: 'sit',
  spoke: 'speak',
  spoken: 'speak',
  lay: 'lie',
  lain: 'lie',
  led: 'lead',
  grew: 'grow',
  grown: 'grow',
  lost: 'lose',
  fell: 'fall',
  fallen: 'fall',
  sent: 'send',
  built: 'build',
  understood: 'understand',
  drew: 'draw',
  drawn: 'draw',
  broke: 'break',
  broken: 'break',
  spent: 'spend',
  rose: 'rise',
  risen: 'rise',
  drove: 'drive',
  driven: 'drive',
  wore: 'wear',
  worn: 'wear',
  chose: 'choose',
  chosen: 'choose',
  ate: 'eat',
  eaten: 'eat',
  caught: 'catch',
  slept: 'sleep',
  drank: 'drink',
  drunk: 'drink',
  sang: 'sing',
  sung: 'sing',
  swam: 'swim',
  swum: 'swim',
  flew: 'fly',
  flown: 'fly',
  taught: 'teach',
  sold: 'sell',
  found: 'find',
  told: 'tell',
  gave: 'give',
  given: 'give',
  won: 'win',
  hurt: 'hurt',
  cost: 'cost',
  lent: 'lend',
  swore: 'swear',
  sworn: 'swear',
  stole: 'steal',
  stolen: 'steal',
  froze: 'freeze',
  frozen: 'freeze',
  shook: 'shake',
  shaken: 'shake',
  rode: 'ride',
  ridden: 'ride',
  beat: 'beat',
  beaten: 'beat',
  bit: 'bite',
  bitten: 'bite',
  hid: 'hide',
  hidden: 'hide',
  blew: 'blow',
  blown: 'blow',
  tore: 'tear',
  torn: 'tear',
  woke: 'wake',
  woken: 'wake',
  hung: 'hang',
  threw: 'throw',
  thrown: 'throw',
  swept: 'sweep',
  wept: 'weep',
  dug: 'dig',
  struck: 'strike',
  slid: 'slide',
  shone: 'shine',
  bent: 'bend',
  burned: 'burn',
  burnt: 'burn',
  dreamt: 'dream',
  learnt: 'learn',
  smelt: 'smell',
  spilt: 'spill',
  spoilt: 'spoil',
  borne: 'bear',
  bore: 'bear',

  // --- Động từ to be ---
  was: 'be',
  were: 'be',
  been: 'be',
  am: 'be',
  is: 'be',
  are: 'be',

  // --- Danh từ số nhiều bất quy tắc (Plural -> Singular) ---
  children: 'child',
  men: 'man',
  women: 'woman',
  feet: 'foot',
  teeth: 'tooth',
  geese: 'goose',
  mice: 'mouse',
  people: 'person',
  oxen: 'ox',
  criteria: 'criterion',
  phenomena: 'phenomenon',
  data: 'datum',
  analyses: 'analysis',
  bases: 'basis',
  crises: 'crisis',
  theses: 'thesis',

  // --- Tính từ / Trạng từ so sánh hơn & nhất bất quy tắc ---
  better: 'good',
  best: 'good',
  worse: 'bad',
  worst: 'bad',
  more: 'much',
  most: 'much',
  less: 'little',
  least: 'little',
  further: 'far',
  furthest: 'far',
};

/**
 * Trả về danh sách các ứng viên từ gốc (base word candidates) của một từ
 * Kết hợp tra cứu từ điển bất quy tắc và phân tích hình thái hậu tố (morphological suffixes)
 * 
 * @example
 * getBaseWordCandidates("bought") => ["buy"]
 * getBaseWordCandidates("goes") => ["go"]
 * getBaseWordCandidates("studies") => ["study"]
 * getBaseWordCandidates("running") => ["run"]
 * getBaseWordCandidates("liked") => ["like"]
 */
export function getBaseWordCandidates(word: string): string[] {
  if (!word) return [];
  const lower = word.toLowerCase().trim().replace(/['’]s$/, ''); // Bỏ sở hữu cách 's nếu có

  if (lower.length < 3) return [];

  const candidates = new Set<string>();

  // 1. Tra từ điển bất quy tắc trước
  const irregularBase = IRREGULAR_WORDS_MAP[lower];
  if (irregularBase && irregularBase !== lower) {
    candidates.add(irregularBase);
  }

  // 2. Tách hậu tố biến thể (Morphological Inflections)

  // 2.1 Đuôi -ying -> -ie (vd: lying -> lie, dying -> die, tying -> tie)
  if (lower.endsWith('ying') && lower.length >= 5) {
    candidates.add(lower.slice(0, -4) + 'ie');
  }

  // 2.2 Đuôi -ies hoặc -ied -> -y (vd: studies -> study, studied -> study, cries -> cry)
  if ((lower.endsWith('ies') || lower.endsWith('ied')) && lower.length >= 4) {
    candidates.add(lower.slice(0, -3) + 'y');
  }

  // 2.3 Đuôi -es
  if (lower.endsWith('es') && lower.length >= 4) {
    // Sibilants: -ches, -shes, -sses, -xes, -zzes -> bỏ -es (vd: watches -> watch, boxes -> box)
    if (
      lower.endsWith('ches') ||
      lower.endsWith('shes') ||
      lower.endsWith('sses') ||
      lower.endsWith('xes') ||
      lower.endsWith('zzes')
    ) {
      candidates.add(lower.slice(0, -2));
    }
    // Gốc -o: goes -> go, does -> do, echoes -> echo
    if (lower.endsWith('oes')) {
      candidates.add(lower.slice(0, -2));
    }
    // Gốc -e thêm -s (vd: likes -> like, houses -> house)
    candidates.add(lower.slice(0, -1)); // Bỏ -s
    candidates.add(lower.slice(0, -2)); // Bỏ -es
  }

  // 2.4 Đuôi -s (không phải -ss)
  if (lower.endsWith('s') && !lower.endsWith('ss') && lower.length >= 3) {
    candidates.add(lower.slice(0, -1));
  }

  // 2.5 Đuôi -ed
  if (lower.endsWith('ed') && lower.length >= 4) {
    // Gốc -e thêm -d (vd: liked -> like, loved -> love, used -> use)
    candidates.add(lower.slice(0, -1));
    // Gốc thông thường thêm -ed (vd: played -> play, walked -> walk)
    candidates.add(lower.slice(0, -2));

    // Gấp đôi phụ âm + ed (vd: stopped -> stop, planned -> plan, robbed -> rob)
    const withoutEd = lower.slice(0, -2);
    if (withoutEd.length >= 3) {
      const last1 = withoutEd[withoutEd.length - 1];
      const last2 = withoutEd[withoutEd.length - 2];
      if (last1 === last2 && /[b-df-hj-np-tv-z]/.test(last1)) {
        candidates.add(withoutEd.slice(0, -1));
      }
    }
  }

  // 2.6 Đuôi -ing
  if (lower.endsWith('ing') && lower.length >= 5) {
    const withoutIng = lower.slice(0, -3);
    // Gốc thêm -ing thông thường (vd: playing -> play, reading -> read)
    candidates.add(withoutIng);
    // Gốc tận cùng -e bỏ e thêm ing (vd: making -> make, writing -> write, having -> have)
    candidates.add(withoutIng + 'e');

    // Gấp đôi phụ âm + ing (vd: running -> run, swimming -> swim, getting -> get)
    if (withoutIng.length >= 3) {
      const last1 = withoutIng[withoutIng.length - 1];
      const last2 = withoutIng[withoutIng.length - 2];
      if (last1 === last2 && /[b-df-hj-np-tv-z]/.test(last1)) {
        candidates.add(withoutIng.slice(0, -1));
      }
    }
  }

  // 2.7 So sánh hơn/nhất: -er, -est
  if (lower.endsWith('er') && lower.length >= 4) {
    candidates.add(lower.slice(0, -2)); // fast -> faster
    candidates.add(lower.slice(0, -1)); // large -> larger
    if (lower.endsWith('ier') && lower.length >= 4) {
      candidates.add(lower.slice(0, -3) + 'y'); // easy -> easier
    }
  }
  if (lower.endsWith('est') && lower.length >= 5) {
    candidates.add(lower.slice(0, -3)); // fast -> fastest
    candidates.add(lower.slice(0, -2)); // large -> largest
    if (lower.endsWith('iest') && lower.length >= 5) {
      candidates.add(lower.slice(0, -4) + 'y'); // easy -> easiest
    }
  }

  // Lọc chỉ giữ các từ hợp lệ, khác từ gốc ban đầu và có độ dài >= 2
  return Array.from(candidates).filter((c) => c.length >= 2 && c !== lower);
}
