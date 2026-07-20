import {useEffect, useState} from "react";
import {Col, Flex, Layout, Row, Space} from "antd";
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
        // 持久化主题色，供刷新后恢复（仅在 PoemComponent 触发换色时写入）
        setExtensionStorage("theme", {
            primaryColor: newTheme.primaryColor,
            secondaryColor: newTheme.secondaryColor,
            svgColors: newTheme.svgColors
        });
    }

    // 仅在组件挂载时从 storage 加载偏好与主题
    useEffect(() => {
        getExtensionStorage(["preference", "theme"]).then((result) => {
            const [preferenceStorage, themeStorage] = result;
            if (preferenceStorage) {
                setPreference(fixPreference(preferenceStorage));
            }
            if (themeStorage) {
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

    // 仅负责视觉副作用：设置 body 背景色和文字颜色
    useEffect(() => {
        if (theme.primaryColor && theme.primaryFontColor) {
            document.body.style.backgroundColor = theme.primaryColor;
            document.body.style.color = theme.primaryFontColor;
            document.body.style.transition = "background-color 0.3s, color 0.3s";
        }
    }, [theme.primaryColor, theme.primaryFontColor]);

    return (
        <Layout>
            <Header className={"layoutHeader"}>
                <SunComponent theme={theme}/>
                <Row justify={"center"}>
                    <Col span={20} style={{textAlign: "right"}}>
                        <Space align={"center"}>
                            <TodoComponent theme={theme}/>
                            <DailyComponent theme={theme}/>
                            <FocusComponent theme={theme}/>
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
    );
}

export default App;
