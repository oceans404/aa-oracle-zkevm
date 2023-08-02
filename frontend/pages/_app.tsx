import "../styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultWallets,
  RainbowKitProvider,
  lightTheme,
  Theme,
} from "@rainbow-me/rainbowkit";
import merge from "lodash.merge";

import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonZkEvm, polygonZkEvmTestnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";

const customPurpleTheme = merge(lightTheme(), {
  colors: {
    accentColor: "#854ce6",
  },
} as Theme);

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true"
      ? [polygonZkEvmTestnet]
      : []),
    polygonZkEvm,
  ],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_KEY || "" }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_NAME || "",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} theme={customPurpleTheme}>
          <Component {...pageProps} />
        </RainbowKitProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default MyApp;
