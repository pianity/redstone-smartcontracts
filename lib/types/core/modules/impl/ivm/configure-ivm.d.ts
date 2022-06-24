import { Context, Reference } from 'isolated-vm';
import Arweave from 'arweave';
import { SmartWeaveGlobal } from '../../../../index';
export declare function configureSandbox(sandbox: Reference<Record<number | string | symbol, any>>, arweave: Arweave, swGlobal: SmartWeaveGlobal): void;
export declare function configureContext(context: Context): void;
//# sourceMappingURL=configure-ivm.d.ts.map