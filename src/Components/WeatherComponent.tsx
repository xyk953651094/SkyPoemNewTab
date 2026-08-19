import React, {useEffect, useState} from "react";
import {Button, Tooltip} from "antd";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage} from "../TypeScripts/StorageFunctions";
import {httpRequest} from "../TypeScripts/RequestFunctions";
import "../StyleSheets/PublicStyles.scss";

// 存储 key 常量
const STORAGE_KEY_REQUEST_TIME = "lastWeatherRequestTime";
const STORAGE_KEY_WEATHER = "lastWeather";

// 缓存有效期：1 小时
const CACHE_INTERVAL = 60 * 60 * 1000;

// 天气信息 API
const WEATHER_API_URL = "https://v2.jinrishici.com/info";

// 天气搜索链接
const WEATHER_URL = "https://www.bing.com/search?q=天气";

// 缺省占位文本
const PLACEHOLDER = "暂无信息";

// 根据天气描述匹配 bootstrap icon
function getWeatherIcon(weather: string): string {
    if (!weather) return "bi bi-cloud";
    if (weather.includes("雷")) return "bi bi-cloud-lightning-rain";
    if (weather.includes("雪")) return "bi bi-cloud-snow";
    if (weather.includes("雨")) return weather.includes("暴") ? "bi bi-cloud-rain-heavy" : "bi bi-cloud-rain";
    if (weather.includes("雾")) return "bi bi-cloud-fog";
    if (weather.includes("霾")) return "bi bi-haze";
    if (weather.includes("沙尘") || weather.includes("扬沙")) return "bi bi-wind";
    if (weather.includes("阴")) return "bi bi-cloud";
    if (weather.includes("多云")) return "bi bi-cloud-sun";
    if (weather.includes("晴")) return "bi bi-sun";
    return "bi bi-cloud";
}

// 安全取值：字段缺失或为 null/undefined 时返回 PLACEHOLDER
function safeField(value: unknown, suffix: string = ""): string {
    if (value === null || value === undefined || value === "") return PLACEHOLDER;
    return String(value) + suffix;
}

interface WeatherComponentProps {
    theme: ThemeInterface;
}

function WeatherComponent(props: WeatherComponentProps) {
    const [loaded, setLoaded] = useState<boolean>(false);
    const [weatherIcon, setWeatherIcon] = useState<string>("bi bi-cloud");
    const [weatherInfo, setWeatherInfo] = useState<string>(PLACEHOLDER);
    
    // 从 API 返回的 data 中提取天气图标和按钮文案
    function parseWeatherData(data: any) {
        const weatherData = data?.weatherData;
        if (!weatherData) return;
        
        const weatherText = safeField(weatherData.weather);
        const temperature = weatherData.temperature;
        
        setWeatherIcon(getWeatherIcon(weatherData.weather ?? ""));
        setWeatherInfo(
            weatherText !== PLACEHOLDER && temperature !== null && temperature !== undefined
                ? `${weatherText}｜${temperature}°C`
                : weatherText
        );
    }
    
    // 请求天气 API
    async function fetchWeather() {
        try {
            const resultData = await httpRequest<any>(WEATHER_API_URL, {method: "GET"});
            await setExtensionStorage(STORAGE_KEY_REQUEST_TIME, Date.now());
            
            if (resultData?.status === "success" && resultData?.data?.weatherData) {
                await setExtensionStorage(STORAGE_KEY_WEATHER, resultData.data);
                parseWeatherData(resultData.data);
                setLoaded(true);
            }
        } catch {
            // 请求失败时使用上一次缓存
            const [lastWeather] = await getExtensionStorage([STORAGE_KEY_WEATHER]);
            if (lastWeather) {
                parseWeatherData(lastWeather);
                setLoaded(true);
            }
        }
    }
    
    // 初始化：读取缓存或请求 API
    useEffect(() => {
        async function loadWeather() {
            const [lastRequestTime, lastWeather] = await getExtensionStorage([
                STORAGE_KEY_REQUEST_TIME,
                STORAGE_KEY_WEATHER,
            ]);
            
            const now = Date.now();
            if (lastRequestTime === undefined || now - lastRequestTime > CACHE_INTERVAL) {
                await fetchWeather();
            } else if (lastWeather) {
                parseWeatherData(lastWeather);
                setLoaded(true);
            }
        }
        
        loadWeather();
    }, []);
    
    if (!loaded) return null;
    
    return (
        <Tooltip title={"更多信息"} placement={"bottom"} color={props.theme.secondaryColor} styles={{
            container: {color: props.theme.secondaryFontColor},
        }}>
            <Button
                icon={<i className={weatherIcon}/>}
                size={"large"}
                type={"primary"}
                className={"floatingButton"}
                href={WEATHER_URL}
                target={"_self"}
                style={{
                    cursor: "pointer",
                    backgroundColor: props.theme.secondaryColor,
                    color: props.theme.secondaryFontColor,
                }}
            >
                {weatherInfo}
            </Button>
        </Tooltip>
    );
}

export default React.memo(WeatherComponent);
