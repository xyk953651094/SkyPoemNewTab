import React, {useEffect, useState} from "react";
import {
    Button,
    Col,
    DatePicker, Divider,
    Empty,
    Flex,
    Input,
    message,
    Popover,
    Row,
    Space,
    Typography
} from "antd";
import type {DatePickerProps} from "antd";
import dayjs from "dayjs";
import {CalendarOutlined, DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {createThemedMessage} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage, removeExtensionStorage} from "../TypeScripts/StorageFunctions";
import {HoverButton} from "./PublicComponents/PublicButton";
import { PublicModal } from "./PublicComponents/PublicModal";
import "../StyleSheets/PublicStyles.scss";

const {Text} = Typography;
const DAILY_MAX_SIZE = 5;

// 存储 key 常量
const STORAGE_KEY_DAILY = "daily";

// 毫秒常量
const MS_PER_DAY = 86400000;

interface DailyItem {
    title: string;
    selectedTimeStamp: number;
    timeStamp: number;
}

interface DailyComponentProps {
    theme: ThemeInterface;
}

function CountdownComponent(props: DailyComponentProps) {
    const [dailyList, setDailyList] = useState<DailyItem[]>([]);
    const [displayModal, setDisplayModal] = useState<boolean>(false);
    const [inputValue, setInputValue] = useState<string>("");
    const [selectedTimeStamp, setSelectedTimeStamp] = useState<number>(0);

    const themedMessage = createThemedMessage(props.theme, message);

    // 持久化倒数日列表
    async function saveDailyList(list: DailyItem[]) {
        if (list.length === 0) {
            await removeExtensionStorage(STORAGE_KEY_DAILY);
        } else {
            await setExtensionStorage(STORAGE_KEY_DAILY, list);
        }
    }

    // 按目标日期升序排序
    function sortByDate(list: DailyItem[]): DailyItem[] {
        return [...list].sort((a, b) => a.selectedTimeStamp - b.selectedTimeStamp);
    }

    // 获取今天的零点时间戳
    function getTodayTimeStamp(): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return today.getTime();
    }

    // 计算倒数日描述
    function getDailyDescription(targetTimeStamp: number): string {
        const today = getTodayTimeStamp();
        const diff = today - targetTimeStamp;
        if (diff > 0) {
            return `已过 ${Math.floor(diff / MS_PER_DAY)} 天`;
        } else if (diff === 0) {
            return "就是今天";
        } else {
            return `还剩 ${Math.floor(-diff / MS_PER_DAY)} 天`;
        }
    }

    // 格式化日期为 YYYY-MM-DD
    function formatDate(timeStamp: number): string {
        const date = new Date(timeStamp);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    // 删除单条
    function removeBtnOnClick(item: DailyItem) {
        const newList = dailyList.filter(d => d.timeStamp !== item.timeStamp);
        const sortedList = sortByDate(newList);
        setDailyList(sortedList);
        saveDailyList(sortedList);
        themedMessage.success("删除成功");
    }

    // 打开添加弹窗
    function showAddModalBtnOnClick() {
        if (dailyList.length < DAILY_MAX_SIZE) {
            setDisplayModal(true);
            setInputValue("");
            setSelectedTimeStamp(0);
        } else {
            themedMessage.error(`倒数日数量最多为${DAILY_MAX_SIZE}个`);
        }
    }

    // 确认添加
    function modalOkBtnOnClick() {
        if (!inputValue.trim() || selectedTimeStamp === 0) {
            themedMessage.error("表单不能为空");
            return;
        }

        const newItem: DailyItem = {
            title: inputValue.trim(),
            selectedTimeStamp,
            timeStamp: Date.now(),
        };

        const newList = sortByDate([...dailyList, newItem]);
        setDailyList(newList);
        setDisplayModal(false);
        saveDailyList(newList);
        themedMessage.success("添加成功");
    }

    // 日期选择器变化
    const datePickerOnChange: DatePickerProps["onChange"] = (_date, dateString) => {
        if (dateString && typeof dateString === "string") {
            setSelectedTimeStamp(new Date(dateString).getTime());
        } else {
            setSelectedTimeStamp(0);
        }
    };

    // 初始化：从 storage 读取数据
    useEffect(() => {
        async function loadFromStorage() {
            const [storedDaily] = await getExtensionStorage([STORAGE_KEY_DAILY]);
            const parsedDaily: DailyItem[] = storedDaily ?? [];
            setDailyList(parsedDaily);
        }

        loadFromStorage();
    }, []);

    const popoverTitle = (
        <Row align={"middle"}>
            <Col span={8}>
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {`倒数日 ${dailyList.length} / ${DAILY_MAX_SIZE}`}
                </Text>
            </Col>
            <Col span={16} style={{textAlign: "right"}}>
                <HoverButton theme={props.theme} icon={<PlusOutlined/>} onClick={showAddModalBtnOnClick}>
                    {"添加倒数"}
                </HoverButton>
            </Col>
        </Row>
    );

    const popoverContent = (
        <Flex vertical gap="middle">
            {dailyList.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    styles={{description: {color: props.theme.secondaryFontColor}}}
                />
            ) : (
                dailyList.map((item: DailyItem, index: number) => (
                    <React.Fragment key={item.timeStamp}>
                        <Flex justify="space-between" align="center">
                            <HoverButton
                                theme={props.theme}
                            >
                                {index + 1}、
                                {"距离 " + item.title + "（" + formatDate(item.selectedTimeStamp) + "）" + getDailyDescription(item.selectedTimeStamp)}
                            </HoverButton>
                            <HoverButton
                                theme={props.theme}
                                icon={<DeleteOutlined/>}
                                onClick={() => removeBtnOnClick(item)}
                            >
                                {"删除"}
                            </HoverButton>
                        </Flex>
                        {index < dailyList.length - 1 && <Divider size="small" style={{margin: "0px", borderColor: props.theme.secondaryFontColor}}/>}
                    </React.Fragment>
                ))
            )}
        </Flex>
    );

    return (
        <>
            <Popover
                title={popoverTitle}
                content={popoverContent}
                placement="bottomRight"
                color={props.theme.secondaryColor}
                styles={{root: {minWidth: "600px"}}}
            >
                <Button
                    icon={<CalendarOutlined/>}
                    size={"large"}
                    type={"primary"}
                    className={"floatingButton"}
                    style={{
                        cursor: "default",
                        backgroundColor: props.theme.secondaryColor,
                        color: props.theme.secondaryFontColor,
                    }}
                >
                    {`${dailyList.length} 个倒数`}
                </Button>
            </Popover>
            
            <PublicModal
                theme={props.theme}
                open={displayModal}
                titleText={`添加倒数 ${dailyList.length} / ${DAILY_MAX_SIZE}`}
                titleIcon={<CalendarOutlined/>}
                onOk={modalOkBtnOnClick}
                onCancel={() => setDisplayModal(false)}
            >
                <Space orientation="vertical" style={{width: "100%"}}>
                    <Input
                        placeholder="请输入标题"
                        size={"large"}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        maxLength={10}
                        showCount
                        allowClear
                    />
                    <DatePicker
                        size={"large"}
                        disabledDate={(current) => dayjs(current).isBefore(dayjs())}
                        onChange={datePickerOnChange}
                        allowClear={false}
                        style={{width: "100%"}}
                    />
                </Space>
            </PublicModal>
        </>
    );
}

export default React.memo(CountdownComponent);
