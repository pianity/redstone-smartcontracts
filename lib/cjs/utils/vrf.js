"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMockVrf = void 0;
const elliptic_1 = __importDefault(require("elliptic"));
const vrf_js_1 = require("@idena/vrf-js");
const utils_1 = require("./utils");
const EC = new elliptic_1.default.ec('secp256k1');
const key = EC.genKeyPair();
const pubKeyS = key.getPublic(true, 'hex');
function generateMockVrf(sortKey, arweave) {
    const data = arweave.utils.stringToBuffer(sortKey);
    const [index, proof] = (0, vrf_js_1.Evaluate)(key.getPrivate().toArray(), data);
    return {
        index: arweave.utils.bufferTob64Url(index),
        proof: arweave.utils.bufferTob64Url(proof),
        bigint: (0, utils_1.bufToBn)(index).toString(),
        pubkey: pubKeyS
    };
}
exports.generateMockVrf = generateMockVrf;
//# sourceMappingURL=vrf.js.map