import React from "react";
import {Card, Col, Row} from "antd";
import {GithubOutlined, GitlabOutlined, InfoCircleOutlined} from "@ant-design/icons";
import {ThemeInterface} from "../../TypeScripts/PublicInterface";
import {HoverButton} from "../PublicComponents/PublicButton";

const version = require("../../../package.json").version;

interface LinkItem {
    label: string;
    github: string;
    gitlab: string;
}

const links: LinkItem[] = [
    {
        label: "产品主页",
        github: "https://github.com/xyk953651094/SkyImageNewTab/",
        gitlab: "https://gitlab.com/xyk953651094/SkyImageNewTab/",
    },
    {
        label: "更新日志",
        github: "https://github.com/xyk953651094/SkyImageNewTab/releases/",
        gitlab: "https://gitlab.com/xyk953651094/SkyImageNewTab/-/releases/",
    },
    {
        label: "帮助文档",
        github: "https://xyk953651094.github.io/SkyDocuments/",
        gitlab: "https://xyk953651094.gitlab.io/SkyDocuments/",
    },
];

interface MenuInfoComponentProps {
    theme: ThemeInterface;
}

function MenuInfoComponent(props: MenuInfoComponentProps) {
    const {theme} = props;
    
    return (
        <Card title={"产品信息（ V" + version + " ）"} extra={<InfoCircleOutlined />}
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
            <Row gutter={[0, 8]}>
                {links.map((link) => (
                    <React.Fragment key={link.label}>
                        <Col span={12} style={{textAlign: "center"}}>
                            <HoverButton theme={theme} icon={<GithubOutlined/>} href={link.github} target={"_self"}>
                                {link.label}
                            </HoverButton>
                        </Col>
                        <Col span={12} style={{textAlign: "center"}}>
                            <HoverButton theme={theme} icon={<GitlabOutlined/>} href={link.gitlab} target={"_self"}>
                                {link.label}
                            </HoverButton>
                        </Col>
                    </React.Fragment>
                ))}
            </Row>
        </Card>
    );
}

export default React.memo(MenuInfoComponent);