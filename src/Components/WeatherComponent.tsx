import React, {useEffect, useState} from "react";
import {Button, Col, Flex, Popover, Row, Typography} from "antd";
import {ClockCircleOutlined, EnvironmentOutlined, MoreOutlined} from "@ant-design/icons";
import {getTimeDetails} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage} from "../TypeScripts/StorageFunctions";
import {httpRequest} from "../TypeScripts/RequestFunctions";
import {HoverButton} from "./PublicComponents/PublicButton";
import "../StyleSheets/PublicStyles.scss";

const {Text} = Typography;

// 存储 key 常量
const STORAGE_KEY_REQUEST_TIME = "lastWeatherRequestTime";
const STORAGE_KEY_WEATHER = "lastWeather";

// 缓存有效期：1 小时
const CACHE_INTERVAL = 60 * 60 * 1000;

// 天气信息 API
const WEATHER_API_URL = "https://v2.jinrishici.com/info";

// 天气详情链接
const WEATHER_URL = "https://www.weather.com.cn/";

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

interface WeatherState {
    weatherIcon: string;
    weatherInfo: string;
    location: string;
    humidity: string;
    pm25: string;
    rainfall: string;
    visibility: string;
    windInfo: string;
    lastRequestTime: string;
}

const defaultWeatherState: WeatherState = {
    weatherIcon: "bi bi-cloud",
    weatherInfo: PLACEHOLDER,
    location: PLACEHOLDER,
    humidity: PLACEHOLDER,
    pm25: PLACEHOLDER,
    rainfall: PLACEHOLDER,
    visibility: PLACEHOLDER,
    windInfo: PLACEHOLDER,
    lastRequestTime: PLACEHOLDER,
};

interface WeatherComponentProps {
    theme: ThemeInterface;
}

function WeatherComponent(props: WeatherComponentProps) {
    const [weather, setWeather] = useState<WeatherState>(defaultWeatherState);

    // 从 API 返回的 data 中提取天气状态，所有字段都做兜底
    function parseWeatherData(data: any): WeatherState {
        const weatherData = data?.weatherData;
        if (!weatherData) {
            return {...defaultWeatherState};
        }

        const weatherText = safeField(weatherData.weather);
        const temperature = weatherData.temperature;

        // 风速：方向 + 风力
        const windDirection = weatherData.windDirection;
        const windPower = weatherData.windPower;
        let windInfo = PLACEHOLDER;
        if (windDirection && windPower) {
            windInfo = `${windDirection} ${windPower} 级`;
        } else if (windDirection) {
            windInfo = windDirection;
        }

        return {
            weatherIcon: getWeatherIcon(weatherData.weather ?? ""),
            weatherInfo: weatherText !== PLACEHOLDER && temperature !== null && temperature !== undefined
                ? `${weatherText} ｜ ${temperature}°C`
                : weatherText,
            location: safeField(data?.region, "").replace("|", " · ") || PLACEHOLDER,
            humidity: safeField(weatherData.humidity, "%"),
            pm25: safeField(weatherData.pm25),
            rainfall: safeField(weatherData.rainfall, "%"),
            visibility: safeField(weatherData.visibility),
            windInfo,
            lastRequestTime: PLACEHOLDER, // 由调用方单独设置
        };
    }

    // 格式化"上次更新"时间
    function formatRequestTime(timestamp: number): string {
        const timeDetails = getTimeDetails(new Date(timestamp));
        return `${timeDetails.month}月${timeDetails.day}日 ${timeDetails.hour}:${timeDetails.minute}`;
    }

    // 请求天气 API
    async function fetchWeather() {
        try {
            const resultData = await httpRequest<any>(WEATHER_API_URL, {method: "GET"});
            await setExtensionStorage(STORAGE_KEY_REQUEST_TIME, Date.now());

            if (resultData?.status === "success" && resultData?.data?.weatherData) {
                await setExtensionStorage(STORAGE_KEY_WEATHER, resultData.data);
                const parsed = parseWeatherData(resultData.data);
                parsed.lastRequestTime = formatRequestTime(Date.now());
                setWeather(parsed);
            }
            // status 不是 success 或字段缺失时，保持当前状态（默认值或缓存值）
        } catch {
            // 请求失败时使用上一次缓存
            const [lastWeather, lastTime] = await getExtensionStorage([STORAGE_KEY_WEATHER, STORAGE_KEY_REQUEST_TIME]);
            if (lastWeather) {
                const parsed = parseWeatherData(lastWeather);
                parsed.lastRequestTime = lastTime ? formatRequestTime(lastTime) : PLACEHOLDER;
                setWeather(parsed);
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
                const parsed = parseWeatherData(lastWeather);
                parsed.lastRequestTime = formatRequestTime(lastRequestTime);
                setWeather(parsed);
            }
        }

        loadWeather();
    }, []);

    const popoverTitle = (
        <Row align={"middle"}>
            <Col span={8}>
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {"天气信息"}
                </Text>
            </Col>
            <Col span={16} style={{textAlign: "right"}}>
                <HoverButton theme={props.theme} icon={<MoreOutlined/>} href={WEATHER_URL} target={"_self"}>
                    {"更多信息"}
                </HoverButton>
            </Col>
        </Row>
    );

    const popoverContent = (
        <Flex vertical gap={"small"}>
            <Row>
                <Col span={12}>
                    <HoverButton theme={props.theme} icon={<EnvironmentOutlined/>}>
                        {"地理位置：" + weather.location}
                    </HoverButton>
                </Col>
                <Col span={12}>
                    <HoverButton theme={props.theme} icon={<i className="bi bi-wind"/>}>
                        {"风速情况：" + weather.windInfo}
                    </HoverButton>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <HoverButton theme={props.theme} icon={<i className="bi bi-moisture"/>}>
                        {"空气湿度：" + weather.humidity}
                    </HoverButton>
                </Col>
                <Col span={12}>
                    <HoverButton theme={props.theme} icon={<i className="bi bi-water"/>}>
                        {"空气质量：" + weather.pm25}
                    </HoverButton>
                </Col>
            </Row>
            <Row>
                <Col span={12}>
                    <HoverButton theme={props.theme} icon={<i className="bi bi-cloud-rain"/>}>
                        {"降雨概率：" + weather.rainfall}
                    </HoverButton>
                </Col>
                <Col span={12}>
                    <HoverButton theme={props.theme} icon={<i className="bi bi-eye"/>}>
                        {"视线距离：" + weather.visibility}
                    </HoverButton>
                </Col>
            </Row>
            <HoverButton theme={props.theme} icon={<ClockCircleOutlined/>}>
                {"上次更新：" + weather.lastRequestTime}
            </HoverButton>
        </Flex>
    );

    return (
        <Popover
            title={popoverTitle}
            content={popoverContent}
            placement={"bottomLeft"}
            color={props.theme.secondaryColor}
            styles={{root: {minWidth: "600px"}}}
        >
            <Button
                icon={<i className={weather.weatherIcon}/>}
                size={"large"}
                type={"primary"}
                className={"floatingButton"}
                style={{
                    cursor: "default",
                    backgroundColor: props.theme.secondaryColor,
                    color: props.theme.secondaryFontColor,
                }}
            >
                {weather.weatherInfo}
            </Button>
        </Popover>
    );
}

export default React.memo(WeatherComponent);
