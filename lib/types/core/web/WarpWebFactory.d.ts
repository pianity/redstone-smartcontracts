import Arweave from 'arweave';
import { ConfirmationStatus, Warp, WarpBuilder } from '../index';
/**
 * A factory that simplifies the process of creating different versions of {@link Warp}.
 * All versions use the {@link Evolve} plugin.
 * Warp instances created by this factory can be safely used in a web environment.
 */
export declare class WarpWebFactory {
    /**
     * Returns a fully configured {@link Warp} that is using mem cache for all layers.
     */
    static memCached(arweave: Arweave, maxStoredBlockHeights?: number): Warp;
    /**
     * Returns a preconfigured, memCached {@link WarpBuilder}, that allows for customization of the Warp instance.
     * Use {@link WarpBuilder.build()} to finish the configuration.
     */
    static memCachedBased(arweave: Arweave, maxStoredBlockHeights?: number, confirmationStatus?: ConfirmationStatus): WarpBuilder;
}
//# sourceMappingURL=WarpWebFactory.d.ts.map