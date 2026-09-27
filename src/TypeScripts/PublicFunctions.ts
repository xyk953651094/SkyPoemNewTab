import {
    colorRegExp,
    darkThemeArray,
    lightThemeArray,
} from "./PublicConstants";
import {ThemeInterface} from "./PublicInterface";

// 获取日期与时间
export function getTimeDetails(param: Date) {
    if (isNaN(param.getTime())) {
        throw new Error("Invalid Date provided.");
    }
    
    // 辅助函数，用于将数字格式化为两位字符串
    function formatNumber(value: number): string {
        return value.toString().padStart(2, "0");
    }
    
    const year = param.getFullYear().toString();
    const month = formatNumber(param.getMonth() + 1);
    const day = formatNumber(param.getDate());
    const hour = formatNumber(param.getHours());
    const minute = formatNumber(param.getMinutes());
    const second = formatNumber(param.getSeconds());
    const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][param.getDay()];
    
    const localeDate: string = "农历" + param.toLocaleString("zh-Hans-u-ca-chinese").split(" ")[0] + "日";
    
    return {
        year, month, day, hour, minute, second, week, localeDate
    };
}

/**
 * 判断值是否为"空"
 * - null / undefined → 空
 * - 字符串 / 数组 → length 为 0 则空
 * - 普通对象 → 所有自有属性均为 null / undefined / length 0 则空
 * - 其余类型（number / boolean 等）→ 非空
 */
export function isEmpty(param: unknown): boolean {
    if (param === null || param === undefined) {
        return true;
    }
    
    // 字符串或数组：通过 length 判断
    if (typeof param === "string" || Array.isArray(param)) {
        return param.length === 0;
    }
    
    // 普通对象：所有自有属性均为 null / undefined / length 0 视为空
    if (typeof param === "object") {
        return Object.entries(param).every(
            ([, value]) => value === null || value === undefined || value.length === 0
        );
    }
    
    return false;
}

// 设置颜色主题：跟随系统深色模式偏好，从对应色板中随机选取
// 纯随机函数，不读取任何存储；自定颜色由调用方通过 preference.customTheme ?? setTheme() 决策
export function setTheme() {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const themeArray = prefersDark ? darkThemeArray : lightThemeArray;

    if (!themeArray || !Array.isArray(themeArray) || themeArray.length === 0) {
        throw new Error('Invalid themeArray.');
    }

    const randomNum = Math.floor(Math.random() * themeArray.length);
    return themeArray[randomNum];
}

// 根据背景颜色改变字体颜色效果
export function getFontColor(color: string): string {
    if (!colorRegExp.test(color)) {
        return "#ffffff";
    }
    
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    const gray = Math.round(r * 0.299 + g * 0.587 + b * 0.114);
    return gray > 128 ? "#000000" : "#ffffff";
}

// 通用类型检测：返回第一个匹配为 true 的 key，无匹配则返回 fallback
function detectType(detections: Record<string, boolean>, fallback: string): string {
    for (const key in detections) {
        if (detections[key]) return key;
    }
    return fallback;
}

// 判断设备型号
export function getDeviceType(): string {
    const ua = navigator.userAgent;
    return detectType({
        "iPhone": ua.includes("iPhone"),
        "iPad": ua.includes("iPad"),
        "Android": ua.includes("Android"),
    }, "Other");
}

// 判断浏览器型号
export function getBrowserType(): string {
    const ua = navigator.userAgent;
    return detectType({
        "Chrome": ua.includes("Chrome") && ua.includes("Safari") && !ua.includes("Edg"),
        "Edge": ua.includes("Edg"),
        "Firefox": ua.includes("Firefox"),
        "Safari": !ua.includes("Chrome") && ua.includes("Safari"),
    }, "Other");
}

// 按钮鼠标悬停与离开事件
export function changeButtonTheme(backgroundColor: string, fontColor: string, e: { currentTarget: HTMLElement }) {
    if (!colorRegExp.test(backgroundColor) && backgroundColor !== "transparent") {
        throw new Error("Invalid color format. Expected a 6-digit hexadecimal color code prefixed with '#' or 'transparent'.");
    }
    
    const target = e.currentTarget;
    target.style.backgroundColor = backgroundColor;
    target.style.color = fontColor;
}

export function truncateText(text: string, maxLength: number): string {
    return text.length < maxLength ? text : text.slice(0, maxLength) + "...";
}

// 创建带主题样式的 message 调用器，避免每次调用都重复写 styles 配置
// 注意：在 useEffect(fn, []) 的异步函数中使用时，需通过 ref 读取最新的 themedMessage，
// 否则捕获的是首次渲染时的空 theme。
export function createThemedMessage(theme: ThemeInterface, fontFamily: string, message: any) {
    const themedStyles = {
        root: {backgroundColor: theme.secondaryColor, fontFamily: fontFamily},
        icon: {color: theme.secondaryFontColor},
        title: {color: theme.secondaryFontColor}
    };
    
    const apply = (method: string, content: string) =>
        isEmpty(theme) ? message[method]({content}) : message[method]({content, styles: themedStyles});
    
    return {
        ...message,
        success: (content: string) => apply("success", content),
        error: (content: string) => apply("error", content),
        info: (content: string) => apply("info", content),
        warning: (content: string) => apply("warning", content),
        loading: (config: any) => {
            const normalized = typeof config === "string" ? {content: config} : config;
            return isEmpty(theme) ? message.loading(normalized) : message.loading({
                ...normalized,
                styles: themedStyles
            });
        },
    };
}