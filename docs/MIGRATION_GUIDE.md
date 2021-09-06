# Migration Guide from SmartWeave v1 to SmartWeave v2

This guide describes <strong>the simplest</strong> way to switch to the new version of SmartWeave. It uses `SmartWeaveNodeFactory` for Node and `SmartWeaveWebFactory` for Web to quickly obtain fully configured, mem-cacheable SmartWeave instance. To see a more detailed explanation of all the core modules visit the [SmartWeave v2 documentation](https://smartweave.docs.redstone.finance/) or check out the [source code.](https://github.com/redstone-finance/redstone-smartweave)

### Need help? 🙋‍♂️
Please feel free to contact us [on Discord](https://redstone.finance/discord) if you face any problems.

## 1. Update dependencies 📦

#### 1.1 Install smartweave v2
```bash
# Yarn
yarn add redstone-smartweave

# or NPM
npm install redstone-smartweave
```
#### 1.2 Remove smartweave v1
If smartweave was installed globally, add `-g` flag to npm or use `yarn global`
```bash
# Yarn
yarn remove smartweave

# or NPM
npm uninstall smartweave
```

#### 1.3 Replace imports
You can import the full API or individual modules.
```typescript
import * as SmartWeaveSdk from 'redstone-smartweave';
import { SmartWeave, Contract, ... } from 'redstone-smartweave';
```

## 2. Update your implementation 🧑‍💻
### 2.1 Initialise a SmartWeave client
```typescript
// Create an Arweave instance
const arweave = Arweave.init({
  host: "dh48zl0solow5.cloudfront.net",
  port: 443,
  protocol: "https",
  timeout: 20000,
  logging: false,
});

// Create a SmartWeave client
const smartweave = SmartWeaveNodeFactory.memCached(arweave);
```

For Web environment you should use `SmartWeaveWebFactory` instead of `SmartWeaveNodeFactory`.

In this example we've used the `memCached` method. You can see other available methods in documentation:
- [For Web](https://smartweave.docs.redstone.finance/classes/SmartWeaveWebFactory.html)
- [For Node.js](https://smartweave.docs.redstone.finance/classes/SmartWeaveNodeFactory.html)

#### [Optional] Custom modules 🛠
Smartweave V2 has a modular architecture, which allows you to connect custom modules to any part of the SmartWeave client implementation. See [custom-client-example.ts](https://github.com/redstone-finance/redstone-smartweave-examples/blob/main/src/custom-client-example.ts) to learn more.

### 2.2 Connect to your contract
```typescript
// Simple connection (allows to read state)
const contract = smartweave.contract("YOUR_CONTRACT_TX_ID");

// Connect with wallet (allows to update state)
const contract = smartweave
  .contract("YOUR_CONTRACT_TX_ID")
  .connect(jwk) // jwk should be a valid private key (in JSON Web Key format)
  .setEvaluationOptions({
    // with this flag set to true, the write will wait for the transaction to be confirmed
    waitForConfirmation: true,
  });
```

### 2.3 Interact with your contract
#### Read state (readContract in V1)
```typescript
// Read state (similar to the "readContract" from SmartWeave V1)
const { state, validity } = await contract.readState();

// state contains is an object with the latest state

// validity is an object with valid and invalid transaction IDs
// E.g. { "TX_ID1": true, "TX_ID2": false, ...}
```

#### View state (interactRead in V1)
```typescript
// View state (similar to the "interactRead" from SmartWeave V1)
const { state, validity } = await contract.viewState({
  function: "NAME_OF_YOUR_FUNCTION",
  data: { ... }
});
```

#### Write interaction (interactWrite in V1)
```typescript
// Write interaction (similar to the "interactWrite" from SmartWeave V1)
const result = await contract.writeInteraction({
  function: "NAME_OF_YOUR_FUNCTION",
  data: { ... }
});
```

### [Optional] 2.4 Confgure logging
TODO - add description

### 3. Test everything 🔥
Before deploying your changes test it carefully. If you face any problems please contact us [on our discord](https://redstone.finance/discord). We'll be happy to help 😊