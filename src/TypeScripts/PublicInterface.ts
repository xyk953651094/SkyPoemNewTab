export interface ThemeInterface {
    primaryColor: string;
    secondaryColor: string;
    primaryFontColor: string;
    secondaryFontColor: string;
    svgColors: string[];
}

export interface PreferenceInterface {
    poemTopic: string,
    fontFamily: "cursive" | "sansSerif"
}

export interface ExtensionDataInterface {
    preference: PreferenceInterface;
}