import {ExtensionDataInterface, PreferenceInterface} from './PublicInterface';
import {getBrowserType, getDeviceType} from "./PublicFunctions";

// 常用变量
export const deviceType = getDeviceType();  // 获取当前设备类型
export const browserType = getBrowserType();
export const colorRegExp = /^#[0-9A-Fa-f]{6}$/;
export const poemSwitchingInterval = 3600000;  // 图片切换间隔默认一小时 3600000
export const environment = process.env.NODE_ENV ?? "development";

export const defaultPreference: PreferenceInterface = {
    poemTopic: "all",
    fontFamily: "cursive",
    customTheme: null
}

// TODO:如果后续不再增加别的功能，例如数据导入导出、待办、倒数日之类的，这个常量可以删除。
export const defaultExtensionData: ExtensionDataInterface = {
    preference: defaultPreference
}

export const defaultTheme = {
    primaryColor: '#A29192',
    secondaryColor: '#444C5E',
    svgColors: ['#918087', '#7D707D', '#656173']
};

// 诗词主题
export const poemTopics = [
    "all", "shuqing", "siji", "shanshui", "tianqi", "renwu", "rensheng", "shenghuo", "jieri", "dongwu", "zhiwu", "shiwu"
];

// 主题颜色
export const lightThemeArray: ({ primaryColor: string; secondaryColor: string; svgColors: string[]; }[]) = [
    {
        'primaryColor': '#A29192', 'secondaryColor': '#444C5E',
        'svgColors': ['#918087', '#7D707D', '#656173']
    },
    {
        'primaryColor': '#AFDDE0', 'secondaryColor': '#565F9A',
        'svgColors': ['#94C3D7', '#89A6C9', '#8B87B2']
    },
    {
        'primaryColor': '#B0B298', 'secondaryColor': '#475C4E',
        'svgColors': ['#8C9E89', '#6B8A7D', '#507473']
    },
    // 一般（primaryColor有点亮了，其它都挺好）
    {
        'primaryColor': '#C9DD22', 'secondaryColor': '#2F2F35',
        'svgColors': ['#66C958', '#00AD7C', '#008C89']
    },
    {
        'primaryColor': '#CCD0CF', 'secondaryColor': '#06141B',
        'svgColors': ['#11212D', '#253745', '#4A5C6A']
    },
    {
        'primaryColor': '#D1B894', 'secondaryColor': '#804145',
        'svgColors': ['#A0A681', '#739178', '#4F7A72']
    },
    {
        'primaryColor': '#D6D6D4', 'secondaryColor': '#2F4644',
        'svgColors': ['#9EB6B3', '#808E8C', '#46746F']
    },
    {
        'primaryColor': '#E2E1E4', 'secondaryColor': '#74759B',
        'svgColors': ['#C3C6CE', '#9FACB7', '#7A959D']
    },
    {
        'primaryColor': '#EEF7F2', 'secondaryColor': '#114E7A',
        'svgColors': ['#C3D2CE', '#99AEAE', '#728B90']
    },
    {
        'primaryColor': '#EFDFDF', 'secondaryColor': '#795A5F',
        'svgColors': ['#CEBCC2', '#AA9CA8', '#827E8F']
    },
    {
        'primaryColor': '#F2E6CE', 'secondaryColor': '#6E8B74',
        'svgColors': ['#C0C7AF', '#90A897', '#668883']
    },
    {
        'primaryColor': '#F2EBD9', 'secondaryColor': '#66363C',
        'svgColors': ['#C3CAB7', '#94AA9C', '#6A8985']
    },
    {
        'primaryColor': '#F6DCCE', 'secondaryColor': '#815C94',
        'svgColors': ['#D8B8B7', '#B397A3', '#897B8F']
    },
    {
        'primaryColor': '#F7CBCA', 'secondaryColor': '#5D6B6B',
        'svgColors': ['#DEE7E8', '#DFD9D6', '#C8DBDE']
    },
    {
        'primaryColor': '#FADCD5', 'secondaryColor': '#765D67',
        'svgColors': ['#6D3C52', '#4B2138', '#2D222F']
    },
    {
        'primaryColor': '#FBE4DB', 'secondaryColor': '#190019',
        'svgColors': ['#DFB6B2', '#554F6C', '#522B5B']
    },
];

export const darkThemeArray: ({ primaryColor: string; secondaryColor: string; svgColors: string[]; }[]) = [
    {
        'primaryColor': '#114E7A', 'secondaryColor': '#EEF7F2',
        'svgColors': ['#00C298', '#009DA5', '#00759B',]
    },
    {
        'primaryColor': '#1A4D80', 'secondaryColor': '#FEFCF6',
        'svgColors': ['#E6C380', '#67A1C4', '#3070A4']
    },
    {
        'primaryColor': '#2F2F35', 'secondaryColor': '#C9DD22',
        'svgColors': ['#E18575', '#A56477', '#614B61',]
    },
    {
        'primaryColor': '#2F4644', 'secondaryColor': '#D6D6D4',
        'svgColors': ['#9EB6B3', '#808E8C', '#46746F']
    },
    {
        'primaryColor': '#66363C', 'secondaryColor': '#F2EBD9',
        'svgColors': ['#DC9A55', '#BC7350', '#935149']
    },
    {
        'primaryColor': '#815C94', 'secondaryColor': '#F6DCCE',
        'svgColors': ['#FF9C75', '#EF7A89', '#BE6796']
    },
    {
        'primaryColor': '#9B9690', 'secondaryColor': '#0D0831',
        'svgColors': ['#526964', '#3C595F', '#2F4858',]
    },
];

// 中国窗体
export const chinaWindow = [
    "icon-chuangge1",
    "icon-chuangge3",
    "icon-chuangge4",
    "icon-chuangge5",
    "icon-chuangge7",
    "icon-chuangge9",
    "icon-chuangge10",
    "icon-chuangge11",
    "icon-chuangge12",
    "icon-chuangge13",
    "icon-chuangge14",
    "icon-chuangge15",
    "icon-chuangge16",
]

// 中国窗体
export const chinaObject = [
    "icon-chaye",
    "icon-huaping",
    "icon-huaping1",
    "icon-meihua",
    "icon-facaishu",
    "icon-chuxiye",
]
