## TokenSwap frontend

### Contract Info

TokenSwap Contract: https://testnet-zkevm.polygonscan.com/address/0x1fba51630d9557710778e827d786db624ee3c4e1

The TokenSwap contract ABI is in `frontend/artifacts/contracts/TokenSwap.sol/TokenExchange.json`

1. readDataFeed (get ETH-USD price)

2. depositCollateral (deposit ETH to get N tokens depending on ETH price from data feed)

- Example tx deposit .01 eth to get 18.93 STA: https://testnet-zkevm.polygonscan.com/tx/0x5c332035e065abfd6ca4589e7446eb9de0c7cb876bbcbdee2915fff1d8cbdee0

3. reclaimEth (get ETH back for tokens)

### Next.js

This project uses a Next.js frontend bootstrapped with create-rainbowkit. Scaffold a new RainbowKit + wagmi + Next.js app with [`create-rainbowkit`](https://github.com/rainbow-me/rainbowkit/tree/main/packages/create-rainbowkit).
