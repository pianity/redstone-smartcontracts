import { HandlerBasedContract } from './index';
export class PstContractImpl extends HandlerBasedContract {
    async currentBalance(target) {
        const interactionResult = await this.viewState({ function: 'balance', target });
        if (interactionResult.type !== 'ok') {
            throw Error(interactionResult.errorMessage);
        }
        return interactionResult.result;
    }
    async currentState() {
        return (await super.readState()).state;
    }
    async transfer(transfer) {
        return await this.writeInteraction({ function: 'transfer', ...transfer });
    }
}
//# sourceMappingURL=PstContractImpl.js.map