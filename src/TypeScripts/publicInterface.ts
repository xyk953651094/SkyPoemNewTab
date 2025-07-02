export interface PreferenceInterface {
    poemTopic: string,
    autoTopic: boolean,
    changePoemTime: string,
    buttonShape: "circle" | "default" | "round" | undefined,
    fontFamily: "cursive" | "sansSerif",
    fontVariant: "simplified" | "traditional"
}