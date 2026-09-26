import React, {useRef, useState} from "react";
import {
    Button,
    message,
    Popover,
    Select,
    Space,
    Typography
} from "antd";
import {
    CustomerServiceFilled, CustomerServiceOutlined
} from "@ant-design/icons";
import {createThemedMessage} from "../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../TypeScripts/PublicInterface";
import focusSoundOne from "../Assets/FocusSounds/古镇雨滴.mp3";
import focusSoundTwo from "../Assets/FocusSounds/松树林小雪.mp3";
import focusSoundThree from "../Assets/FocusSounds/漓江水.mp3";
import focusSoundFour from "../Assets/FocusSounds/泉水水滴.mp3";
import "../StyleSheets/PublicStyles.scss";

const {Text} = Typography;

interface FocusComponentProps {
    theme: ThemeInterface;
    fontFamily: string;
}

function FocusComponent(props: FocusComponentProps) {
    const [focusMode, setFocusMode] = useState<boolean>(false);
    const [focusSound, setFocusSound] = useState<string>("none");

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const themedMessage = createThemedMessage(props.theme, props.fontFamily, message);

    // 白噪音选项
    const SOUND_OPTIONS = [
        {value: "none", label: "静音", src: ""},
        {value: "古镇雨滴", label: "声谷 - 古镇雨滴", src: focusSoundOne},
        {value: "松树林小雪", label: "声谷 - 松树林小雪", src: focusSoundTwo},
        {value: "漓江水", label: "声谷 - 漓江水", src: focusSoundThree},
        {value: "泉水水滴", label: "声谷 - 泉水水滴", src: focusSoundFour},
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

    // 切换专注模式
    function toggleFocusMode() {
        if (focusMode) {
            stopSound();
            setFocusMode(false);
            setFocusSound("none");
            themedMessage.info("已关闭专注模式");
        } else {
            setFocusMode(true);
            themedMessage.success("已开启专注模式");
        }
    }

    // 切换白噪音
    function focusSoundSelectOnChange(value: string) {
        setFocusSound(value);

        if (value === "none") {
            stopSound();
            if (focusMode) {
                setFocusMode(false);
                themedMessage.info("已关闭专注模式");
            }
        } else {
            if (!focusMode) {
                setFocusMode(true);
                themedMessage.success("已开启专注模式");
            }
            playSound(value);
        }
    }

    const popoverTitle = (
        <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>
            {"专注模式"}
        </Text>
    );

    const popoverContent = (
        <Space orientation="vertical">
            <Select
                value={focusSound}
                placeholder={"请选择白噪音"}
                onChange={focusSoundSelectOnChange}
                options={SOUND_OPTIONS}
                size={"large"}
                style={{width: "100%"}}
            />
            <Text style={{color: props.theme.secondaryFontColor}}>
                注意：关闭或跳转标签页时音乐将自动停止
            </Text>
            <audio ref={audioRef} style={{display: "none"}}/>
        </Space>
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
                size={"large"}
                type={"primary"}
                className={"floatingButton"}
                onClick={toggleFocusMode}
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
