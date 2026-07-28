import React, {useRef, useState} from "react";
import {Button, Col, Drawer, Row, Space, Tooltip, Typography} from "antd";
import {MenuFoldOutlined, StarOutlined, ToTopOutlined} from "@ant-design/icons";
import {deviceType} from "../TypeScripts/PublicConstants";
import MenuInfoComponent from "./MenuComponents/MenuInfoComponent";
import MenuContactComponent from "./MenuComponents/MenuContactComponent";
import MenuPreferenceComponent from "./MenuComponents/MenuPreferenceComponent";
import {PreferenceInterface, ThemeInterface} from "../TypeScripts/PublicInterface";
import {HoverButton} from "./PublicComponents/PublicButton";
import {getGreetInfo} from "../TypeScripts/GreetComponent";

const {Text} = Typography;
const { icon, greet } = getGreetInfo();
const drawerPosition = (deviceType === "iPhone" || deviceType === "Android") ? "bottom" : "right";

interface MenuComponentProps {
    theme: ThemeInterface;
    preference: PreferenceInterface;
    getPreference: React.Dispatch<React.SetStateAction<PreferenceInterface>>;
}

function MenuComponent(props: MenuComponentProps) {
    const [displayDrawer, setDisplayDrawer] = useState<boolean>(false);
    const drawerContentRef = useRef<HTMLDivElement>(null);
    
    const buttonStyle = {
        backgroundColor: props.theme.secondaryColor,
        color: props.theme.secondaryFontColor,
    };
    
    const tooltipTextStyle = {
        color: props.theme.secondaryFontColor,
    };
    
    const drawerStyles = {
        mask: {backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)"},
        header: {color: props.theme.secondaryFontColor, borderBottomColor: props.theme.secondaryFontColor},
        section: {backgroundColor: props.theme.secondaryColor},
        footer: {
            backgroundColor: props.theme.secondaryColor,
            borderTopColor: props.theme.secondaryFontColor,
            textAlign: "center" as const,
        },
    };
    
    function showDrawerBtnOnClick() {
        setDisplayDrawer(true);
    }
    
    function drawerOnClose() {
        setDisplayDrawer(false);
    }
    
    function scrollToTop() {
        drawerContentRef.current?.scrollIntoView({behavior: "smooth"});
    }
    
    return (
        <>
            <Tooltip title={<Text style={tooltipTextStyle}>{"菜单栏"}</Text>} placement={"bottomRight"} color={props.theme.secondaryColor}>
                <Button icon={<MenuFoldOutlined />} size={"large"} type={"primary"} className={"floatingButton"}
                        onClick={showDrawerBtnOnClick}
                        style={buttonStyle}
                />
            </Tooltip>
            <Drawer
                size={420}
                placement={drawerPosition}
                onClose={drawerOnClose}
                open={displayDrawer}
                closeIcon={false}
                styles={drawerStyles}
                title={
                    <Row align={"middle"}>
                        <Col span={6}>
                            <Text style={{color: props.theme.secondaryFontColor, fontSize: "16px"}}>{"菜单栏"}</Text>
                        </Col>
                        <Col span={18} style={{textAlign: "right"}}>
                            <HoverButton theme={props.theme} icon={<i className={icon}/>}>
                                {greet}
                            </HoverButton>
                        </Col>
                    </Row>
                }
                footer={
                    <HoverButton theme={props.theme} icon={<StarOutlined/>}>
                        {"如果喜欢这款插件，请考虑五星好评"}
                    </HoverButton>
                }
            >
                <Space orientation={"vertical"} size={"large"} ref={drawerContentRef}>
                    <MenuPreferenceComponent
                        theme={props.theme}
                        preference={props.preference}
                        getPreference={props.getPreference}/>
                    <MenuInfoComponent theme={props.theme}/>
                    <MenuContactComponent theme={props.theme}/>
                    <Row justify={"center"}>
                        <HoverButton theme={props.theme} icon={<ToTopOutlined/>} onClick={scrollToTop}>
                            {"回到顶部"}
                        </HoverButton>
                    </Row>
                </Space>
            </Drawer>
        </>
    );
}

export default React.memo(MenuComponent);