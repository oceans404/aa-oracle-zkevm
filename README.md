# aa-oracle-zkevm

A starter template for building a dapp with Account Abstraction and a price feed from an oracle on Polygon zkEVM.

## Getting started

### 1. Install dependencies:

```bash
yarn install
```

### 2. Create a `.env.local` file by copying the `.env.example` file:

```bash
cp .env.example .env.local
```

### 3. Obtain a Wallet Connect Project ID

- Log in to the [Wallet Connect dashboard](https://cloud.walletconnect.com/sign-in) and create a new named project
- Update the NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME variable in the `.env.local` file with your new Wallet Connect Project Name, to match the name you gave your project in the Wallet Connect dashboard
- Update the NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID variable in the `.env.local` file with your new Wallet Connect Project ID from the dashboard

### Run the development server:

```bash
yarn run dev
```

## Next.js frontend bootstrapped with create-rainbowkit

Scaffold a new RainbowKit + wagmi + Next.js app with [`create-rainbowkit`](https://github.com/rainbow-me/rainbowkit/tree/main/packages/create-rainbowkit).

```
yarn create @rainbow-me/rainbowkit
```
