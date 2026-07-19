import React from "react";
import {Button} from "antd";
import {changeButtonTheme} from "../../TypeScripts/PublicFunctions";
import {ThemeInterface} from "../../TypeScripts/PublicInterface";
import "../../StyleSheets/PublicStyles.scss"

interface HoverButtonProps {
    theme: ThemeInterface;
    icon?: React.ReactNode;
    children?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    target?: string;
}

export function HoverButton({theme, icon, children, onClick, href, target}: HoverButtonProps) {
    return (
        <Button type={"text"} size={"large"}
                icon={icon}
                style={{
                    color: theme.secondaryFontColor,
                    cursor: onClick || href ? "pointer" : "default"
                }}
                onClick={onClick}
                href={href}
                target={target}
                onMouseOver={(e) => changeButtonTheme(theme.primaryColor, theme.primaryFontColor, e)}
                onMouseOut={(e) => changeButtonTheme("transparent", theme.secondaryFontColor, e)}>
            {children}
        </Button>
    );
}

// 填充式悬停按钮：默认透明背景 + secondaryColor 文字，悬停后 secondaryColor 背景 + secondaryFontColor 文字
interface FillButtonProps extends HoverButtonProps {
    fontSize?: string;
}

export function FillButton({theme, icon, children, onClick, fontSize}: FillButtonProps) {
    return (
        <Button type={"text"} size={"large"}
                icon={icon}
                style={{
                    color: theme.secondaryColor,
                    fontSize: fontSize,
                    cursor: onClick ? "pointer" : "default"
                }}
                onClick={onClick}
                onMouseOver={(e) => changeButtonTheme(theme.secondaryColor, theme.secondaryFontColor, e)}
                onMouseOut={(e) => changeButtonTheme("transparent", theme.secondaryColor, e)}>
            {children}
        </Button>
    );
}