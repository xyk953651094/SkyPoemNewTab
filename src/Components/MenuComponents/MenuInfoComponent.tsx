import React from "react";
import {Card, Form, Space} from "antd";
import {DislikeOutlined, GithubOutlined, GitlabOutlined, InfoCircleOutlined, LikeOutlined} from "@ant-design/icons";
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
        label: "帮助文档",
        buttons: [
            {icon: <GithubOutlined/>, href: "https://xyk953651094.github.io/SkyDocuments/", target: "_blank", text: "Github"},
            {icon: <GitlabOutlined/>, href: "https://xyk953651094.gitlab.io/SkyDocuments/", target: "_blank", text: "Gitlab"},
        ],
    },
    {
        label: "建议反馈",
        buttons: [
            {icon: <LikeOutlined/>, href: "mailto:xyk953651094@qq.com?&subject=云开诗词新标签页-功能建议", text: "功能建议"},
            {icon: <DislikeOutlined/>, href: "mailto:xyk953651094@qq.com?&subject=云开诗词新标签页-问题反馈", text: "问题反馈"},
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