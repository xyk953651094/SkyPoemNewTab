const iconMap: Record<string, string> = {
    "晴": "bi bi-sun",
    "阴": "bi bi-cloud",
    "云": "bi bi-clouds",
    "雨": "bi bi-cloud-rain",
    "雾": "bi bi-cloud-fog",
    "霾": "bi bi-cloud-haze",
    "雪": "bi bi-cloud-snow",
    "雹": "bi bi-cloud-hail",
};

// 构建正则表达式，以匹配映射中的天气情况
const regex = new RegExp(Object.keys(iconMap).join("|"));

// 获取天气图标className
export function getWeatherIcon(weatherInfo: string): string {
    // 在天气信息中寻找匹配的天气情况
    const match = weatherInfo.match(regex);

    // 如果找到匹配项，返回相应的图标类；否则返回空字符串
    return match ? iconMap[match[0]] : "";
}