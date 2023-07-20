# aa-oracle-zkevm

A starter template for building a dapp with Account Abstraction and a price feed from an oracle on Polygon zkEVM.

## Blockchain: Polygon zkEVM Testnet

[Polygon zkEVM Documentation](https://zkevm.polygon.technology/)

| Network               | Public RPC URL                    | ChainID | Block Explorer URL                    | Verification API Key                   |
| --------------------- | --------------------------------- | ------- | ------------------------------------- | -------------------------------------- |
| Polygon zkEVM Testnet | https://rpc.public.zkevm-test.net | 1442    | https://testnet-zkevm.polygonscan.com | https://zkevm.polygonscan.com/myapikey |

## Data feed: API3 ETH-USD

[Read a dAPI documentation](https://docs.api3.org/guides/dapis/read-self-funded-dapi/)

ETH-USD dAPI: https://market.api3.org/dapis/polygon-zkevm-testnet/ETH-USD

## Project logic

TokenSwap checks the ETH-USD price from the API3 data feed on Polygon zkEVM Testnet and allows users to deposit ETH (collateral) to get (N ETH \* ETH-USD price) / (1e18) STA stable tokens. STA tokens can be burned to reclaim for ETH based on the current ETH-USD price at any time.

- TokenSwap Contract: https://testnet-zkevm.polygonscan.com/address/0x1fba51630d9557710778e827d786db624ee3c4e1

- TokenSwap Stable (STA) Token transfers: https://testnet-zkevm.polygonscan.com/token/0x1fba51630d9557710778e827d786db624ee3c4e1

- API3 ETH-USD dAPI Polygon zkEVM Testnet data feed: https://market.api3.org/dapis/polygon-zkevm-testnet/ETH-USD

Examples

| ETH | ETH-USD price (uint256) | ETH-USD price $ | STA tokens | tx |
| 1 | 1500000000000000000000 | $1,500 | 1500 | example |
| 1 | 2000000000000000000000 | $2,000 | 2000 | example |
| .01 | 1893000000000000000000 | $1,893 | 18.93 | https://testnet-zkevm.polygonscan.com/token/0x1fba51630d9557710778e827d786db624ee3c4e1 |
| 1 | 1893000000000000000000 | $1,893 | 1893 | https://testnet-zkevm.polygonscan.com/tx/0xd4a309ad49a805a100fa18b3cdd0f45a1b4cd0da2794771b5420d000443a6bf5 |

## Getting started

#### 0. Wallet setup: Create a [Metamask](https://metamask.io/) wallet, add the Polygon zkEVM testnet network to your Metamask networks, and get Polygon zkEVM testnet ETH

- Visit the [Polygon zkEVM Testnet blockchain explorer](https://testnet-zkevm.polygonscan.com) page
- Scroll down to the bottom
- Click the “🦊 Add zkEVM Network” button
- Open Metamask and switch your Metamask network to "zkEVM testnet"
- Use the [Polygon Faucet](https://faucet.polygon.technology/) to add .02 Polygon zkEVM testnet ETH to your account

### Backend setup

#### 1. Enter backend directory and install dependencies:

```
cd backend
yarn
```

#### 2. Create a `.env` file by copying the `.env.example` file:

```bash
cp .env.example .env
```

Update the .env file with your PRIVATE_KEY from Metamask and your ZKEVM_POLYGONSCAN_API_KEY from Polygonscan: https://zkevm.polygonscan.com/myapikey

#### 3. Compile contracts:

```
npx hardhat compile
```

#### 4. Deploy contracts to Polygon zkEVM Testnet

```
npx hardhat run scripts/deploy.ts --network polygonZKEVMTestnet
```

Note: The hardhat config file sets up artifacts to be output to the frontend/artifacts directory. You can find the ABI in `frontend/artifacts/contracts/TokenSwap.sol/TokenExchange.json`

Example deployed contract: https://testnet-zkevm.polygonscan.com/address/0x1fba51630d9557710778e827d786db624ee3c4e1

#### 5. Verify contracts on Polygon zkEVM Testnet

Copy the contract address from the output of the previous command and run:

```
npx hardhat verify --network polygonZKEVMTestnet <your-contract-address>
```

Check out your verified contract on Polygonscan using the link output by the verification command.

Example verified contract: https://testnet-zkevm.polygonscan.com/address/0x1fba51630d9557710778e827d786db624ee3c4e1#code

#### 6. Use the verified contract on Polygonscan to setProxyAddress

The proxy contract address for the [API3 ETH-USD](https://market.api3.org/dapis/polygon-zkevm-testnet/ETH-USD) on the Polygon zkEVM Testnet is 0x26690F9f17FdC26D419371315bc17950a0FC90eD

Use the link from the verification command output to view your contract on Polygonscan. Click the "Write Contract" tab. Click "Connect to Web3" and use Metamask to sign in with the account you used to deploy the contract. After signing in, select the setProxyAddress function. Enter the proxy contract address for the dApi and click "Write." Confirm the tx in your Metamask wallet.

Example setProxyAddress tx: https://testnet-zkevm.polygonscan.com/tx/0x432b9039a1b99b04798dac319fdf175895064263e9660bd9d6e6ed1ca35689ec

### Frontend setup

#### 1. Enter frontend directory and install dependencies:

```bash
cd frontend
yarn
```

#### 2. Create a `.env.local` file by copying the `.env.example` file:

```bash
cp .env.example .env.local
```

#### 3. Get a Wallet Connect Project ID

- Log in to the [Wallet Connect dashboard](https://cloud.walletconnect.com/sign-in) and create a new named project
- Update the NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME variable in the `.env.local` file with your new Wallet Connect Project Name, to match the name you gave your project in the Wallet Connect dashboard
- Update the NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID variable in the `.env.local` file with your new Wallet Connect Project ID from the dashboard

#### 4. Get an Alchemy Key

- Sign in to the [Alchemy dashboard](https://alchemy.com/?r=0ebbbd3306fa2de1)
- Create app with a name of your choice. Select "Polygon zkEVM" for chain and "Polygon zkEVM Testnet" for network
- Select "View key" for the project you just created
- Update the NEXT_PUBLIC_ALCHEMY_KEY variable in the `.env.local` file with your new Alchemy Key

#### 5. Start the project by running the development server:

```bash
yarn run dev
```
