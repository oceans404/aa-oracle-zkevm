# aa-oracle-zkevm

A starter template for building a dapp with Account Abstraction and a price feed from an oracle on Polygon zkEVM.

## Blockchain: Polygon zkEVM Testnet

[Polygon zkEVM Documentation](https://zkevm.polygon.technology/)

| Network | Public RPC URL | ChainID | Block Explorer URL |
| -------- | ------- | -------- | ------- |
| Polygon zkEVM Testnet | https://rpc.public.zkevm-test.net | 1442 | https://testnet-zkevm.polygonscan.com |

## Getting started

### 0. Wallet setup: Create a [Metamask](https://metamask.io/) wallet, add the Polygon zkEVM testnet network to your Metamask networks, and get Polygon zkEVM testnet ETH

- Visit the [Polygon zkEVM Testnet blockchain explorer](https://testnet-zkevm.polygonscan.com/) page
- Scroll down to the bottom
- Click the “🦊 Add zkEVM Network” button
- Open Metamask and switch your Metamask network to "zkEVM testnet"
- Use the [Polygon Faucet](https://faucet.polygon.technology/) to add .02 Polygon zkEVM testnet ETH to your account

### 1. Fork repo and install dependencies:

```bash
cd frontend
yarn install
```

### 2. Create a `.env.local` file by copying the `.env.example` file:

```bash
cp .env.example .env.local
```

### 3. Get a Wallet Connect Project ID

- Log in to the [Wallet Connect dashboard](https://cloud.walletconnect.com/sign-in) and create a new named project
- Update the NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME variable in the `.env.local` file with your new Wallet Connect Project Name, to match the name you gave your project in the Wallet Connect dashboard
- Update the NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID variable in the `.env.local` file with your new Wallet Connect Project ID from the dashboard

### 4. Get an Alchemy Key

- Sign in to the [Alchemy dashboard](https://alchemy.com/?r=0ebbbd3306fa2de1)
- Create app with a name of your choice. Select "Polygon zkEVM" for chain and "Polygon zkEVM Testnet" for network
- Select "View key" for the project you just created
- Update the NEXT_PUBLIC_ALCHEMY_KEY variable in the `.env.local` file with your new Alchemy Key

### 5. Start the project by running the development server:

```bash
yarn run dev
```

## Tools used for starter template

This project uses a Next.js frontend bootstrapped with create-rainbowkit. Scaffold a new RainbowKit + wagmi + Next.js app with [`create-rainbowkit`](https://github.com/rainbow-me/rainbowkit/tree/main/packages/create-rainbowkit).
