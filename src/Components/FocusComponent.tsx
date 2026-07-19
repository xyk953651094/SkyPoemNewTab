import React, {useEffect, useRef, useState} from "react";
import {
    Button,
    Col,
    message,
    Popover,
    Row,
    Select,
    Switch,
    Typography
} from "antd";
import {
    CustomerServiceFilled, CustomerServiceOutlined
} from "@ant-design/icons";
import {createThemedMessage} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import {getExtensionStorage, setExtensionStorage} from "../TypeScripts/StorageFunctions";
import focusSoundOne from "../Assets/FocusSounds/古镇雨滴.mp3";
import focusSoundTwo from "../Assets/FocusSounds/松树林小雪.mp3";
import focusSoundThree from "../Assets/FocusSounds/漓江水.mp3";
import focusSoundFour from "../Assets/FocusSounds/泉水水滴.mp3";
import "../StyleSheets/PublicStyles.scss";

const {Text} = Typography;

// 存储 key 常量
const STORAGE_KEY_FOCUS_MODE = "focusMode";
const STORAGE_KEY_FOCUS_SOUND = "focusSound";

interface FocusComponentProps {
    theme: ThemeInterface;
}

function FocusComponent(props: FocusComponentProps) {
    const [focusMode, setFocusMode] = useState<boolean>(false);
    const [focusSound, setFocusSound] = useState<string>("none");
    
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const themedMessage = createThemedMessage(props.theme, message);
    
    // 白噪音选项
    const SOUND_OPTIONS = [
        {value: "none", label: focusMode ? "静音" : "请先开启专注模式", src: ""},
        {value: "古镇雨滴", label: "声谷 - 古镇雨滴", src: focusSoundOne, disabled: !focusMode},
        {value: "松树林小雪", label: "声谷 - 松树林小雪", src: focusSoundTwo, disabled: !focusMode},
        {value: "漓江水", label: "声谷 - 漓江水", src: focusSoundThree, disabled: !focusMode},
        {value: "泉水水滴", label: "声谷 - 泉水水滴", src: focusSoundFour, disabled: !focusMode},
    ];
    
    // 获取音频 src
    function getSoundSrc(soundName: string): string {
        return SOUND_OPTIONS.find(opt => opt.value === soundName)?.src ?? "";
    }
    
    // 播放白噪音
    function playSound(soundName: string) {
        const src = getSoundSrc(soundName);
        if (!audioRef.current || !src) return;
        audioRef.current.src = src;
        audioRef.current.loop = true;
        audioRef.current.play().catch(() => {
        });
    }
    
    // 停止白噪音
    function stopSound() {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause();
        }
    }
    
    // 重置专注状态到 storage
    async function resetFocusStorage() {
        await setExtensionStorage(STORAGE_KEY_FOCUS_MODE, false);
    }
    
    // 专注模式开关
    async function focusModeSwitchOnChange(checked: boolean) {
        if (checked) {
            setFocusMode(true);
            await setExtensionStorage(STORAGE_KEY_FOCUS_MODE, true);
            themedMessage.success("已开启专注模式");
        } else {
            stopSound();
            setFocusMode(false);
            setFocusSound("none");
            await resetFocusStorage();
            themedMessage.info("已关闭专注模式");
        }
    }
    
    // 切换白噪音
    function focusSoundSelectOnChange(value: string) {
        setFocusSound(value);
        setExtensionStorage(STORAGE_KEY_FOCUS_SOUND, value);
        
        if (!focusMode) return;
        
        if (value === "none") {
            stopSound();
        } else {
            playSound(value);
        }
    }
    
    // 组件卸载时清理
    useEffect(() => {
        return () => {
            stopSound();
        };
    }, []);
    
    // 初始化：从 storage 恢复状态
    useEffect(() => {
        async function loadFromStorage() {
            const [storedMode] = await getExtensionStorage([STORAGE_KEY_FOCUS_MODE]);
            const isModeOn: boolean = storedMode ?? false;
            
            if (isModeOn) {
                setFocusMode(true);
            }
        }
        
        loadFromStorage();
    }, []);
    
    const popoverTitle = (
        <Row align={"middle"}>
            <Col span={8}>
                <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
                    {"专注模式"}
                </Text>
            </Col>
            <Col span={16} style={{textAlign: "right"}}>
                <Switch
                    checkedChildren="已开启"
                    unCheckedChildren="已关闭"
                    checked={focusMode}
                    onChange={focusModeSwitchOnChange}
                    styles={{
                        root: {
                            backgroundColor: focusMode ? props.theme.primaryColor : ""
                        },
                        content: {
                            color: focusMode ? props.theme.primaryFontColor : ""
                        }
                    }}
                />
            </Col>
        </Row>
    );
    
    const popoverContent = (
        <div>
            <Select
                value={focusSound}
                placeholder={"请选择白噪音"}
                onChange={focusSoundSelectOnChange}
                options={SOUND_OPTIONS}
                size={"large"}
                style={{width: "100%"}}
            />
            <audio ref={audioRef} style={{display: "none"}}/>
        </div>
    );
    
    return (
        <Popover
            title={popoverTitle}
            content={popoverContent}
            placement="bottomRight"
            color={props.theme.secondaryColor}
            styles={{root: {minWidth: "350px"}}}
        >
            <Button
                icon={focusMode ? <CustomerServiceFilled /> : <CustomerServiceOutlined />}
                // icon={<i className={focusMode ? "bi bi-cup-hot" : "bi bi-cup"} style={{display: "inline-flex"}}/>}
                size={"large"}
                type={"primary"}
                className={"floatingButton"}
                style={{
                    cursor: "default",
                    backgroundColor: props.theme.secondaryColor,
                    color: props.theme.secondaryFontColor,
                }}
            >
                {focusMode ? "专注中" : "未专注"}
            </Button>
        </Popover>
    );
}

export default React.memo(FocusComponent);
