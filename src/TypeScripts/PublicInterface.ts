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
    simpleMode: boolean;
    poemSource: "smart" | "preset",
    poemTopic: string,
    fontFamily: "LXGWWenKai" | "LXGWWenKaiLight" | "LXGWWenKaiTC" | "LXGWWenKaiTCLight" | "LXGWZhenKai" | "LXGWMarkerGothic",
    customTheme: CustomThemeInterface | null
}