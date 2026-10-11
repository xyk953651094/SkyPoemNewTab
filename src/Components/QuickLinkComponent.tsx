import React, {useEffect, useState} from "react";
import {
    Button,
    Col,
    Empty,
    Flex,
    Input,
    message,
    Popover,
    Row,
    Typography
} from "antd";
import {DeleteOutlined, LinkOutlined, PlusOutlined} from "@ant-design/icons";
import {createThemedMessage} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage, removeExtensionStorage} from "../TypeScripts/StorageFunctions";
import {HoverButton} from "./PublicComponents/PublicButton";
import {PublicModal} from "./PublicComponents/PublicModal";
import "../StyleSheets/QuickLinkComponent.scss";

const {Text} = Typography;
const QUICK_LINK_MAX_SIZE = 5;
const STORAGE_KEY_QUICK_LINKS = "quickLinks";

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
            themedMessage.error(`链接数量最多为${QUICK_LINK_MAX_SIZE}个`);
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

    useEffect(() => {
        async function loadFromStorage() {
            const [storedLinks] = await getExtensionStorage([STORAGE_KEY_QUICK_LINKS]);
            setLinkList(storedLinks ?? []);
        }

        loadFromStorage();
    }, []);

    const popoverTitle = (
        <Row align={"middle"}>
            <Col span={8}>
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {`快速链接 ${linkList.length} / ${QUICK_LINK_MAX_SIZE}`}
                </Text>
            </Col>
            <Col span={16} style={{textAlign: "right"}}>
                <HoverButton theme={props.theme} icon={<PlusOutlined/>} onClick={showAddModalBtnOnClick}>
                    {"添加链接"}
                </HoverButton>
            </Col>
        </Row>
    );

    const popoverContent = (
        <Flex wrap="wrap" gap="small" style={linkList.length === 0 ? {minHeight: "100px", alignContent: "center", justifyContent: "center"} : undefined}>
            {linkList.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
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
    );

    return (
        <>
            <Popover
                title={popoverTitle}
                content={popoverContent}
                placement="bottomRight"
                color={props.theme.secondaryColor}
                styles={{root: {minWidth: "400px"}}}
            >
                <Button
                    icon={<LinkOutlined/>}
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
                titleText={`添加链接 ${linkList.length} / ${QUICK_LINK_MAX_SIZE}`}
                titleIcon={<LinkOutlined/>}
                onOk={modalOkBtnOnClick}
                onCancel={() => setDisplayModal(false)}
            >
                <Flex vertical gap="middle">
                    <Input
                        placeholder="请输入链接名称"
                        size={"large"}
                        value={inputName}
                        onChange={(e) => setInputName(e.target.value)}
                        maxLength={10}
                        showCount
                        allowClear
                    />
                    <Input
                        placeholder="请输入链接地址，例如：https://www.example.com"
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
