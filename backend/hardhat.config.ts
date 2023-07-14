import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require('dotenv').config();


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
    }
  ],
},

networks: {
  
  hardhat: {
    chainId: 1337
  },
  polygon: {
    url: process.env.POLYGON_RPC_URL,
    accounts: [`${process.env.PRIVATE_KEY}`],
  },
  mumbai: {
    url: `${process.env.MUMBAI_RPC_URL}`,
    accounts: [`${process.env.PRIVATE_KEY}`],
    gas: 200000000,
    gasPrice: 100000000000,
  }

},
etherscan: {
// Your API key for Etherscan
// Obtain one at https://etherscan.io/
apiKey: process.env.ETHERSCAN_API_KEY
}
};

export default config;

