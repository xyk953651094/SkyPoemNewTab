/// <reference types="chrome" />
/// <reference types="firefox-webext-browser" />

import {defaultPreference, browserType} from "./PublicConstants";
import {PreferenceInterface} from "./PublicInterface";

// 统一存储接口
interface StorageAdapter {
    get(keys: string[]): Promise<Record<string, any>>;
    set(key: string, value: any): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}

// 获取当前浏览器对应的存储 API
// Chrome / Edge 用 chrome 命名空间，Firefox / Safari 用 browser 命名空间
function getExtensionAPI(): typeof chrome {
    if (["Firefox", "Safari"].includes(browserType)) {
        return (browser as unknown) as typeof chrome;
    }
    return chrome;
}

// 浏览器插件实现（生产环境）
const extensionStorageAdapter: StorageAdapter = {
    async get(keys) {
        return await getExtensionAPI().storage.local.get(keys);
    },
    async set(key, value) {
        await getExtensionAPI().storage.local.set({[key]: value});
    },
    async remove(key) {
        await getExtensionAPI().storage.local.remove(key);
    },
    async clear() {
        await getExtensionAPI().storage.local.clear();
    },
};

// localStorage 实现（开发调试用）
const localStorageAdapter: StorageAdapter = {
    async get(keys) {
        const result: Record<string, any> = {};
        for (const key of keys) {
            const raw = localStorage.getItem(key);
            if (raw !== null) {
                try {
                    result[key] = JSON.parse(raw);
                } catch {
                    result[key] = raw;
                }
            }
        }
        return result;
    },
    async set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    async remove(key) {
        localStorage.removeItem(key);
    },
    async clear() {
        localStorage.clear();
    },
};

// 根据环境自动选定适配器
const isProduction = process.env.NODE_ENV === "production";
const storage: StorageAdapter = isProduction
    ? extensionStorageAdapter
    : localStorageAdapter;

export async function getExtensionStorage(keys: string[]): Promise<any[]> {
    try {
        const result = await storage.get(keys);
        return keys.map(key => result[key]);
    } catch (error) {
        console.error("Error reading from storage:", error);
        return [];
    }
}

export async function setExtensionStorage(key: string, value: any) {
    try {
        await storage.set(key, value);
    } catch (error) {
        console.error("Error writing to storage:", error);
    }
}

export async function removeExtensionStorage(key: string) {
    try {
        await storage.remove(key);
    } catch (error) {
        console.error("Error removing from storage:", error);
    }
}

export async function clearExtensionStorage() {
    try {
        await storage.clear();
    } catch (error) {
        console.error("Error clearing storage:", error);
    }
}

// 修补设置数据
export function fixPreference(preference: PreferenceInterface): PreferenceInterface {
    let isFixed = false;

    for (const [key, defaultValue] of Object.entries(defaultPreference)) {
        if ((preference as any)[key] === undefined || (preference as any)[key] === null) {
            (preference as any)[key] = defaultValue;
            isFixed = true;
        }
    }

    if (isFixed) {
        setExtensionStorage("preference", preference);
    }

    return preference;
}