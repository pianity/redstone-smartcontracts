import { SortKeyCache, StateCacheKey, SortKeyCacheResult } from '../SortKeyCache';
import { CacheOptions, LoggerFactory } from '@warp';
import { Level } from 'level';
import { MemoryLevel } from 'memory-level';

export const DEFAULT_LEVEL_DB_LOCATION = './cache/warp';

/**
 * The LevelDB is a lexicographically sorted key-value database - so it's ideal for this use case
 * - as it simplifies cache look-ups (e.g. lastly stored value or value "lower-or-equal" than given sortKey).
 * The cache for contracts are implemented as sub-levels - https://www.npmjs.com/package/level#sublevel--dbsublevelname-options.
 *
 * The default location for the node.js cache is ./cache/warp.
 * The default name for the browser IndexedDB cache is warp-cache
 *
 * In order to reduce the cache size, the oldest entries are automatically pruned.
 */
export class LevelDbCache<V = any> implements SortKeyCache<V> {
  private readonly logger = LoggerFactory.INST.create('LevelDbCache');

  /**
   * not using the Level type, as it is not compatible with MemoryLevel (i.e. has more properties)
   * and there doesn't seem to be any public interface/abstract type for all Level implementations
   * (the AbstractLevel is not exported from the package...)
   */
  private db: MemoryLevel;

  constructor(cacheOptions: CacheOptions) {
    if (cacheOptions.inMemory) {
      this.db = new MemoryLevel({ valueEncoding: 'json' });
    } else {
      const dbLocation = cacheOptions.dbLocation || DEFAULT_LEVEL_DB_LOCATION;
      this.logger.info(`Using location ${dbLocation}`);
      this.db = new Level<string, any>(dbLocation, { valueEncoding: 'json' });
    }
  }

  async get(contractTxId: string, sortKey: string, returnDeepCopy?: boolean): Promise<SortKeyCacheResult<V> | null> {
    const contractCache = this.db.sublevel<string, any>(contractTxId, { valueEncoding: 'json' });

    try {
      const result = await contractCache.get(sortKey);

      return {
        sortKey: sortKey,
        cachedValue: result
      };
    } catch (e: any) {
      if (e.code == 'LEVEL_NOT_FOUND') {
        return null;
      } else {
        throw e;
      }
    }
  }

  async getLast(contractTxId: string): Promise<SortKeyCacheResult<V> | null> {
    const contractCache = this.db.sublevel<string, any>(contractTxId, { valueEncoding: 'json' });
    const keys = await contractCache.keys({ reverse: true, limit: 1 }).all();
    if (keys.length) {
      return {
        sortKey: keys[0],
        cachedValue: await contractCache.get(keys[0])
      };
    } else {
      return null;
    }
  }

  async getLessOrEqual(contractTxId: string, sortKey: string): Promise<SortKeyCacheResult<V> | null> {
    const contractCache = this.db.sublevel<string, any>(contractTxId, { valueEncoding: 'json' });
    const keys = await contractCache.keys({ reverse: true, lte: sortKey, limit: 1 }).all();
    if (keys.length) {
      return {
        sortKey: keys[0],
        cachedValue: await contractCache.get(keys[0])
      };
    } else {
      return null;
    }
  }

  async put(stateCacheKey: StateCacheKey, value: V): Promise<void> {
    const contractCache = this.db.sublevel<string, any>(stateCacheKey.contractTxId, { valueEncoding: 'json' });
    await contractCache.put(stateCacheKey.sortKey, value);
  }

  close(): Promise<void> {
    return this.db.close();
  }

  async dump(): Promise<any> {
    const result = await this.db.iterator().all();
    return result;
  }
}
