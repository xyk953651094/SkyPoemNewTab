import React, {useEffect, useState} from "react";
import {Button, Tooltip} from "antd";
import {getTimeDetails} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage} from "../TypeScripts/StorageFunctions";
import {httpRequest} from "../TypeScripts/RequestFunctions";
import {getGreetInfo} from "../TypeScripts/GreetComponent";
import "../StyleSheets/PublicStyles.scss";

// 存储 key 常量
const STORAGE_KEY_REQUEST_DATE = "lastHolidayRequestDate";
const STORAGE_KEY_HOLIDAY = "lastHoliday";

// 万年历搜索链接
const CALENDAR_URL = "https://www.bing.com/search?q=万年历";

interface HolidayData {
    solarTerms: string;
    typeDes: string;
}

interface GreetComponentProps {
    theme: ThemeInterface;
}

function GreetComponent(props: GreetComponentProps) {
    const greetInfo = getGreetInfo();
    const [holidayLoaded, setHolidayLoaded] = useState<boolean>(false);
    const [holidayContent, setHolidayContent] = useState<string>("");
    
    // 处理节假日数据（仅提取按钮文案，所有字段做兜底）
    function setHoliday(data: HolidayData) {
        const solarTerms = data?.solarTerms ?? "";
        const typeDes = data?.typeDes ?? "";
        
        let content = solarTerms || "";
        if (solarTerms && solarTerms.indexOf("后") === -1) {
            content = "今日" + content;
        }
        if (typeDes && typeDes !== "休息日" && typeDes !== "工作日") {
            content = content + " · " + typeDes;
        }
        
        setHolidayContent(content);
        setHolidayLoaded(true);
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
                setHoliday(lastHoliday);
            } else {
                await fetchHoliday();
            }
        }
        
        loadHoliday();
    }, []);
    
    return (
        <Tooltip title={"更多信息"} placement={"bottom"} color={props.theme.secondaryColor} styles={{
            container: {color: props.theme.secondaryFontColor},
        }}>
            <Button
                icon={<i className={greetInfo.icon}/>}
                size={"large"}
                type={"primary"}
                className={"floatingButton"}
                href={holidayLoaded ? CALENDAR_URL : undefined}
                target={"_self"}
                style={{
                    cursor: holidayLoaded ? "pointer" : "default",
                    backgroundColor: props.theme.secondaryColor,
                    color: props.theme.secondaryFontColor,
                }}
            >
                {holidayLoaded ? `${greetInfo.greet}｜${holidayContent}` : greetInfo.greet}
            </Button>
        </Tooltip>
    );
}

export default React.memo(GreetComponent);
