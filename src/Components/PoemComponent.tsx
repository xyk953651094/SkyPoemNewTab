import React, {useEffect, useRef, useState} from "react";
import {Flex, Input, message, Space} from "antd";
import {EditOutlined, ReloadOutlined, StopOutlined} from "@ant-design/icons";
import {ThemeInterface, PreferenceInterface} from "../TypeScripts/PublicInterface";
import {setTheme, createThemedMessage, truncateText} from "../TypeScripts/PublicFunctions";
import {getExtensionStorage, setExtensionStorage} from "../TypeScripts/StorageFunctions";
import {poemSwitchingInterval} from "../TypeScripts/PublicConstants";
import {httpRequest} from "../TypeScripts/RequestFunctions";
import {FillButton, HoverButton} from "./PublicComponents/PublicButton";
import {PublicModal} from "./PublicComponents/PublicModal";

const poemMaxSize = 30;
const manualRefreshCooldown = 0; // 5 * 60 * 1000

interface PoemComponentProps {
    theme: ThemeInterface;
    preference: PreferenceInterface;
    getTheme: (value: any) => void;
}

// 解析诗词 API 返回数据（兼容 jinrishici 库格式和 v1 API 直接格式）
function normalizePoemData(raw: any) {
    if (raw?.data) {
        return {
            content: raw.data.content,
            author: raw.data.origin.author,
            title: raw.data.origin.title,
        };
    }
    return {
        content: raw.content,
        author: raw.author,
        title: raw.origin,
    };
}

function PoemComponent(props: PoemComponentProps) {
    const {theme, preference, getTheme} = props;

    const [displayModal, setDisplayModal] = useState(false);
    const [poemContent, setPoemContent] = useState("海上生明月，天涯共此时。");
    const [poemAuthor, setPoemAuthor] = useState("张九龄 · <望月怀远>");
    const [customPoem, setCustomPoem] = useState(false);
    const [customContentInputValue, setCustomContentInputValue] = useState("");
    const [customAuthorInputValue, setCustomAuthorInputValue] = useState("");

    const themedMessage = createThemedMessage(theme, message);

    // 设置诗词内容
    function applyPoem(raw: any) {
        const poem = normalizePoemData(raw);

        const content = truncateText(poem.content, poemMaxSize);
        const authorText = `${poem.author} · <${poem.title.replace(/\s*·\s*/g, " · ")}>`;

        setPoemContent(content);
        setPoemAuthor(truncateText(authorText, poemMaxSize));
    }

    // 防止连点：请求进行中忽略新的请求（用 ref 避免极快双击的状态竞态）
    const fetchingRef = useRef(false);

    // 从 API 获取诗词
    async function fetchPoem() {
        if (fetchingRef.current) return;
        fetchingRef.current = true;

        const topic = preference.poemTopic;
        const url = `https://v1.jinrishici.com/${topic}`;

        try {
            const result = await httpRequest(url);

            await setExtensionStorage("lastPoemRequestTime", Date.now());
            await setExtensionStorage("lastPoem", result);

            getTheme(preference.customTheme ?? setTheme());
            applyPoem(result);
        } catch {
            const [lastPoem] = await getExtensionStorage(["lastPoem"]);
            if (lastPoem) {
                applyPoem(lastPoem);
            } else {
                themedMessage.error("获取诗词失败");
            }
        } finally {
            fetchingRef.current = false;
        }
    }

    // Modal 事件
    function handleModalOk() {
        if (customContentInputValue.length > 0 && customAuthorInputValue.length > 0) {
            setDisplayModal(false);
            setCustomPoem(true);
            setPoemContent(customContentInputValue);
            setPoemAuthor(customAuthorInputValue);
            setExtensionStorage("customPoem", true);
            setExtensionStorage("customPoemContent", customContentInputValue);
            setExtensionStorage("customPoemAuthor", customAuthorInputValue);
            themedMessage.success("已使用自定诗词");
        } else {
            themedMessage.error("表单不能为空");
        }
    }

    function handleModalCancel() {
        setDisplayModal(false);
    }

    // 清空自定诗词（状态、存储与输入框一并重置）
    function clearCustomPoem() {
        setCustomPoem(false);
        setCustomContentInputValue("");
        setCustomAuthorInputValue("");
        setExtensionStorage("customPoem", false);
        setExtensionStorage("customPoemContent", "");
        setExtensionStorage("customPoemAuthor", "");
    }

    function handleDisableCustomPoem() {
        setDisplayModal(false);
        clearCustomPoem();
        themedMessage.success("已关闭自定诗词，将刷新诗词");

        setTimeout(() => {
            fetchPoem();
        }, 500);
    }

    useEffect(() => {
        async function init() {
            // 加载自定诗词
            const [customPoemStorage] = await getExtensionStorage(["customPoem"]);
            if (customPoemStorage) {
                setCustomPoem(true);
                // 自定诗词无网络请求，每次开标签页换一次主题色（自定颜色开启时 setTheme 结果被 customTheme 覆盖）
                getTheme(preference.customTheme ?? setTheme());
                const [customContent, customAuthor] = await getExtensionStorage(["customPoemContent", "customPoemAuthor"]);
                if (customContent && customAuthor) {
                    setPoemContent(customContent);
                    setPoemAuthor(customAuthor);
                    setCustomContentInputValue(customContent);
                    setCustomAuthorInputValue(customAuthor);
                }
            } else {
                // 防抖节流：检查上次请求时间
                const [lastRequestTime] = await getExtensionStorage(["lastPoemRequestTime"]);
                const now = Date.now();

                if (lastRequestTime === undefined || lastRequestTime === null || now - lastRequestTime > poemSwitchingInterval) {
                    await fetchPoem();
                } else {
                    const [lastPoem] = await getExtensionStorage(["lastPoem"]);
                    if (lastPoem) {
                        applyPoem(lastPoem);
                    } else {
                        await fetchPoem();
                    }
                }
            }
        }

        init();
    }, [preference.poemTopic]);

    return (
        <>
            <Flex vertical align="center" gap={8}>
                <FillButton theme={theme} fontSize="clamp(24px, 2vw, 42px)" onClick={() => {
                    navigator.clipboard.writeText(poemContent).then(() => themedMessage.success("已复制到剪贴板"));
                }}>
                    {poemContent}
                </FillButton>
                <FillButton theme={theme} fontSize="clamp(16px, 1.2vw, 26px)" onClick={() => {
                    navigator.clipboard.writeText(poemAuthor).then(() => themedMessage.success("已复制到剪贴板"));
                }}>
                    {poemAuthor}
                </FillButton>
                <Flex gap={8}>
                    <FillButton theme={theme} icon={<ReloadOutlined />} onClick={async () => {
                        // 冷却检查：防止频繁请求导致 API 降低诗词质量
                        const [lastRequestTime] = await getExtensionStorage(["lastPoemRequestTime"]);
                        if (lastRequestTime && Date.now() - lastRequestTime < manualRefreshCooldown) {
                            themedMessage.error("操作过于频繁，请稍后再试");
                            return;
                        }
                        // 启用自定诗词时点"换一首"视为放弃自定诗词，先清空再请求随机诗词
                        if (customPoem) {
                            clearCustomPoem();
                            themedMessage.success("已关闭自定诗词");
                        }
                        fetchPoem();
                    }}>
                        {"换一首"}
                    </FillButton>
                    <FillButton theme={theme} icon={<EditOutlined />} onClick={() => setDisplayModal(true)}>
                        {"自定义"}
                    </FillButton>
                </Flex>
            </Flex>

            <PublicModal
                theme={theme}
                open={displayModal}
                titleText="自定诗词"
                titleIcon={<EditOutlined style={{color: theme.secondaryFontColor}}/>}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
            >
                <Space orientation="vertical" style={{width: "100%"}}>
                        <Input
                            placeholder="请输入诗词内容"
                            value={customContentInputValue}
                            onChange={(e) => setCustomContentInputValue(e.target.value)}
                            maxLength={30}
                            showCount
                            allowClear
                        />
                        <Input
                            placeholder="请输入作者信息"
                            value={customAuthorInputValue}
                            onChange={(e) => setCustomAuthorInputValue(e.target.value)}
                            maxLength={30}
                            showCount
                            allowClear
                        />
                    {customPoem && (
                        <Flex justify="center">
                            <HoverButton theme={theme} icon={<StopOutlined/>} onClick={handleDisableCustomPoem}>
                                {"关闭自定诗词"}
                            </HoverButton>
                        </Flex>
                    )}
                </Space>
            </PublicModal>
        </>
    );
}

export default React.memo(PoemComponent);
