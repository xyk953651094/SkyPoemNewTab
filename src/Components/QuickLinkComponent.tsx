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
import {DeleteOutlined, LinkOutlined, PlusOutlined} from "@ant-design/icons";
import {createThemedMessage} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage, removeExtensionStorage} from "../TypeScripts/StorageFunctions";
import {HoverButton} from "./PublicComponents/PublicButton";
import {PublicModal} from "./PublicComponents/PublicModal";

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

    function openLink(url: string) {
        window.open(url, "_blank");
    }

    useEffect(() => {
        async function loadFromStorage() {
            const [storedLinks] = await getExtensionStorage([STORAGE_KEY_QUICK_LINKS]);
            const parsedLinks: QuickLinkItem[] = storedLinks ?? [];
            setLinkList(parsedLinks);
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
        <Flex vertical gap="middle">
            {linkList.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    styles={{description: {color: props.theme.secondaryFontColor}}}
                />
            ) : (
                linkList.map((item: QuickLinkItem, index: number) => (
                    <React.Fragment key={item.timeStamp}>
                        <Flex justify="space-between" align="center">
                            <HoverButton
                                theme={props.theme}
                                onClick={() => openLink(item.url)}
                            >
                                {"点击前往 " + item.name}
                            </HoverButton>
                            <HoverButton
                                theme={props.theme}
                                icon={<DeleteOutlined/>}
                                onClick={() => deleteBtnOnClick(item)}
                            >
                                {"删除"}
                            </HoverButton>
                        </Flex>
                        {index < linkList.length - 1 && <Divider size="small" style={{margin: "0px", borderColor: props.theme.secondaryFontColor}}/>}
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
