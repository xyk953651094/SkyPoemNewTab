import {useEffect, useState} from "react";
import {Col, ConfigProvider, Flex, Layout, notification, Row, Space} from "antd";
import zhCN from "antd/es/locale/zh_CN";
import "./StyleSheets/PublicStyles.scss"
import {getFontColor} from "./TypeScripts/PublicFunctions";
import {getExtensionStorage, setExtensionStorage, fixPreference} from "./TypeScripts/StorageFunctions";
import {PreferenceInterface, ThemeInterface} from "./TypeScripts/PublicInterface";
import {defaultPreference, defaultTheme} from "./TypeScripts/PublicConstants";
import PoemComponent from "./Components/PoemComponent";
import TodoComponent from "./Components/TodoComponent";
import DailyComponent from "./Components/CountdownComponent";
import FocusComponent from "./Components/FocusComponent";
import MenuComponent from "./Components/MenuComponent";
import SunComponent from "./Components/SunComponent";
import WaveComponent from "./Components/WaveComponent";

const {Header, Content, Footer} = Layout;

function App() {
    const [theme, setTheme] = useState<ThemeInterface>({
        ...defaultTheme,
        primaryFontColor: getFontColor(defaultTheme.primaryColor),
        secondaryFontColor: getFontColor(defaultTheme.secondaryColor),
    });
    const [preference, setPreference] = useState<PreferenceInterface>(defaultPreference);

    function getTheme(value: any) {
        const newTheme: ThemeInterface = {
            primaryColor: value.primaryColor,
            secondaryColor: value.secondaryColor,
            primaryFontColor: getFontColor(value.primaryColor),
            secondaryFontColor: getFontColor(value.secondaryColor),
            svgColors: value.svgColors
        };
        setTheme(newTheme);
        // 持久化主题色供刷新后恢复；自定颜色存在 preference.customTheme，不写入此处以免取消后残留
        if (!preference.customTheme) {
            setExtensionStorage("theme", {
                primaryColor: newTheme.primaryColor,
                secondaryColor: newTheme.secondaryColor,
                svgColors: newTheme.svgColors
            });
        }
    }

    // 仅在组件挂载时从 storage 加载偏好与主题
    useEffect(() => {
        getExtensionStorage(["preference", "theme"]).then((result) => {
            const [preferenceStorage, themeStorage] = result;
            if (preferenceStorage) {
                const fixedPreference = fixPreference(preferenceStorage);
                setPreference(fixedPreference);
                // 自定颜色优先级最高：启用时直接应用
                if (fixedPreference.customTheme) {
                    setTheme({
                        primaryColor: fixedPreference.customTheme.primaryColor,
                        secondaryColor: fixedPreference.customTheme.secondaryColor,
                        primaryFontColor: getFontColor(fixedPreference.customTheme.primaryColor),
                        secondaryFontColor: getFontColor(fixedPreference.customTheme.secondaryColor),
                        svgColors: fixedPreference.customTheme.svgColors
                    });
                    return;
                }
            }
            // 否则恢复上次主题色（诗词主题模式缓存命中时保持颜色不变）
            // 老版本存储的主题可能不含 svgColors，缺失时回退 defaultTheme 避免 Sun/Wave 白屏
            if (themeStorage && Array.isArray(themeStorage.svgColors) && themeStorage.svgColors.length >= 3) {
                setTheme({
                    primaryColor: themeStorage.primaryColor,
                    secondaryColor: themeStorage.secondaryColor,
                    primaryFontColor: getFontColor(themeStorage.primaryColor),
                    secondaryFontColor: getFontColor(themeStorage.secondaryColor),
                    svgColors: themeStorage.svgColors
                });
            }
        });
    }, []);

    // 版本更新通知
    useEffect(() => {
        const currentVersion = require("../package.json").version;
        getExtensionStorage(["lastNotifiedVersion"]).then(([lastNotifiedVersion]) => {
            if (lastNotifiedVersion !== currentVersion) {
                notification.open({
                    icon: null,
                    title: "已更新至版本 V" + currentVersion,
                    description: "新增：字体切换、版本更新提醒等功能",
                    placement: "bottomLeft",
                    duration: 10,
                    styles : {
                        root: {backgroundColor: theme.secondaryColor},
                        title: {color: theme.secondaryFontColor, fontFamily: preference.fontFamily},
                        description: {color: theme.secondaryFontColor, fontFamily: preference.fontFamily},
                    }
                });
                setExtensionStorage("lastNotifiedVersion", currentVersion);
            }
        });
    }, []);

    // 仅负责视觉副作用：设置 body 背景色和文字颜色
    useEffect(() => {
        if (theme.primaryColor && theme.primaryFontColor) {
            document.body.style.backgroundColor = theme.primaryColor;
            document.body.style.color = theme.primaryFontColor;
            document.body.style.transition = "background-color 0.3s, color 0.3s";
        }
    }, [theme.primaryColor, theme.primaryFontColor]);

    return (
        <ConfigProvider locale={zhCN} theme={{token: {fontFamily: preference.fontFamily}}}>
            <Layout>
                <Header className={"layoutHeader"}>
                    <SunComponent theme={theme}/>
                    <Row justify={"center"}>
                        <Col span={20} style={{textAlign: "right"}}>
                            <Space align={"center"}>
                                <TodoComponent theme={theme} fontFamily={preference.fontFamily}/>
                                <DailyComponent theme={theme} fontFamily={preference.fontFamily}/>
                                <FocusComponent theme={theme} fontFamily={preference.fontFamily}/>
                                <MenuComponent
                                    theme={theme}
                                    preference={preference}
                                    getPreference={setPreference}
                                />
                            </Space>
                        </Col>
                    </Row>
                </Header>
                <Content className={"layoutContent"}>
                    <Flex justify="center" align="center" style={{height: "100%"}}>
                        <PoemComponent
                            theme={theme}
                            preference={preference}
                            getTheme={getTheme}
                        />
                    </Flex>
                </Content>
                <Footer className={"layoutFooter"}>
                    <WaveComponent theme={theme}/>
                </Footer>
            </Layout>
        </ConfigProvider>
    );
}

export default App;
