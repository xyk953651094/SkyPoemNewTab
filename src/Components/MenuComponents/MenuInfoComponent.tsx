import React from "react";
import {Card, Form, Space} from "antd";
import {GithubOutlined, GitlabOutlined, InfoCircleOutlined} from "@ant-design/icons";
import {ThemeInterface} from "../../TypeScripts/PublicInterface";
import {HoverButton} from "../PublicComponents/PublicButton";

const version = require("../../../package.json").version;

interface LinkButton {
    icon: React.ReactNode;
    href: string;
    target?: string;
    text: string;
}

interface LinkItem {
    label: string;
    buttons: LinkButton[];
}

const links: LinkItem[] = [
    {
        label: "插件主页",
        buttons: [
            {icon: <GithubOutlined/>, href: "https://github.com/xyk953651094/SkyPoemNewTab/", target: "_blank", text: "Github"},
            {icon: <GitlabOutlined/>, href: "https://gitlab.com/xyk953651094/SkyPoemNewTab/", target: "_blank", text: "Gitlab"},
        ],
    },
    {
        label: "作者主页",
        buttons: [
            {icon: <GithubOutlined/>, href: "https://github.com/xyk953651094/", target: "_blank", text: "Github"},
            {icon: <GitlabOutlined/>, href: "https://gitlab.com/xyk953651094/", target: "_blank", text: "Gitlab"},
        ],
    },
];

interface MenuInfoComponentProps {
    theme: ThemeInterface;
}

function MenuInfoComponent(props: MenuInfoComponentProps) {
    const {theme} = props;
    
    return (
        <Card title={"关于云开诗词新标签页（ V" + version + " ）"} extra={<InfoCircleOutlined />}
              styles={{
                  root: {
                      backgroundColor: props.theme.secondaryColor,
                      borderColor: props.theme.secondaryFontColor,
                  },
                  header: {
                      color: props.theme.secondaryFontColor,
                      borderColor: props.theme.secondaryFontColor,
                  },
                  extra: {color: props.theme.secondaryFontColor}
              }}>
            <Form layout="vertical"
                  styles={{
                      label: {color: theme.secondaryFontColor}
                  }}>
                {links.map((link) => (
                    <Form.Item key={link.label} label={link.label}>
                        <Space>
                            {link.buttons.map((button, index) => (
                                <HoverButton key={index} theme={theme} icon={button.icon} href={button.href} target={button.target}>
                                    {button.text}
                                </HoverButton>
                            ))}
                        </Space>
                    </Form.Item>
                ))}
            </Form>
        </Card>
    );
}

export default React.memo(MenuInfoComponent);