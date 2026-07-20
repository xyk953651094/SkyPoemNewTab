import React from "react";
import "../StyleSheets/PublicStyles.scss"
import "../StyleSheets/WaveComponent.scss"
import {ThemeInterface} from "../TypeScripts/PublicInterface";

interface WaveComponentProps {
    theme: ThemeInterface;
}

function WaveComponent(props: WaveComponentProps) {
    return (
        <div className="waveDiv zIndexLow">
            <svg className="waveSvg" viewBox="0 24 150 24" preserveAspectRatio="none">
                <defs>
                    <path id="wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"/>
                </defs>
                <g>
                    <use className="wave" xlinkHref="#wave" fill={props.theme.svgColors[0]} x="50" y="0"></use>
                    <use className="wave" xlinkHref="#wave" fill={props.theme.svgColors[1]} x="50" y="2"></use>
                    <use className="wave" xlinkHref="#wave" fill={props.theme.svgColors[2]} x="50" y="4"></use>
                </g>
            </svg>
        </div>
    );
}

export default React.memo(WaveComponent);
