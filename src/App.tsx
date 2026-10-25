import {useEffect, useState, useRef} from "react";
import {Col, ConfigProvider, Flex, Layout, notification, Row, Space, Typography} from "antd";
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
import QuickLinkComponent from "./Components/QuickLinkComponent";
import MenuComponent from "./Components/MenuComponent";
import SunComponent from "./Components/SunComponent";
import WaveComponent from "./Components/WaveComponent";
import WeatherComponent from "./Components/WeatherComponent";
import GreetComponent from "./Components/GreetComponent";

const {Header, Content, Footer} = Layout;
const {Text} = Typography;

// 每次发版手动更新此数组
const updateNotes: string[] = [
    "新增快速链接功能",
    "修复已知问题，提升使用体验",
];

function App() {
    const [theme, setTheme] = useState<ThemeInterface>({
        ...defaultTheme,
        primaryFontColor: getFontColor(defaultTheme.primaryColor),
        secondaryFontColor: getFontColor(defaultTheme.secondaryColor),
    });
    const [preference, setPreference] = useState<PreferenceInterface>(defaultPreference);
    const [storageLoaded, setStorageLoaded] = useState(false);
    const hasNotifiedRef = useRef(false);

    function getTheme(value: any) {
        const newTheme: ThemeInterface = {
            primaryColor: value.primaryColor,
            secondaryColor: value.secondaryColor,
            primaryFontColor: getFontColor(value.primaryColor),
            secondaryFontColor: getFontColor(value.secondaryColor),
            svgColors: value.svgColors
        };
        setTheme(newTheme);
    }

    // 仅在组件挂载时从 storage 加载偏好与主题
    useEffect(() => {
        getExtensionStorage(["preference", "theme"]).then((result) => {
            const [preferenceStorage, themeStorage] = result;
            // 放在最前：与后续 setTheme/setPreference 同批渲染，且不受 customTheme 分支提前 return 影响
            setStorageLoaded(true);
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

    // 版本更新通知：等 storage 恢复完成后再弹，保证主题色和字体正确
    useEffect(() => {
        if (hasNotifiedRef.current || !storageLoaded) {
            return;
        }
        hasNotifiedRef.current = true;
        const currentVersion = require("../package.json").version;
        getExtensionStorage(["lastNotifiedVersion"]).then(([lastNotifiedVersion]) => {
            if (lastNotifiedVersion !== currentVersion) {
                notification.open({
                    icon: null,
                    title: "已更新至版本 V" + currentVersion,
                    description: (
                        <Typography style={{marginBottom: 0}}>
                            <ul style={{marginBottom: 0}}>
                                {updateNotes.map((note) => (
                                    <li key={note}>
                                        <Text style={{color: theme.secondaryFontColor, fontFamily: preference.fontFamily}}>
                                            {note}
                                        </Text>
                                    </li>
                                ))}
                            </ul>
                        </Typography>
                    ),
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
    }, [storageLoaded, theme, preference]);

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
                                {preference.showGreet && <GreetComponent theme={theme}/>}
                                {preference.showWeather && <WeatherComponent theme={theme}/>}
                                {preference.showTodo && <TodoComponent theme={theme} fontFamily={preference.fontFamily}/>}
                                {preference.showCountdown && <DailyComponent theme={theme} fontFamily={preference.fontFamily}/>}
                                {preference.showFocus && <FocusComponent theme={theme} fontFamily={preference.fontFamily}/>}
                                {preference.showQuickLink && <QuickLinkComponent theme={theme}/>}
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
