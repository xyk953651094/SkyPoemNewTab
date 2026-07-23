import React, {useEffect, useState} from "react";
import {Button, Col, Flex, Popover, Row, Typography} from "antd";
import {CalendarOutlined, CheckCircleOutlined, CloseCircleOutlined, MoreOutlined} from "@ant-design/icons";
import {getTimeDetails, truncateText} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage} from "../TypeScripts/StorageFunctions";
import {httpRequest} from "../TypeScripts/RequestFunctions";
import {getGreetInfo} from "../TypeScripts/GreetComponent";
import {HoverButton} from "./PublicComponents/PublicButton";
import "../StyleSheets/PublicStyles.scss";

const {Text} = Typography;

// 存储 key 常量
const STORAGE_KEY_REQUEST_DATE = "lastHolidayRequestDate";
const STORAGE_KEY_HOLIDAY = "lastHoliday";

// 宜忌最大显示长度
const MAX_TEXT_SIZE = 80;

// 万年历链接
const CALENDAR_URL = "https://wannianrili.bmcx.com/";

interface HolidayData {
    solarTerms: string;
    typeDes: string;
    yearTips: string;
    chineseZodiac: string;
    lunarCalendar: string;
    constellation: string;
    suit: string;
    avoid: string;
}

interface GreetComponentProps {
    theme: ThemeInterface;
}

function GreetComponent(props: GreetComponentProps) {
    const greetInfo = getGreetInfo();
    const [holidayContent, setHolidayContent] = useState<string>("暂无信息");
    const [calendar, setCalendar] = useState<string>("");
    const [suit, setSuit] = useState<string>("暂无信息");
    const [avoid, setAvoid] = useState<string>("暂无信息");

    // 处理节假日数据（所有字段做兜底，防止 API 字段变动）
    function setHoliday(data: HolidayData) {
        const solarTerms = data?.solarTerms ?? "";
        const typeDes = data?.typeDes ?? "";

        let content = solarTerms || "暂无信息";
        if (solarTerms && solarTerms.indexOf("后") === -1) {
            content = "今日" + content;
        }
        if (typeDes && typeDes !== "休息日" && typeDes !== "工作日") {
            content = content + " · " + typeDes;
        }

        const timeDetails = getTimeDetails(new Date());
        const yearTips = data?.yearTips ?? "";
        const chineseZodiac = data?.chineseZodiac ?? "";
        const lunarCalendar = data?.lunarCalendar ?? "";
        const constellation = data?.constellation ?? "";

        setHolidayContent(content);
        setCalendar(
            `${timeDetails.year}年${timeDetails.month}月${timeDetails.day}日 ${timeDetails.week} ｜ ` +
            `${yearTips}${chineseZodiac}年 ｜ ${lunarCalendar} ｜ ${constellation}`
        );
        setSuit(data?.suit ? data.suit.replace(/\./g, " · ") : "暂无信息");
        setAvoid(data?.avoid ? data.avoid.replace(/\./g, " · ") : "暂无信息");
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
            await setExtensionStorage(STORAGE_KEY_REQUEST_DATE, dateStr);
            if (resultData.code === 1) {
                await setExtensionStorage(STORAGE_KEY_HOLIDAY, resultData.data);
                setHoliday(resultData.data);
            }
        } catch {
            // 请求失败时使用上一次缓存
            const [lastHoliday] = await getExtensionStorage([STORAGE_KEY_HOLIDAY]);
            if (lastHoliday) {
                setHoliday(lastHoliday);
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
                // 今天已请求过，直接使用缓存
                setHoliday(lastHoliday);
            } else {
                // 跨天或首次使用，重新请求
                await fetchHoliday();
            }
        }

        loadHoliday();
    }, []);

    const popoverTitle = (
        <Row align={"middle"}>
            <Col span={8}>
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {"万年历"}
                </Text>
            </Col>
            <Col span={16} style={{textAlign: "right"}}>
                <HoverButton theme={props.theme} icon={<MoreOutlined/>} href={CALENDAR_URL} target={"_self"}>
                    {"更多信息"}
                </HoverButton>
            </Col>
        </Row>
    );

    const popoverContent = (
        <Flex vertical gap={"small"}>
            <HoverButton theme={props.theme} icon={<CalendarOutlined/>}>
                {calendar}
            </HoverButton>
            <HoverButton theme={props.theme} icon={<CheckCircleOutlined/>}>
                {"宜：" + truncateText(suit, MAX_TEXT_SIZE)}
            </HoverButton>
            <HoverButton theme={props.theme} icon={<CloseCircleOutlined/>}>
                {"忌：" + truncateText(avoid, MAX_TEXT_SIZE)}
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
                {greetInfo.greet + " ｜ " + holidayContent}
            </Button>
        </Popover>
    );
}

export default React.memo(GreetComponent);
