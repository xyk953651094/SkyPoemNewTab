import React, {useEffect, useState} from "react";
import {Button, Divider, Flex, Popover, Row, Col, Typography} from "antd";
import {ClockCircleOutlined, MoreOutlined} from "@ant-design/icons";
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

// 天气搜索链接
const WEATHER_URL = "https://www.bing.com/search?q=天气";

// 缺省占位文本
const PLACEHOLDER = "暂无信息";

interface WeatherData {
    weather?: string;
    temperature?: number;
    windDirection?: string;
    windPower?: number;
    humidity?: number;
    pm25?: number;
    visibility?: string;
    updateTime?: string;
}

interface WeatherPayload {
    region?: string;
    weatherData?: WeatherData;
}

interface WeatherInfo {
    icon: string;
    // 按钮文案：雨 · 13.7°C
    headline: string;
    // region 形如「湖北|武汉」，无城市时退化成「湖北|0」
    region: string;
    wind: string;
    humidity: string;
    air: string;
    visibility: string;
    updated: string;
}

// 根据天气描述匹配 bootstrap icon
function getWeatherIcon(weather: string): string {
    if (!weather) return "bi bi-cloud";
    if (weather.includes("雷")) return "bi bi-cloud-lightning-rain";
    if (weather.includes("雪")) return "bi bi-cloud-snow";
    if (weather.includes("雨")) return weather.includes("暴") ? "bi bi-cloud-rain-heavy" : "bi bi-cloud-rain";
    if (weather.includes("雾")) return "bi bi-cloud-fog";
    if (weather.includes("霾")) return "bi bi-cloud-haze";
    if (weather.includes("沙尘") || weather.includes("扬沙")) return "bi bi-wind";
    if (weather.includes("阴")) return "bi bi-cloud";
    if (weather.includes("多云")) return "bi bi-cloud-sun";
    if (weather.includes("晴")) return "bi bi-sun";
    return "bi bi-cloud";
}

// 缺失字段留空串：对应的行整行不渲染，比逐行写「暂无信息」干净
function fieldValue(param: unknown, suffix: string): string {
    if (param === null || param === undefined || param === "") return "";
    return String(param) + suffix;
}

function parseWeatherInfo(param: WeatherPayload): WeatherInfo {
    const data = param?.weatherData;
    const weather = data?.weather ?? "";
    const temperature = fieldValue(data?.temperature, "°C");

    return {
        icon: getWeatherIcon(weather),
        headline: weather && temperature ? `${weather} · ${temperature}` : (weather || PLACEHOLDER),
        region: (param?.region ?? "").split("|").filter(item => item && item !== "0").join(" · "),
        wind: data?.windDirection ? `${data.windDirection} · ${fieldValue(data.windPower, "级")}` : "",
        humidity: fieldValue(data?.humidity, "%"),
        air: fieldValue(data?.pm25, ""),
        visibility: fieldValue(data?.visibility, ""),
        updated: data?.updateTime ?? "",
    };
}

interface WeatherComponentProps {
    theme: ThemeInterface;
}

function WeatherComponent(props: WeatherComponentProps) {
    // 接口没给今日最低/最高，所以做不了温度区间，只铺已有字段
    const [info, setInfo] = useState<WeatherInfo>(parseWeatherInfo({}));

    // 请求天气 API
    async function fetchWeather() {
        try {
            const resultData = await httpRequest<any>(WEATHER_API_URL, {method: "GET"});
            await setExtensionStorage(STORAGE_KEY_REQUEST_TIME, Date.now());

            if (resultData?.status === "success" && resultData?.data?.weatherData) {
                await setExtensionStorage(STORAGE_KEY_WEATHER, resultData.data);
                setInfo(parseWeatherInfo(resultData.data));
            }
        } catch {
            // 请求失败时使用上一次缓存
            const [lastWeather] = await getExtensionStorage([STORAGE_KEY_WEATHER]);
            if (lastWeather) {
                setInfo(parseWeatherInfo(lastWeather));
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
                setInfo(parseWeatherInfo(lastWeather));
            }
        }

        loadWeather();
    }, []);

    const popoverTitle = (
        <Row align={"middle"}>
            <Col span={12}>
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {info.region || PLACEHOLDER}
                </Text>
            </Col>
            <Col span={12} style={{textAlign: "right"}}>
                <HoverButton theme={props.theme} icon={<MoreOutlined/>} href={WEATHER_URL} target={"_blank"}>
                    {"更多信息"}
                </HoverButton>
            </Col>
        </Row>
    );

    // 标签写进按钮文案、两列排布：单列时右侧会空出一大片
    const popoverContent = (
        <Flex vertical gap="small">
            <Row>
                <Col span={12}>
                    {info.wind && (
                        <HoverButton theme={props.theme} icon={<i className="bi bi-wind"/>}>
                            {`${info.wind}`}
                        </HoverButton>
                    )}
                </Col>
                <Col span={12}>
                    {info.humidity && (
                        <HoverButton theme={props.theme} icon={<i className="bi bi-moisture"/>}>
                            {`湿度：${info.humidity}`}
                        </HoverButton>
                    )}
                </Col>
            </Row>

            <Row>
                <Col span={12}>
                    {info.air && (
                        <HoverButton theme={props.theme} icon={<i className="bi bi-water"/>}>
                            {`PM2.5：${info.air}`}
                        </HoverButton>
                    )}
                </Col>
                <Col span={12}>
                    {info.visibility && (
                        <HoverButton theme={props.theme} icon={<i className="bi bi-eye"/>}>
                            {`能见度：${info.visibility}`}
                        </HoverButton>
                    )}
                </Col>
            </Row>

            <Divider size="small" style={{margin: "0px", borderColor: props.theme.secondaryFontColor}}/>

            <HoverButton theme={props.theme} icon={<ClockCircleOutlined/>}>
                {`上次更新：${info.updated || PLACEHOLDER}`}
            </HoverButton>
        </Flex>
    );

    return (
        <Popover
            title={popoverTitle}
            content={popoverContent}
            placement="bottomRight"
            color={props.theme.secondaryColor}
            styles={{root: {width: "350px"}}}
        >
            <Button
                icon={<i className={info.icon}/>}
                size={"large"}
                type={"primary"}
                className={"floatingButton"}
                style={{
                    cursor: "default",
                    backgroundColor: props.theme.secondaryColor,
                    color: props.theme.secondaryFontColor,
                }}
            >
                {info.headline}
            </Button>
        </Popover>
    );
}

export default React.memo(WeatherComponent);
