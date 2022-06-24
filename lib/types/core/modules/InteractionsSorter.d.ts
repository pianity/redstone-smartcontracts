import { GQLEdgeInterface } from '../../index';
/**
 * this is probably self-explanatory ;-)
 */
export interface InteractionsSorter {
    sort(transactions: GQLEdgeInterface[]): Promise<GQLEdgeInterface[]>;
}
//# sourceMappingURL=InteractionsSorter.d.ts.map