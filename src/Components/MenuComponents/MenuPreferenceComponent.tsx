import React, {useState} from "react";
import {Card, ColorPicker, Form, message, Radio, RadioChangeEvent, Row, Space, Typography} from "antd";
import {BgColorsOutlined, RedoOutlined, SettingOutlined, StopOutlined} from "@ant-design/icons";
import type {ColorPickerProps, GetProp} from "antd";
import {ThemeInterface, PreferenceInterface} from "../../TypeScripts/PublicInterface";
import {createThemedMessage} from "../../TypeScripts/PublicFunctions";
import {setExtensionStorage, clearExtensionStorage} from "../../TypeScripts/StorageFunctions";
import {defaultPreference, poemTopics} from "../../TypeScripts/PublicConstants";
import {HoverButton} from "../PublicComponents/PublicButton";
import {PublicModal} from "../PublicComponents/PublicModal";

type Color = GetProp<ColorPickerProps, 'value'>;
const {Text} = Typography;

const poemTopicLabels: Record<string, string> = {
    all: "随机", shuqing: "抒情", siji: "四季", shanshui: "山水",
    tianqi: "天气", renwu: "人物", rensheng: "人生", shenghuo: "生活",
    jieri: "节日", dongwu: "动物", zhiwu: "植物", shiwu: "食物"
};

interface MenuPreferenceComponentProps {
    theme: ThemeInterface;
    preference: PreferenceInterface;
    getPreference: React.Dispatch<React.SetStateAction<PreferenceInterface>>;
}

function MenuPreferenceComponent(props: MenuPreferenceComponentProps) {
    const {theme, preference, getPreference} = props;
    const themedMessage = createThemedMessage(theme, message);

    const [displayCustomThemeModal, setDisplayCustomThemeModal] = useState(false);
    const customThemeState = preference.customTheme !== null;
    const [customPrimaryColor, setCustomPrimaryColor] = useState<string>(theme.primaryColor);
    const [customSecondaryColor, setCustomSecondaryColor] = useState<string>(theme.secondaryColor);
    const [customSvgColor0, setCustomSvgColor0] = useState<string>(theme.svgColors[0]);
    const [customSvgColor1, setCustomSvgColor1] = useState<string>(theme.svgColors[1]);
    const [customSvgColor2, setCustomSvgColor2] = useState<string>(theme.svgColors[2]);

    const [displayResetPreferenceModal, setDisplayResetPreferenceModal] = useState(false);
    const [displayClearStorageModal, setDisplayClearStorageModal] = useState(false);

    // 修改偏好设置
    function updatePreference(data: Partial<PreferenceInterface>) {
        const newPreference = {...preference, ...data};
        getPreference(newPreference);
        setExtensionStorage("preference", newPreference);
    }

    // 诗词主题
    function poemTopicsRadioOnChange(event: RadioChangeEvent) {
        updatePreference({poemTopic: event.target.value});
        themedMessage.success("已更换诗词主题，下次刷新诗词时生效");
    }

    // 字体类型
    function fontFamilyRadioOnChange(event: RadioChangeEvent) {
        updatePreference({fontFamily: event.target.value});
        themedMessage.success("已更换字体类型");
    }

    // 自定颜色
    function customThemeOkBtnOnClick() {
        setDisplayCustomThemeModal(false);
        updatePreference({
            customTheme: {
                primaryColor: customPrimaryColor,
                secondaryColor: customSecondaryColor,
                svgColors: [customSvgColor0, customSvgColor1, customSvgColor2]
            }
        });
        themedMessage.success("已启用自定颜色，一秒后刷新页面");
        setTimeout(() => window.location.reload(), 1000);
    }

    function disableCustomThemeBtnOnClick() {
        setDisplayCustomThemeModal(false);
        updatePreference({customTheme: null});
        themedMessage.success("已关闭自定颜色，一秒后刷新页面");
        setTimeout(() => window.location.reload(), 1000);
    }

    // 重置设置
    function resetPreferenceOkBtnOnClick() {
        setDisplayResetPreferenceModal(false);
        setExtensionStorage("preference", defaultPreference);
        themedMessage.success("已重置设置，一秒后刷新页面");
        setTimeout(() => window.location.reload(), 1000);
    }

    // 重置插件
    function clearStorageOkBtnOnClick() {
        setDisplayClearStorageModal(false);
        clearExtensionStorage();
        setExtensionStorage("preference", defaultPreference);
        themedMessage.success("已重置插件，一秒后刷新页面");
        setTimeout(() => window.location.reload(), 1000);
    }

    const labelStyle = {color: theme.secondaryFontColor};

    return (
        <>
            <Card title={"偏好设置"} extra={<SettingOutlined/>}
                  styles={{
                      root: {backgroundColor: theme.secondaryColor, borderColor: theme.secondaryFontColor},
                      header: {color: theme.secondaryFontColor, borderColor: theme.secondaryFontColor},
                      extra: {color: theme.secondaryFontColor}
                  }}>
                <Form colon={false}>
                    <Form.Item label={<Text style={labelStyle}>{"诗词主题"}</Text>}
                               extra={<Text style={labelStyle}>{"下次刷新诗词时生效"}</Text>}>
                        <Radio.Group buttonStyle={"solid"}
                                     style={{width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 8}}
                                     value={preference.poemTopic}
                                     onChange={poemTopicsRadioOnChange}
                                     options={poemTopics.map((topic) => ({
                                         label: poemTopicLabels[topic],
                                         value: topic,
                                         style: {color: props.theme.secondaryFontColor}
                                     }))}
                        />
                    </Form.Item>
                    <Form.Item label={<Text style={labelStyle}>{"字体类型"}</Text>}>
                        <Radio.Group buttonStyle={"solid"} style={{width: "100%"}}
                                     value={preference.fontFamily}
                                     onChange={fontFamilyRadioOnChange}
                                     options={[
                                         {
                                             value: "cursive",
                                             label: "带衬线",
                                             style: {color: props.theme.secondaryFontColor}
                                         },
                                         {
                                             value: "sansSerif",
                                             label: "无衬线",
                                             style: {color: props.theme.secondaryFontColor}
                                         }
                                     ]}
                        />
                    </Form.Item>
                    <Form.Item label={<Text style={labelStyle}>{"自定颜色"}</Text>}
                               extra={customThemeState ? <Text style={labelStyle}>{"已启用自定义主题颜色"}</Text> : undefined}>
                        <HoverButton theme={theme} icon={<BgColorsOutlined/>}
                                     onClick={() => setDisplayCustomThemeModal(true)}>
                            {"自定义插件主题颜色"}
                        </HoverButton>
                    </Form.Item>
                    <Form.Item label={<Text style={labelStyle}>{"危险设置"}</Text>}
                               extra={<Text style={labelStyle}>{"出现异常时可尝试重置设置或插件"}</Text>}>
                        <Space>
                            <HoverButton theme={theme} icon={<RedoOutlined/>}
                                         onClick={() => setDisplayResetPreferenceModal(true)}>
                                {"重置设置"}
                            </HoverButton>
                            <HoverButton theme={theme} icon={<RedoOutlined/>}
                                         onClick={() => setDisplayClearStorageModal(true)}>
                                {"重置插件"}
                            </HoverButton>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* 自定颜色弹窗 */}
            <PublicModal
                theme={theme}
                open={displayCustomThemeModal}
                titleText="自定义插件主题颜色"
                titleIcon={<BgColorsOutlined style={{color: theme.secondaryFontColor}}/>}
                onOk={customThemeOkBtnOnClick}
                onCancel={() => setDisplayCustomThemeModal(false)}
            >
                <Form colon={false}>
                    <Form.Item label={<Text style={labelStyle}>{"主要颜色"}</Text>}
                               extra={<Text style={labelStyle}>{"影响背景颜色与按钮颜色"}</Text>}>
                        <Space>
                            <ColorPicker value={customPrimaryColor}
                                         onChange={(_value: Color, hex: string) => setCustomPrimaryColor(hex)}
                                         showText disabledAlpha/>
                            <ColorPicker value={customSecondaryColor}
                                         onChange={(_value: Color, hex: string) => setCustomSecondaryColor(hex)}
                                         showText disabledAlpha/>
                        </Space>
                    </Form.Item>
                    <Form.Item label={<Text style={labelStyle}>{"SVG颜色"}</Text>}
                               extra={<Text style={labelStyle}>{"影响左上角太阳与底部波浪"}</Text>}>
                        <Space>
                            <ColorPicker value={customSvgColor0}
                                         onChange={(_value: Color, hex: string) => setCustomSvgColor0(hex)}
                                         showText disabledAlpha/>
                            <ColorPicker value={customSvgColor1}
                                         onChange={(_value: Color, hex: string) => setCustomSvgColor1(hex)}
                                         showText disabledAlpha/>
                            <ColorPicker value={customSvgColor2}
                                         onChange={(_value: Color, hex: string) => setCustomSvgColor2(hex)}
                                         showText disabledAlpha/>
                        </Space>
                    </Form.Item>
                </Form>
                {customThemeState && (
                    <Row justify="center">
                        <HoverButton theme={theme} icon={<StopOutlined/>} onClick={disableCustomThemeBtnOnClick}>
                            {"恢复默认主题颜色"}
                        </HoverButton>
                    </Row>
                )}
            </PublicModal>

            {/* 重置设置弹窗 */}
            <PublicModal
                theme={theme}
                open={displayResetPreferenceModal}
                titleText="确定重置设置？"
                titleIcon={<RedoOutlined style={{color: theme.secondaryFontColor}}/>}
                onOk={resetPreferenceOkBtnOnClick}
                onCancel={() => setDisplayResetPreferenceModal(false)}
            >
                <Text style={labelStyle}>{"注意：所有设置项将被重置为默认值"}</Text>
            </PublicModal>

            {/* 重置插件弹窗 */}
            <PublicModal
                theme={theme}
                open={displayClearStorageModal}
                titleText="确定重置插件？"
                titleIcon={<RedoOutlined style={{color: theme.secondaryFontColor}}/>}
                onOk={clearStorageOkBtnOnClick}
                onCancel={() => setDisplayClearStorageModal(false)}
            >
                <Text style={labelStyle}>{"注意：所有设置项将被重置为默认值，所有数据将被清空"}</Text>
            </PublicModal>
        </>
    );
}

export default React.memo(MenuPreferenceComponent);
