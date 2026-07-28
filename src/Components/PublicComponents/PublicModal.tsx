import React from "react";
import {Col, Modal, Row, Space, Typography} from "antd";
import {CheckOutlined, CloseOutlined} from "@ant-design/icons";
import {ThemeInterface} from "../../TypeScripts/PublicInterface";
import {HoverButton} from "./PublicButton";

const {Text} = Typography;

interface PublicModalProps {
    theme: ThemeInterface;
    open: boolean;
    titleText: string;
    titleIcon: React.ReactNode;
    onOk: () => void;
    onCancel: () => void;
    children: React.ReactNode;
}

export function PublicModal({theme, open, titleText, titleIcon, onOk, onCancel, children}: PublicModalProps) {
    return (
        <Modal
            title={
                <Row align={"middle"}>
                    <Col span={12}>
                        <Text style={{color: theme.secondaryFontColor, fontSize: "16px"}}>
                            {titleText}
                        </Text>
                    </Col>
                    <Col span={12} style={{textAlign: "right"}}>
                        {titleIcon}
                    </Col>
                </Row>
            }
            closeIcon={false}
            footer={[
                <Space>
                    <HoverButton theme={theme} icon={<CloseOutlined/>} onClick={onCancel}>
                        {"取消"}
                    </HoverButton>
                    <HoverButton theme={theme} icon={<CheckOutlined/>} onClick={onOk}>
                        {"确定"}
                    </HoverButton>
                </Space>
            ]}
            centered
            open={open}
            destroyOnHidden={true}
            styles={{
                mask: {backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)"},
                header: {color: theme.secondaryFontColor, backgroundColor: theme.secondaryColor},
                container: {backgroundColor: theme.secondaryColor}
            }}
        >
            {children}
        </Modal>
    );
}