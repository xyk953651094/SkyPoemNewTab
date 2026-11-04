// 本地历法信息：节气由寿星公式推算，连同农历、干支、七十二候一起给出，全程不依赖网络。

export type SeasonKey = "spring" | "summer" | "autumn" | "winter";

export type XunKey = "early" | "mid" | "late";

interface SolarTerm {
    name: string;
    month: number;
    c: number;
}

interface SolarTermInfo {
    name: string;
    season: SeasonKey;
    houLabel: string;
    houName: string;
}

export interface DayContext {
    month: number;
    weekday: number;
    xun: XunKey;
    dayOfYear: number;
    daysLeftInYear: number;
    ganzhiYear: string;
    zodiac: string;
    lunarMonth: string;
    lunarDay: string;
    term: SolarTermInfo;
}

// 农历日子的汉字写法
const LUNAR_DAY_NAMES = [
    "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
    "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
    "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十",
];

const ZODIAC_BY_BRANCH: Record<string, string> = {
    "子": "鼠", "丑": "牛", "寅": "虎", "卯": "兔", "辰": "龙", "巳": "蛇",
    "午": "马", "未": "羊", "申": "猴", "酉": "鸡", "戌": "狗", "亥": "猪",
};

const HOU_INDEX_NAMES = ["一候", "二候", "三候"];

// 寿星公式：日 = floor(Y × 0.2422 + C) - floor(Y / 4)，Y 为年份后两位，C 是各节气的 21 世纪常数。
const SOLAR_TERMS: SolarTerm[] = [
    {name: "小寒", month: 1, c: 5.4055}, {name: "大寒", month: 1, c: 20.12},
    {name: "立春", month: 2, c: 3.87}, {name: "雨水", month: 2, c: 18.73},
    {name: "惊蛰", month: 3, c: 5.63}, {name: "春分", month: 3, c: 20.646},
    {name: "清明", month: 4, c: 4.81}, {name: "谷雨", month: 4, c: 20.1},
    {name: "立夏", month: 5, c: 5.52}, {name: "小满", month: 5, c: 21.04},
    {name: "芒种", month: 6, c: 5.678}, {name: "夏至", month: 6, c: 21.37},
    {name: "小暑", month: 7, c: 7.108}, {name: "大暑", month: 7, c: 22.83},
    {name: "立秋", month: 8, c: 7.5}, {name: "处暑", month: 8, c: 23.13},
    {name: "白露", month: 9, c: 7.646}, {name: "秋分", month: 9, c: 23.042},
    {name: "寒露", month: 10, c: 8.318}, {name: "霜降", month: 10, c: 23.438},
    {name: "立冬", month: 11, c: 7.438}, {name: "小雪", month: 11, c: 22.36},
    {name: "大雪", month: 12, c: 7.18}, {name: "冬至", month: 12, c: 21.94},
];

// 七十二候（《月令七十二候集解》通行本），按节气名索引
const PENTAD_TERMS: Record<string, [string, string, string]> = {
    "立春": ["东风解冻", "蛰虫始振", "鱼陟负冰"], "雨水": ["獭祭鱼", "候雁北", "草木萌动"],
    "惊蛰": ["桃始华", "仓庚鸣", "鹰化为鸠"], "春分": ["玄鸟至", "雷乃发声", "始电"],
    "清明": ["桐始华", "田鼠化为鴽", "虹始见"], "谷雨": ["萍始生", "鸣鸠拂羽", "戴胜降桑"],
    "立夏": ["蝼蝈鸣", "蚯蚓出", "王瓜生"], "小满": ["苦菜秀", "靡草死", "麦秋至"],
    "芒种": ["螳螂生", "鵙始鸣", "反舌无声"], "夏至": ["鹿角解", "蜩始鸣", "半夏生"],
    "小暑": ["温风至", "蟋蟀居宇", "鹰始鸷"], "大暑": ["腐草为萤", "土润溽暑", "大雨时行"],
    "立秋": ["凉风至", "白露生", "寒蝉鸣"], "处暑": ["鹰乃祭鸟", "天地始肃", "禾乃登"],
    "白露": ["鸿雁来", "玄鸟归", "群鸟养羞"], "秋分": ["雷始收声", "蛰虫坯户", "水始涸"],
    "寒露": ["鸿雁来宾", "雀入大水为蛤", "菊有黄华"], "霜降": ["豺乃祭兽", "草木黄落", "蛰虫咸俯"],
    "立冬": ["水始冰", "地始冻", "雉入大水为蜃"], "小雪": ["虹藏不见", "天气上升", "闭塞成冬"],
    "大雪": ["鹖鴠不鸣", "虎始交", "荔挺出"], "冬至": ["蚯蚓结", "麋角解", "水泉动"],
    "小寒": ["雁北乡", "鹊始巢", "雉始雊"], "大寒": ["鸡始乳", "征鸟厉疾", "水泽腹坚"],
};

const SEASON_BY_TERM: Record<string, SeasonKey> = {
    "立春": "spring", "雨水": "spring", "惊蛰": "spring", "春分": "spring", "清明": "spring", "谷雨": "spring",
    "立夏": "summer", "小满": "summer", "芒种": "summer", "夏至": "summer", "小暑": "summer", "大暑": "summer",
    "立秋": "autumn", "处暑": "autumn", "白露": "autumn", "秋分": "autumn", "寒露": "autumn", "霜降": "autumn",
    "立冬": "winter", "小雪": "winter", "大雪": "winter", "冬至": "winter", "小寒": "winter", "大寒": "winter",
};

// 公式算出的日期贴着午夜时，取整方向会与紫金山天文台的交节时刻相反，逐年记下这些 ±1 天修正。
// 2023—2028 实测 131 个节气里只剩这一处偏差。
const TERM_CORRECTIONS: { year: number; name: string; days: number }[] = [
    {year: 2026, name: "雨水", days: -1},
];

// 年初四个节气落在 2 月 29 日之前，floor(Y / 4) 会扣掉尚未到来的那个闰日，需要补回 1 天。
function countLeapDays(param: number, month: number): number {
    return Math.floor(param / 4) - (param % 4 === 0 && month <= 2 ? 1 : 0);
}

function getTermDay(param: SolarTerm, year: number): number {
    const shortYear = year % 100;
    const correction = TERM_CORRECTIONS.find(item => item.year === year && item.name === param.name);
    return Math.floor(shortYear * 0.2422 + param.c) - countLeapDays(shortYear, param.month) + (correction?.days ?? 0);
}

const lunarMonthDayFormat = new Intl.DateTimeFormat("zh-Hans-u-ca-chinese", {month: "long", day: "numeric"});
const lunarYearFormat = new Intl.DateTimeFormat("zh-Hans-u-ca-chinese", {year: "numeric"});

// Intl 给出「九月25日」「闰六月1日」这类串：月名已是汉字，只有日号是阿拉伯数字
function parseLunarDate(param: Date): { lunarMonth: string; lunarDay: string } {
    const text = lunarMonthDayFormat.format(param).replace(/日$/, "");
    const matched = text.match(/^(.+?)(\d+)$/);
    if (!matched) {
        return {lunarMonth: text, lunarDay: ""};
    }
    const dayNumber = Number(matched[2]);
    return {lunarMonth: matched[1], lunarDay: LUNAR_DAY_NAMES[dayNumber - 1] ?? matched[2]};
}

// Intl 给出「2026丙午年」，取数字之后的两个字
function parseGanzhiYear(param: Date): { ganzhiYear: string; zodiac: string } {
    const matched = lunarYearFormat.format(param).match(/([^\d\s]+)年$/);
    const ganzhiYear = matched?.[1] ?? "";
    return {ganzhiYear, zodiac: ZODIAC_BY_BRANCH[ganzhiYear.charAt(1)] ?? ""};
}

function findCurrentTerm(param: Date): SolarTermInfo {
    const year = param.getFullYear();
    const today = new Date(year, param.getMonth(), param.getDate());
    const candidates: { start: Date; name: string }[] = [];

    // 前后各取一年，覆盖元旦与大寒/小寒交界
    for (const offset of [-1, 0, 1]) {
        SOLAR_TERMS.forEach(term => {
            const termYear = year + offset;
            candidates.push({start: new Date(termYear, term.month - 1, getTermDay(term, termYear)), name: term.name});
        });
    }

    const current = candidates
        .filter(item => item.start <= today)
        .sort((a, b) => b.start.getTime() - a.start.getTime())[0];

    // 五天一候，一节气三候；末日可能未满五天，故第三候要兜住
    const daysIntoTerm = Math.floor((today.getTime() - current.start.getTime()) / 86400000);
    const houIndex = Math.min(Math.floor(daysIntoTerm / 5) + 1, 3);

    return {
        name: current.name,
        season: SEASON_BY_TERM[current.name],
        houLabel: HOU_INDEX_NAMES[houIndex - 1] ?? "",
        houName: PENTAD_TERMS[current.name]?.[houIndex - 1] ?? "",
    };
}

function isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// 旬：上旬 1-10、中旬 11-20、下旬 21 至月末
function getXun(dayOfMonth: number): XunKey {
    if (dayOfMonth <= 10) return "early";
    if (dayOfMonth <= 20) return "mid";
    return "late";
}

export function getDayContext(param: Date): DayContext {
    const startOfYear = new Date(param.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((param.getTime() - startOfYear.getTime()) / 86400000) + 1;
    const totalDaysOfYear = isLeapYear(param.getFullYear()) ? 366 : 365;
    const {lunarMonth, lunarDay} = parseLunarDate(param);
    const {ganzhiYear, zodiac} = parseGanzhiYear(param);

    return {
        month: param.getMonth() + 1,
        weekday: param.getDay(),
        xun: getXun(param.getDate()),
        dayOfYear,
        daysLeftInYear: totalDaysOfYear - dayOfYear,
        ganzhiYear,
        zodiac,
        lunarMonth,
        lunarDay,
        term: findCurrentTerm(param),
    };
}
