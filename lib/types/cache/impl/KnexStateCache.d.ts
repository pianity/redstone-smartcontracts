import { BlockHeightKey, MemBlockHeightWarpCache } from '../index';
import { Knex } from 'knex';
import { StateCache } from '../..';
/**
 * An implementation of {@link BlockHeightWarpCache} that stores its data (ie. contracts state)
 * in a Knex-compatible storage (PostgreSQL, CockroachDB, MSSQL, MySQL, MariaDB, SQLite3, Oracle, and Amazon Redshift)
 * https://knexjs.org
 */
export declare class KnexStateCache extends MemBlockHeightWarpCache<StateCache<any>> {
    private readonly knex;
    private readonly kLogger;
    private readonly lastFlushHeight;
    private isFlushing;
    private isDirty;
    private constructor();
    static init(knex: Knex, maxStoredInMemoryBlockHeights?: number): Promise<KnexStateCache>;
    private saveCache;
    put({ cacheKey, blockHeight }: BlockHeightKey, value: StateCache<any>): Promise<void>;
    flush(): Promise<void>;
}
//# sourceMappingURL=KnexStateCache.d.ts.map