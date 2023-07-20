import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.13",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    artifacts: "../frontend/artifacts",
  },
  networks: {
    polygonZKEVMTestnet: {
      url: `https://rpc.public.zkevm-test.net`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    // Your Polygonscan API key
    // https://zkevm.polygonscan.com/myapikey
    apiKey: {
      polygonZKEVMTestnet: `${process.env.ZKEVM_POLYGONSCAN_API_KEY}`,
    },
    customChains: [
      {
        network: "polygonZKEVMTestnet",
        chainId: 1442,
        urls: {
          apiURL: "https://api-testnet-zkevm.polygonscan.com/api",
          browserURL: "https://testnet-zkevm.polygonscan.com/",
        },
      },
    ],
  },
};

export default config;
