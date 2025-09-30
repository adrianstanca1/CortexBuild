export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
    clear(): void;
    key(index: number): string | null;
    readonly length: number;
}

const createMemoryStorage = (): StorageLike => {
    const store = new Map<string, string>();
    return {
        getItem(key: string) {
            return store.has(key) ? store.get(key)! : null;
        },
        setItem(key: string, value: string) {
            store.set(key, String(value));
        },
        removeItem(key: string) {
            store.delete(key);
        },
        clear() {
            store.clear();
        },
        key(index: number) {
            return Array.from(store.keys())[index] ?? null;
        },
        get length() {
            return store.size;
        },
    };
};

let cachedStorage: StorageLike | null = null;

export const getStorage = (): StorageLike => {
    if (cachedStorage) {
        return cachedStorage;
    }

    try {
        const globalScope = globalThis as unknown as { localStorage?: StorageLike };
        if (globalScope && globalScope.localStorage) {
            const testKey = '__asagents_storage_test__';
            globalScope.localStorage.setItem(testKey, '1');
            globalScope.localStorage.removeItem(testKey);
            cachedStorage = globalScope.localStorage;
            return cachedStorage;
        }
    } catch (error) {
        console.warn('Falling back to in-memory storage adapter.', error);
    }

    cachedStorage = createMemoryStorage();
    return cachedStorage;
};

export const resetInMemoryStorage = () => {
    if (!cachedStorage) {
        return;
    }

    const globalScope = globalThis as unknown as { localStorage?: StorageLike };
    if (globalScope.localStorage && cachedStorage === globalScope.localStorage) {
        return; // do not clear the real browser storage implicitly
    }

    cachedStorage.clear();
};
