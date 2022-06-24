"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandlerExecutorFactory = void 0;
const _warp_1 = require("../../../index");
const JsHandlerApi_1 = require("./handler/JsHandlerApi");
const loader_1 = __importDefault(require("@assemblyscript/loader"));
const WasmHandlerApi_1 = require("./handler/WasmHandlerApi");
const as_wasm_imports_1 = require("./wasm/as-wasm-imports");
const rust_wasm_imports_1 = require("./wasm/rust-wasm-imports");
const go_wasm_imports_1 = require("./wasm/go-wasm-imports");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const isolated_vm_1 = require("isolated-vm");
const configure_ivm_1 = require("./ivm/configure-ivm");
const IvmHandlerApi_1 = require("./handler/IvmHandlerApi");
/**
 * A factory that produces handlers that are compatible with the "current" style of
 * writing SW contracts (i.e. using "handle" function).
 */
class HandlerExecutorFactory {
    constructor(arweave) {
        this.arweave = arweave;
        this.logger = _warp_1.LoggerFactory.INST.create('HandlerExecutorFactory');
        // TODO: cache compiled wasm binaries here.
        this.cache = new _warp_1.MemCache();
    }
    async create(contractDefinition, evaluationOptions) {
        const swGlobal = new _warp_1.SmartWeaveGlobal(this.arweave, {
            id: contractDefinition.txId,
            owner: contractDefinition.owner
        }, evaluationOptions);
        if (contractDefinition.contractType == 'wasm') {
            this.logger.info('Creating handler for wasm contract', contractDefinition.txId);
            const benchmark = _warp_1.Benchmark.measure();
            let wasmInstance;
            let jsExports = null;
            const wasmResponse = generateResponse(contractDefinition.srcBinary);
            switch (contractDefinition.srcWasmLang) {
                case 'assemblyscript': {
                    const wasmInstanceExports = {
                        exports: null
                    };
                    wasmInstance = await loader_1.default.instantiateStreaming(wasmResponse, (0, as_wasm_imports_1.asWasmImports)(swGlobal, wasmInstanceExports));
                    // note: well, exports are required by some imports
                    // - e.g. those that use wasmModule.exports.__newString underneath (like Block.indep_hash)
                    wasmInstanceExports.exports = wasmInstance.exports;
                    break;
                }
                case 'rust': {
                    const wasmInstanceExports = {
                        exports: null,
                        modifiedExports: {
                            wasm_bindgen__convert__closures__invoke2_mut__: null,
                            _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__: null
                        }
                    };
                    /**
                     * wasm-bindgen mangles import function names (adds some random number after "base name")
                     * - that's why we cannot statically build the imports in the SDK.
                     * Instead - we need to first compile the module and check the generated
                     * import function names (all imports from the "__wbindgen_placeholder__" import module).
                     * Having those generated function names - we need to then map them to import functions -
                     * see {@link rustWasmImports}
                     *
                     * That's probably a temporary solution - it would be the best to force the wasm-bindgen
                     * to NOT mangle the import function names - unfortunately that is not currently possible
                     * - https://github.com/rustwasm/wasm-bindgen/issues/1128
                     */
                    const wasmModule = await getWasmModule(wasmResponse, contractDefinition.srcBinary);
                    const moduleImports = WebAssembly.Module.imports(wasmModule);
                    const wbindgenImports = moduleImports
                        .filter((imp) => {
                        return imp.module === '__wbindgen_placeholder__';
                    })
                        .map((imp) => imp.name);
                    const { imports, exports } = (0, rust_wasm_imports_1.rustWasmImports)(swGlobal, wbindgenImports, wasmInstanceExports, contractDefinition.metadata.dtor);
                    jsExports = exports;
                    wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
                    wasmInstanceExports.exports = wasmInstance.exports;
                    const moduleExports = Object.keys(wasmInstance.exports);
                    // ... no comments ...
                    moduleExports.forEach((moduleExport) => {
                        if (moduleExport.startsWith('wasm_bindgen__convert__closures__invoke2_mut__')) {
                            wasmInstanceExports.modifiedExports.wasm_bindgen__convert__closures__invoke2_mut__ =
                                wasmInstance.exports[moduleExport];
                        }
                        if (moduleExport.startsWith('_dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__')) {
                            wasmInstanceExports.modifiedExports._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ =
                                wasmInstance.exports[moduleExport];
                        }
                    });
                    break;
                }
                case 'go': {
                    const go = new go_wasm_imports_1.Go(swGlobal);
                    go.importObject.metering = {
                        usegas: function (value) {
                            swGlobal.useGas(value);
                        }
                    };
                    const wasmModule = await getWasmModule(wasmResponse, contractDefinition.srcBinary);
                    wasmInstance = await WebAssembly.instantiate(wasmModule, go.importObject);
                    // nope - DO NOT await here!
                    go.run(wasmInstance);
                    jsExports = go.exports;
                    break;
                }
                default: {
                    throw new Error(`Support for ${contractDefinition.srcWasmLang} not implemented yet.`);
                }
            }
            this.logger.info(`WASM ${contractDefinition.srcWasmLang} handler created in ${benchmark.elapsed()}`);
            return new WasmHandlerApi_1.WasmHandlerApi(swGlobal, contractDefinition, jsExports || wasmInstance.exports);
        }
        else {
            this.logger.info('Creating handler for js contract', contractDefinition.txId);
            const normalizedSource = (0, _warp_1.normalizeContractSource)(contractDefinition.src, evaluationOptions.useIVM);
            if (!evaluationOptions.allowUnsafeClient) {
                if (normalizedSource.includes('SmartWeave.unsafeClient')) {
                    throw new Error('Using unsafeClient is not allowed by default. Use EvaluationOptions.allowUnsafeClient flag.');
                }
            }
            if (evaluationOptions.useIVM) {
                const isolate = new isolated_vm_1.Isolate({
                    memoryLimit: evaluationOptions.ivm.memoryLimit
                });
                const context = isolate.createContextSync();
                const sandbox = context.global;
                (0, configure_ivm_1.configureSandbox)(sandbox, this.arweave, swGlobal);
                (0, configure_ivm_1.configureContext)(context);
                const contract = context.evalSync(normalizedSource, { reference: true });
                return new IvmHandlerApi_1.IvmHandlerApi(swGlobal, contractDefinition, { isolate, context, sandbox, contract });
            }
            else {
                const contractFunction = new Function(normalizedSource);
                const handler = contractFunction(swGlobal, bignumber_js_1.default, _warp_1.LoggerFactory.INST.create(swGlobal.contract.id));
                return new JsHandlerApi_1.JsHandlerApi(swGlobal, contractDefinition, handler);
            }
        }
    }
}
exports.HandlerExecutorFactory = HandlerExecutorFactory;
function generateResponse(wasmBinary) {
    const init = { status: 200, statusText: 'OK', headers: { 'Content-Type': 'application/wasm' } };
    return new Response(wasmBinary, init);
}
async function getWasmModule(wasmResponse, binary) {
    if (WebAssembly.compileStreaming) {
        return await WebAssembly.compileStreaming(wasmResponse);
    }
    else {
        return await WebAssembly.compile(binary);
    }
}
//# sourceMappingURL=HandlerExecutorFactory.js.map