import React from "react";
import "../StyleSheets/PublicStyles.scss"
import "../StyleSheets/SunComponent.scss"
import {ThemeInterface} from "../TypeScripts/PublicInterface";

interface SunComponentProps {
    theme: ThemeInterface;
}

function SunComponent(props: SunComponentProps) {
    return (
        <div className="sunDiv zIndexLow">
            <svg className="sunSvg">
                <circle id="sunCircle3" className="svgAnimation" cx="0" cy="0" r="140" fill={props.theme.svgColors[2]}/>
                <circle id="sunCircle2" className="svgAnimation" cx="0" cy="0" r="130" fill={props.theme.svgColors[1]}/>
                <circle id="sunCircle1" className="svgAnimation" cx="0" cy="0" r="120" fill={props.theme.svgColors[0]}/>
            </svg>
        </div>
    );
}

export default React.memo(SunComponent);
