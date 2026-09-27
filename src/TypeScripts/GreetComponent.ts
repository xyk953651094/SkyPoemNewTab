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