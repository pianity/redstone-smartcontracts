import Arweave from 'arweave';
import { ConfirmationStatus, DefinitionLoader, ExecutorFactory, HandlerApi, InteractionsLoader, InteractionsSorter, Warp, SourceType, StateEvaluator } from '../index';
export declare const R_GW_URL = "https://d1o5nlqr4okus2.cloudfront.net";
export declare class WarpBuilder {
    private readonly _arweave;
    private _definitionLoader?;
    private _interactionsLoader?;
    private _interactionsSorter?;
    private _executorFactory?;
    private _stateEvaluator?;
    private _useWarpGwInfo;
    constructor(_arweave: Arweave);
    setDefinitionLoader(value: DefinitionLoader): WarpBuilder;
    setInteractionsLoader(value: InteractionsLoader): WarpBuilder;
    setCacheableInteractionsLoader(value: InteractionsLoader, maxStoredInMemoryBlockHeights?: number): WarpBuilder;
    setInteractionsSorter(value: InteractionsSorter): WarpBuilder;
    setExecutorFactory(value: ExecutorFactory<HandlerApi<unknown>>): WarpBuilder;
    setStateEvaluator(value: StateEvaluator): WarpBuilder;
    overwriteSource(sourceCode: {
        [key: string]: string;
    }): Warp;
    useWarpGateway(confirmationStatus?: ConfirmationStatus, source?: SourceType, address?: string): WarpBuilder;
    useArweaveGateway(): WarpBuilder;
    useWarpGwInfo(): WarpBuilder;
    build(): Warp;
}
//# sourceMappingURL=WarpBuilder.d.ts.map