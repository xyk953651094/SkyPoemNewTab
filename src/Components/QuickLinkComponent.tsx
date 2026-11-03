import React, {useEffect, useState} from "react";
import {
    Button,
    Col,
    Divider,
    Empty,
    Flex,
    Input,
    message,
    Popover,
    Row,
    Typography
} from "antd";
import {DeleteOutlined, LinkOutlined, PlusOutlined, SearchOutlined} from "@ant-design/icons";
import {changeButtonTheme, createThemedMessage} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getSearchEngineDetail} from "../TypeScripts/SearchComponent";
import {getExtensionStorage, setExtensionStorage, removeExtensionStorage} from "../TypeScripts/StorageFunctions";
import {HoverButton} from "./PublicComponents/PublicButton";
import {PublicModal} from "./PublicComponents/PublicModal";
import "../StyleSheets/QuickLinkComponent.scss";

const {Text} = Typography;
const QUICK_LINK_MAX_SIZE = 5;
const STORAGE_KEY_QUICK_LINKS = "quickLinks";
const STORAGE_KEY_SEARCH_ENGINE = "searchEngine";

// 可循环切换的搜索引擎
const SEARCH_ENGINES = ["bing", "google"];

interface QuickLinkItem {
    name: string;
    url: string;
    timeStamp: number;
}

interface QuickLinkComponentProps {
    theme: ThemeInterface;
}

function QuickLinkComponent(props: QuickLinkComponentProps) {
    const [linkList, setLinkList] = useState<QuickLinkItem[]>([]);
    const [displayModal, setDisplayModal] = useState<boolean>(false);
    const [inputName, setInputName] = useState<string>("");
    const [inputUrl, setInputUrl] = useState<string>("");
    const [searchValue, setSearchValue] = useState<string>("");
    const [searchEngine, setSearchEngine] = useState<string>("bing");

    const searchEngineDetail = getSearchEngineDetail(searchEngine);
    const themedMessage = createThemedMessage(props.theme, undefined, message);

    async function saveLinkList(list: QuickLinkItem[]) {
        if (list.length === 0) {
            await removeExtensionStorage(STORAGE_KEY_QUICK_LINKS);
        } else {
            await setExtensionStorage(STORAGE_KEY_QUICK_LINKS, list);
        }
    }

    function deleteBtnOnClick(item: QuickLinkItem) {
        const newList = linkList.filter(l => l.timeStamp !== item.timeStamp);
        setLinkList(newList);
        saveLinkList(newList);
        themedMessage.success("已删除");
    }

    function showAddModalBtnOnClick() {
        if (linkList.length < QUICK_LINK_MAX_SIZE) {
            setDisplayModal(true);
            setInputName("");
            setInputUrl("");
        } else {
            themedMessage.error(`捷径数量最多为${QUICK_LINK_MAX_SIZE}个`);
        }
    }

    function modalOkBtnOnClick() {
        if (!inputName.trim() || !inputUrl.trim()) {
            themedMessage.error("表单不能为空");
            return;
        }

        const newItem: QuickLinkItem = {
            name: inputName.trim(),
            url: inputUrl.trim(),
            timeStamp: Date.now(),
        };

        const newList = [...linkList, newItem];
        setLinkList(newList);
        setDisplayModal(false);
        saveLinkList(newList);
        themedMessage.success("添加成功");
    }

    // 切换到下一个搜索引擎并持久化
    function searchEngineBtnOnClick() {
        const nextEngine = SEARCH_ENGINES[(SEARCH_ENGINES.indexOf(searchEngine) + 1) % SEARCH_ENGINES.length];
        setSearchEngine(nextEngine);
        setExtensionStorage(STORAGE_KEY_SEARCH_ENGINE, nextEngine);
    }

    // 按下回车执行搜索
    function inputOnPressEnter() {
        const keyword = searchValue.trim();
        if (keyword) {
            window.open(searchEngineDetail.searchEngineUrl + encodeURIComponent(keyword), "_self");
        }
    }

    useEffect(() => {
        async function loadFromStorage() {
            const [storedLinks, storedEngine] = await getExtensionStorage([STORAGE_KEY_QUICK_LINKS, STORAGE_KEY_SEARCH_ENGINE]);
            setLinkList(storedLinks ?? []);
            if (storedEngine && SEARCH_ENGINES.includes(storedEngine)) {
                setSearchEngine(storedEngine);
            }
        }

        loadFromStorage();
    }, []);

    const popoverTitle = (
        <Row align={"middle"}>
            <Col span={8}>
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {`捷径 ${linkList.length} / ${QUICK_LINK_MAX_SIZE}`}
                </Text>
            </Col>
            <Col span={16} style={{textAlign: "right"}}>
                <HoverButton theme={props.theme} icon={<PlusOutlined/>} onClick={showAddModalBtnOnClick}>
                    {"添加捷径"}
                </HoverButton>
            </Col>
        </Row>
    );

    const popoverContent = (
        <Flex vertical gap={"middle"}>
            <Input
                size={"large"}
                style={{width: "100%"}}
                placeholder={"按下 Enter 键搜索"}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onPressEnter={inputOnPressEnter}
                prefix={
                    <>
                        <Button
                            type={"text"}
                            size={"small"}
                            icon={<i className={"bi bi-" + searchEngine}/>}
                            style={{color: "#000000", cursor: "pointer"}}
                            onClick={searchEngineBtnOnClick}
                            onMouseOver={(e) => changeButtonTheme(props.theme.primaryColor, props.theme.primaryFontColor, e)}
                            onMouseOut={(e) => changeButtonTheme("transparent", "#000000", e)}
                        >
                            {searchEngineDetail.searchEngineName}
                        </Button>
                        <Divider orientation={"vertical"} style={{borderColor: props.theme.secondaryColor}}/>
                    </>
                }
                suffix={<SearchOutlined/>}
            />
            <Flex wrap="wrap" gap="small" style={linkList.length === 0 ? {minHeight: "100px", alignContent: "center", justifyContent: "center"} : undefined}>
                {linkList.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={"暂无捷径"}
                        styles={{description: {color: props.theme.secondaryFontColor}}}
                    />
                ) : (
                    linkList.map((item) => (
                        <Flex
                            key={item.timeStamp}
                            align="center"
                            className="quickLinkGroup"
                            style={{
                                "--ql-primary": props.theme.primaryColor,
                                "--ql-primary-font": props.theme.primaryFontColor,
                                "--ql-secondary-font": props.theme.secondaryFontColor,
                            } as React.CSSProperties}
                        >
                            <Button type={"text"} size={"large"} className="quickLinkBtn quickLinkBtnWithBorder" onClick={() => window.open(item.url, "_blank")}>
                                {item.name}
                            </Button>
                            <Button type={"text"} size={"large"} icon={<DeleteOutlined/>} className="quickLinkBtn" onClick={() => deleteBtnOnClick(item)}/>
                        </Flex>
                    ))
                )}
            </Flex>
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
                    icon={<SearchOutlined/>}
                    size={"large"}
                    type={"primary"}
                    className={"floatingButton"}
                    style={{
                        cursor: "default",
                        backgroundColor: props.theme.secondaryColor,
                        color: props.theme.secondaryFontColor,
                    }}
                />
            </Popover>
            <PublicModal
                theme={props.theme}
                open={displayModal}
                titleText={`添加捷径 ${linkList.length} / ${QUICK_LINK_MAX_SIZE}`}
                titleIcon={<LinkOutlined/>}
                onOk={modalOkBtnOnClick}
                onCancel={() => setDisplayModal(false)}
            >
                <Flex vertical gap="middle">
                    <Input
                        placeholder="请输入捷径名称"
                        size={"large"}
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        maxLength={5}
                        showCount
                        allowClear
                    />
                    <Input
                        placeholder="请输入捷径地址，例如：https://www.example.com"
                        size={"large"}
                        value={inputUrl}
                        onChange={(e) => setInputUrl(e.target.value)}
                        allowClear
                    />
                </Flex>
            </PublicModal>
        </>
    );
}

export default React.memo(QuickLinkComponent);
