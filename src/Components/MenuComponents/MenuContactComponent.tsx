import React from "react";
import {Card, Col, Row} from "antd";
import {DislikeOutlined, GithubOutlined, GitlabOutlined, LikeOutlined, MailOutlined} from "@ant-design/icons";
import {ThemeInterface} from "../../TypeScripts/PublicInterface";
import {HoverButton} from "../PublicComponents/PublicButton";

interface MenuContactComponentProps {
    theme: ThemeInterface;
}

interface ContactLink {
    icon: React.ReactNode;
    href: string;
    label: string;
}

const contactLinks: ContactLink[] = [
    {icon: <GithubOutlined/>, href: "https://github.com/xyk953651094/", label: "作者主页"},
    {icon: <GitlabOutlined/>, href: "https://gitlab.com/xyk953651094/", label: "作者主页"},
    {icon: <GithubOutlined/>, href: "https://github.com/xyk953651094?tab=repositories", label: "更多产品"},
    {icon: <GitlabOutlined/>, href: "https://gitlab.com/users/xyk953651094/projects/", label: "更多产品"},
    {icon: <LikeOutlined/>, href: "mailto:xyk953651094@qq.com?&subject=云开新标签页-功能建议&body=温馨提示：建议前烦请优先查阅帮助文档", label: "功能建议"},
    {icon: <DislikeOutlined/>, href: "mailto:xyk953651094@qq.com?&subject=云开新标签页-问题反馈&body=温馨提示：反馈前烦请优先查阅帮助文档", label: "问题反馈"},
];

function MenuContactComponent(props: MenuContactComponentProps) {
    return (
        <Card title={"联系作者"} extra={<MailOutlined />}
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
              }}
        >
            <Row gutter={[0, 8]}>
                {contactLinks.map((link, index) => (
                    <Col span={12} style={{textAlign: "center"}} key={index}>
                        <HoverButton theme={props.theme} icon={link.icon} href={link.href}>
                            {link.label}
                        </HoverButton>
                    </Col>
                ))}
            </Row>
        </Card>
    );
}

export default React.memo(MenuContactComponent);