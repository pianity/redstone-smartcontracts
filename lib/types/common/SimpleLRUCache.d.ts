export declare class SimpleLRUCache<K, V> {
    private readonly cache;
    private readonly capacity;
    constructor(capacity: number);
    has(key: K): boolean;
    size(): number;
    get(key: K): V;
    set(key: K, value: V): void;
    keys(): K[];
}
//# sourceMappingURL=SimpleLRUCache.d.ts.map