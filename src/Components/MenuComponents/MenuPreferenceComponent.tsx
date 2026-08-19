import React, {useState} from "react";
import {Card, ColorPicker, Divider, Form, message, Radio, RadioChangeEvent, Row, Select, Space, Switch, Typography} from "antd";
import {BgColorsOutlined, RedoOutlined, SettingOutlined, StopOutlined} from "@ant-design/icons";
import type {ColorPickerProps, GetProp} from "antd";
import {ThemeInterface, PreferenceInterface} from "../../TypeScripts/PublicInterface";
import {createThemedMessage} from "../../TypeScripts/PublicFunctions";
import {setExtensionStorage, clearExtensionStorage, getExtensionStorage} from "../../TypeScripts/StorageFunctions";
import {defaultPreference, poemTopics} from "../../TypeScripts/PublicConstants";
import {HoverButton} from "../PublicComponents/PublicButton";
import {PublicModal} from "../PublicComponents/PublicModal";

type Color = GetProp<ColorPickerProps, 'value'>;
const {Text} = Typography;

const RESET_COOLDOWN_MS = 60 * 1000;

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
    const [formDisabled, setFormDisabled] = useState<boolean>(false);
    const [activeModal, setActiveModal] = useState<"resetPreference" | "clearStorage" | "customTheme" | null>(null);
    const themedMessage = createThemedMessage(theme, preference.fontFamily, message);
    
    const customThemeState = preference.customTheme !== null;
    const [customPrimaryColor, setCustomPrimaryColor] = useState<string>(theme.primaryColor);
    const [customSecondaryColor, setCustomSecondaryColor] = useState<string>(theme.secondaryColor);
    const [customSvgColor0, setCustomSvgColor0] = useState<string>(theme.svgColors[0]);
    const [customSvgColor1, setCustomSvgColor1] = useState<string>(theme.svgColors[1]);
    const [customSvgColor2, setCustomSvgColor2] = useState<string>(theme.svgColors[2]);
    
     function refreshWindow() {
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    // 修改偏好设置
    function updatePreference(data: Partial<PreferenceInterface>) {
        const newPreference = {...preference, ...data};
        getPreference(newPreference);
        setExtensionStorage("preference", newPreference);
    }

    // 诗词来源
    function poemSourceRadioOnChange(event: RadioChangeEvent) {
        updatePreference({poemSource: event.target.value});
        themedMessage.success(event.target.value === "smart"
            ? "已切换到智能主题，下次刷新诗词时生效"
            : "已切换到预设主题，下次刷新诗词时生效");
    }

    // 诗词主题
    function poemTopicSelectOnChange(value: string) {
        updatePreference({poemTopic: value});
        themedMessage.success("已更换诗词主题，下次刷新诗词时生效");
    }

    // 字体类型
    function fontFamilySelectOnChange(value: PreferenceInterface["fontFamily"]) {
        updatePreference({fontFamily: value});
        themedMessage.success("已更换字体类型");
    }

    // 简洁模式
    function simpleModeSwitchOnChange(checked: boolean) {
        updatePreference({simpleMode: checked});
        themedMessage.success(checked ? "已开启简洁模式" : "已关闭简洁模式");
    }

    // 自定颜色
    function customThemeOkBtnOnClick() {
        setActiveModal(null);
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
        setActiveModal(null);
        updatePreference({customTheme: null});
        themedMessage.success("已关闭自定颜色，一秒后刷新页面");
        setTimeout(() => window.location.reload(), 1000);
    }
    
    async function checkCooldownThen(callback: () => void) {
        const [resetTimeStampStorage] = await getExtensionStorage(["lastPreferenceResetTime"]);
        if (resetTimeStampStorage && Date.now() - parseInt(resetTimeStampStorage) < RESET_COOLDOWN_MS) {
            themedMessage.error("操作过于频繁，请稍后再试");
        } else {
            callback();
        }
    }

    // 重置设置
    function resetPreferenceBtnOnClick() {
        checkCooldownThen(() => setActiveModal("resetPreference"));
    }
    
    function resetPreferenceOkBtnOnClick() {
        setFormDisabled(true);
        setActiveModal(null);
        setExtensionStorage("preference", defaultPreference);
        setExtensionStorage("lastPreferenceResetTime", Date.now());
        themedMessage.success("已重置设置，一秒后刷新页面");
        refreshWindow();
    }
    
    function resetPreferenceCancelBtnOnClick() {
        setActiveModal(null);
    }
    
    // 重置插件
    function clearStorageBtnOnClick() {
        checkCooldownThen(() => setActiveModal("clearStorage"));
    }
    
    function clearStorageOkBtnOnClick() {
        setFormDisabled(true);
        setActiveModal(null);
        clearExtensionStorage();
        setExtensionStorage("preference", defaultPreference);
        setExtensionStorage("lastPreferenceResetTime", Date.now());
        themedMessage.success("已重置插件，一秒后刷新页面");
        refreshWindow();
    }
    
    function clearStorageCancelBtnOnClick() {
        setActiveModal(null);
    }

    return (
        <>
            <Card title={"偏好设置"} extra={<SettingOutlined/>}
                  styles={{
                      root: {backgroundColor: theme.secondaryColor, borderColor: theme.secondaryFontColor},
                      header: {color: theme.secondaryFontColor, borderColor: theme.secondaryFontColor},
                      extra: {color: theme.secondaryFontColor}
                  }}>
                <Form layout={"vertical"} disabled={formDisabled}
                      styles={{
                          label: {color: props.theme.secondaryFontColor},
                          extra: {color: props.theme.secondaryFontColor}
                      }}>
                    <Form.Item label={"诗词主题"} extra={preference.poemSource === "smart"
                        ? "智能诗词会根据不同地点、时间、节日、季节、天气、景观、城市进行智能推荐"
                        : ""}>
                        <Radio.Group buttonStyle={"solid"} size={"large"} style={{width: "100%"}}
                                     value={preference.poemSource}
                                     onChange={poemSourceRadioOnChange}
                                     options={[
                                         {value: "smart", label: "智能主题", style: {color: theme.secondaryFontColor}},
                                         {value: "preset", label: "预设主题", style: {color: theme.secondaryFontColor}}
                                     ]}/>
                    </Form.Item>
                    {preference.poemSource === "preset" && (
                        <Form.Item label={"预设主题"} extra={"下次刷新诗词时生效"}>
                            <Select
                                style={{width: "100%"}}
                                value={preference.poemTopic}
                                onChange={poemTopicSelectOnChange}
                                options={poemTopics.map((topic) => ({
                                    label: poemTopicLabels[topic],
                                    value: topic,
                                }))}
                            />
                        </Form.Item>
                    )}
                    <Form.Item label={"字体类型"}>
                        <Select
                            style={{width: "100%"}}
                            value={preference.fontFamily}
                            onChange={fontFamilySelectOnChange}
                            options={[
                                {value: "LXGWWenKai", label: "霞鹜文楷"},
                                {value: "LXGWWenKaiLight", label: "霞鹜文楷 Light"},
                                {value: "LXGWWenKaiTC", label: "霞鹜文楷 · 繁体"},
                                {value: "LXGWWenKaiTCLight", label: "霞鹜文楷 · 繁体 Light"},
                                {value: "LXGWZhenKai", label: "霞鹜臻楷"},
                                {value: "LXGWMarkerGothic", label: "霞鹜漫黑"},
                            ]}
                        />
                    </Form.Item>
                    <Form.Item label={"简洁模式"} extra={"开启后隐藏问候、天气、待办、倒数日和专注组件"}>
                        <Switch
                            checkedChildren="已开启"
                            unCheckedChildren="已关闭"
                            checked={preference.simpleMode}
                            onChange={simpleModeSwitchOnChange}
                            styles={{
                                root: {
                                    backgroundColor: preference.simpleMode ? theme.primaryColor : ""
                                },
                                content: {
                                    color: preference.simpleMode ? theme.primaryFontColor : ""
                                }
                            }}
                        />
                    </Form.Item>
                    <Form.Item label={"自定颜色"} extra={customThemeState ? "已启用自定义主题颜色" : undefined}>
                        <HoverButton theme={theme} icon={<BgColorsOutlined/>}
                                     onClick={() => setActiveModal("customTheme")}>
                            {"自定义插件主题颜色"}
                        </HoverButton>
                    </Form.Item>
                    <Divider style={{borderColor: props.theme.secondaryFontColor}}/>
                    <Form.Item label={"危险设置"} extra={"出现异常时可尝试重置设置或插件"}>
                        <Space>
                            <HoverButton theme={props.theme} icon={<RedoOutlined/>} onClick={resetPreferenceBtnOnClick}>
                                重置设置
                            </HoverButton>
                            <HoverButton theme={props.theme} icon={<RedoOutlined/>} onClick={clearStorageBtnOnClick}>
                                重置插件
                            </HoverButton>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* 自定颜色弹窗 */}
            <PublicModal
                theme={theme}
                open={activeModal === "customTheme"}
                titleText="自定义插件主题颜色"
                titleIcon={<BgColorsOutlined style={{color: theme.secondaryFontColor}}/>}
                onOk={customThemeOkBtnOnClick}
                onCancel={() => setActiveModal(null)}
            >
                <Form colon={false}>
                    <Form.Item label={"主要颜色"} extra={"影响背景颜色与按钮颜色"}>
                        <Space>
                            <ColorPicker value={customPrimaryColor}
                                         onChange={(_value: Color, hex: string) => setCustomPrimaryColor(hex)}
                                         showText disabledAlpha/>
                            <ColorPicker value={customSecondaryColor}
                                         onChange={(_value: Color, hex: string) => setCustomSecondaryColor(hex)}
                                         showText disabledAlpha/>
                        </Space>
                    </Form.Item>
                    <Form.Item label={"SVG颜色"} extra={"影响左上角太阳与底部波浪"}>
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

            <PublicModal
                theme={props.theme}
                open={activeModal === "resetPreference"}
                titleText={"确定重置设置？"}
                titleIcon={<RedoOutlined style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}/>}
                onOk={resetPreferenceOkBtnOnClick}
                onCancel={resetPreferenceCancelBtnOnClick}
            >
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {"将设置项重置为默认值"}
                </Text>
            </PublicModal>
            <PublicModal
                theme={props.theme}
                open={activeModal === "clearStorage"}
                titleText={"确定重置插件？"}
                titleIcon={<RedoOutlined style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}/>}
                onOk={clearStorageOkBtnOnClick}
                onCancel={clearStorageCancelBtnOnClick}
            >
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {"将设置项重置为默认值，并删除其他数据"}
                </Text>
            </PublicModal>
        </>
    );
}

export default React.memo(MenuPreferenceComponent);
