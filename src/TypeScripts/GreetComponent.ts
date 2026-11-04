import {DayContext, SeasonKey, XunKey} from "./ChineseCalendar";
import phraseData from "./greetPhrases.json";

const SHICHEN_GREETINGS = [
    "子正时", "丑初时", "丑正时", "寅初时", "寅正时", "卯初时",
    "卯正时", "辰初时", "辰正时", "巳初时", "巳正时", "午初时",
    "午正时", "未初时", "未正时", "申初时", "申正时", "酉初时",
    "酉正时", "戌初时", "戌正时", "亥初时", "亥正时", "子初时",
];

// 时间段配置（仅用于图标）
const TIME_PERIODS = [
    { start: 0,  end: 6,  icon: "bi bi-moon-stars" },
    { start: 6,  end: 11, icon: "bi bi-sunrise" },
    { start: 11, end: 13, icon: "bi bi-sun" },
    { start: 13, end: 17, icon: "bi bi-sunset" },
    { start: 17, end: 18, icon: "bi bi-sunset" },
    { start: 18, end: 24, icon: "bi bi-moon-stars" },
];

export interface GreetInfo {
    icon: string;
    greet: string;
}

// 获取当前时间段的问候信息
export function getGreetInfo(): GreetInfo {
    const hour = new Date().getHours();
    const period = TIME_PERIODS.find(p => hour >= p.start && hour < p.end);

    return {
        icon: period?.icon ?? "",
        greet: SHICHEN_GREETINGS[hour] ?? "您好",
    };
}

// 四字词语配置
type PhraseTone = "scene" | "wish";

// daily：口语化、生活场景；literary：出自古文诗词或带典故。Image 用前者，Poem 用后者
type PhraseStyle = "daily" | "literary";

interface GreetPhrase {
    text: string;
    tone: PhraseTone;
    style: PhraseStyle;
    season?: SeasonKey;
    terms?: string[];
    months?: number[];
    xun?: XunKey;
    dow?: number[];
    source?: string;
}

const PHRASES = phraseData as GreetPhrase[];

function matches(param: GreetPhrase, ctx: DayContext): boolean {
    if (param.season && param.season !== ctx.term.season) return false;
    if (param.terms && !param.terms.includes(ctx.term.name)) return false;
    if (param.months && !param.months.includes(ctx.month)) return false;
    if (param.xun && param.xun !== ctx.xun) return false;
    if (param.dow && !param.dow.includes(ctx.weekday)) return false;
    return true;
}

// 命中越多限定维度，越「应景」，在候选池里出现得越频繁
function weightOf(param: GreetPhrase): number {
    const weight = (param.terms ? 3 : 0)
        + (param.season ? 2 : 0)
        + (param.months ? 2 : 0)
        + (param.dow ? 3 : 0)
        + (param.xun ? 1 : 0);
    return weight || 1;
}

// 同一天的种子恒定：换日必变、刷新不变，避免「点一下就换词」的随机感
function dateSeed(param: Date): number {
    return param.getFullYear() * 372 + (param.getMonth() + 1) * 31 + param.getDate();
}

export function pickGreetPhrase(ctx: DayContext, style: PhraseStyle, param: Date = new Date()): GreetPhrase {
    // 每五天让「祝愿」类跳出一次，其余时间只出写景词，避免两类语感混在一起
    const wantedTone: PhraseTone = ctx.dayOfYear % 5 === 0 ? "wish" : "scene";
    const sameStyle = (item: GreetPhrase) => item.style === style && item.tone === wantedTone;
    const isPlain = (item: GreetPhrase) => !item.season && !item.terms && !item.months && !item.xun && !item.dow;

    // 按命中维度加权复制，让更应景的词有更高概率
    const weighted = PHRASES
        .filter(item => sameStyle(item) && matches(item, ctx))
        .flatMap(item => Array<GreetPhrase>(weightOf(item)).fill(item));

    // 当天该语境下没有可选词时，退回同档同语气的通用词
    const pool = weighted.length > 0 ? weighted : PHRASES.filter(item => sameStyle(item) && isPlain(item));

    return pool[dateSeed(param) % pool.length] ?? {text: "春山可望", tone: "wish", style: "literary"};
}