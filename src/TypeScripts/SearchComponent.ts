interface SearchEngineInfo {
    searchEngineName: string;
    searchEngineUrl: string;
}

const searchEngineMap: Record<string, SearchEngineInfo> = {
    bing: {
        searchEngineName: "必应",
        searchEngineUrl: "https://www.bing.com/search?q=",
    },
    google: {
        searchEngineName: "谷歌",
        searchEngineUrl: "https://www.google.com/search?q=",
    },
};

export function getSearchEngineDetail(searchEngine: string): SearchEngineInfo {
    return searchEngineMap[searchEngine] || searchEngineMap.bing;
}