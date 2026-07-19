export interface ThemeInterface {
    primaryColor: string;
    secondaryColor: string;
    primaryFontColor: string;
    secondaryFontColor: string;
    svgColors: string[];
}

// TODO
export interface PreferenceInterface {
    poemTopic: string,
    autoTopic: boolean,
    fontFamily: "cursive" | "sansSerif",
    fontVariant: "simplified" | "traditional"
}

export interface ExtensionDataInterface {
    preference: PreferenceInterface;
}