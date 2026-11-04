import React, {useEffect, useState} from "react";
import {Button, Divider, Flex, Popover, Progress, Row, Col, Typography} from "antd";
import {MoreOutlined} from "@ant-design/icons";
import {getTimeDetails} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage} from "../TypeScripts/StorageFunctions";
import {httpRequest} from "../TypeScripts/RequestFunctions";
import {getDayContext} from "../TypeScripts/ChineseCalendar";
import {getGreetInfo, pickGreetPhrase} from "../TypeScripts/GreetComponent";
import {HoverButton} from "./PublicComponents/PublicButton";
import "../StyleSheets/PublicStyles.scss";

const {Text} = Typography;

// 存储 key 常量
const STORAGE_KEY_REQUEST_DATE = "lastHolidayRequestDate";
const STORAGE_KEY_HOLIDAY = "lastHoliday";

// 日历搜索链接
const CALENDAR_URL = "https://www.bing.com/search?q=日历";

interface HolidayData {
    typeDes: string;
}

interface GreetComponentProps {
    theme: ThemeInterface;
}

function GreetComponent(props: GreetComponentProps) {
    // 新标签页每天才会重新加载，日期与文案直接算在当前渲染里即可
    const now = new Date();
    const dayContext = getDayContext(now);
    const phrase = pickGreetPhrase(dayContext, "literary", now);
    const greetInfo = getGreetInfo();
    const yearPercent = Math.round(dayContext.dayOfYear / (dayContext.dayOfYear + dayContext.daysLeftInYear) * 100);

    const [festivalText, setFestivalText] = useState<string>("");

    // 只留节日名：节气由本地历法算出，工作日与休息日不算节庆
    function setFestival(param: HolidayData) {
        const typeDes = param?.typeDes ?? "";
        setFestivalText(typeDes === "休息日" || typeDes === "工作日" ? "" : typeDes);
    }

    // 请求节假日 API
    async function fetchHoliday() {
        const timeDetails = getTimeDetails(new Date());
        const dateStr = `${timeDetails.year}${timeDetails.month}${timeDetails.day}`;
        const url = `https://www.mxnzp.com/api/holiday/single/${dateStr}`;

        try {
            const resultData = await httpRequest<any>(url, {
                method: "GET",
                data: {
                    app_id: "cicgheqakgmpjclo",
                    app_secret: "RVlRVjZTYXVqeHB3WCtQUG5lM0h0UT09",
                },
            });
            if (resultData.code === 1) {
                // 仅在拿到有效数据时才标记「今日已请求」，避免 code!==1（限流/密钥失效）时锁定当天、静默沿用旧缓存
                await setExtensionStorage(STORAGE_KEY_REQUEST_DATE, dateStr);
                await setExtensionStorage(STORAGE_KEY_HOLIDAY, resultData.data);
                setFestival(resultData.data);
            }
        } catch {
            // 请求失败时使用上一次缓存
            const [lastHoliday] = await getExtensionStorage([STORAGE_KEY_HOLIDAY]);
            if (lastHoliday) {
                setFestival(lastHoliday);
            }
        }
    }

    // 初始化：读取缓存或请求 API（同一天只请求一次）
    useEffect(() => {
        async function loadHoliday() {
            const [lastRequestDate, lastHoliday] = await getExtensionStorage([
                STORAGE_KEY_REQUEST_DATE,
                STORAGE_KEY_HOLIDAY,
            ]);

            const timeDetails = getTimeDetails(new Date());
            const todayStr = `${timeDetails.year}${timeDetails.month}${timeDetails.day}`;

            if (lastRequestDate === todayStr && lastHoliday) {
                setFestival(lastHoliday);
            } else {
                await fetchHoliday();
            }
        }

        loadHoliday();
    }, []);

    const labelStyle = {
        color: props.theme.secondaryFontColor,
        width: "36px",
        flexShrink: 0,
    };

    // 干支年 + 农历日：刻意不放「周二」，传统计时法里不论星期
    const popoverTitle = (
        <Row align={"middle"}>
            <Col span={14}>
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {`${dayContext.ganzhiYear}${dayContext.zodiac}年 · ${dayContext.lunarMonth}${dayContext.lunarDay}`}
                </Text>
            </Col>
            <Col span={10} style={{textAlign: "right"}}>
                <HoverButton theme={props.theme} icon={<MoreOutlined/>} href={CALENDAR_URL} target={"_blank"}>
                    {"更多信息"}
                </HoverButton>
            </Col>
        </Row>
    );

    const popoverContent = (
        <Flex vertical gap="small">
            <Flex align="center" gap={12}>
                <Text style={labelStyle}>{"节气"}</Text>
                <HoverButton theme={props.theme}>
                    {`${dayContext.term.name} · ${dayContext.term.houLabel}「${dayContext.term.houName}」`}
                </HoverButton>
            </Flex>

            <Divider size="small" style={{margin: "0px", borderColor: props.theme.secondaryFontColor}}/>

            <Flex align="center" gap={12}>
                <Text style={labelStyle}>{"年轮"}</Text>
                <Flex vertical gap={4} flex={1}>
                    <Progress
                        percent={yearPercent}
                        size={{height: 8}}
                        showInfo={false}
                        styles={{
                            rail: {backgroundColor: "rgba(128, 128, 128, 0.28)"},
                            track: {backgroundColor: props.theme.primaryColor},
                        }}
                    />
                    <Text style={{color: props.theme.secondaryFontColor}}>
                        {`已过 ${dayContext.dayOfYear} 天 · 还剩 ${dayContext.daysLeftInYear} 天 · ${yearPercent}%`}
                    </Text>
                </Flex>
            </Flex>
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
                icon={<i className={greetInfo.icon}/>}
                size={"large"}
                type={"primary"}
                className={"floatingButton"}
                style={{
                    cursor: "default",
                    backgroundColor: props.theme.secondaryColor,
                    color: props.theme.secondaryFontColor,
                }}
            >
                {festivalText ? `${greetInfo.greet} · ${phrase.text} · ${festivalText}` : `${greetInfo.greet} · ${phrase.text}`}
            </Button>
        </Popover>
    );
}

export default React.memo(GreetComponent);
