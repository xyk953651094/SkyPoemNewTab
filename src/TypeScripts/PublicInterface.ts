export interface ThemeInterface {
    primaryColor: string;
    secondaryColor: string;
    primaryFontColor: string;
    secondaryFontColor: string;
    svgColors: string[];
}

export interface CustomThemeInterface {
    primaryColor: string;
    secondaryColor: string;
    svgColors: string[];
}

export interface PreferenceInterface {
    poemSource: "smart" | "preset",
    poemTopic: string,
    fontFamily: "cursive" | "sans-serif",
    customTheme: CustomThemeInterface | null
}

export interface ExtensionDataInterface {
    preference: PreferenceInterface;
}