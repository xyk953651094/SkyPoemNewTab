// 时间段配置
const TIME_PERIODS = [
    { start: 0,  end: 6,  greet: "又一宿", icon: "bi bi-moon-stars" },
    { start: 6,  end: 11, greet: "朝霞满", icon: "bi bi-sunrise" },
    { start: 11, end: 13, greet: "正当午", icon: "bi bi-sun" },
    { start: 13, end: 17, greet: "斜阳下", icon: "bi bi-sunset" },
    { start: 17, end: 18, greet: "日暮里", icon: "bi bi-sunset" },
    { start: 18, end: 24, greet: "见星辰", icon: "bi bi-moon-stars" },
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
        greet: period?.greet ?? "您好",
    };
}