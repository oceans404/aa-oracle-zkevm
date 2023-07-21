import { NextComponentType } from "next";
import styles from "../styles/Swap.module.css";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";

const Swap = (props: {
  priceFeed: number | null;
  maxEth: number | null;
  maxSta: number | null;
  tokenContract: string;
}) => {
  return (
    <Card my={4} p={4} className={styles.swap}>
      <CardHeader>
        <Heading>STA stablecoin swap</Heading>
        <Text>
          API3{" "}
          <a
            href="https://market.api3.org/dapis/polygon-zkevm-testnet/ETH-USD"
            rel="noopener noreferrer"
            target="_blank"
          >
            ETH / USD price feed
          </a>{" "}
          - ${Number(props.priceFeed).toLocaleString("en")}
        </Text>
      </CardHeader>
      <CardBody>
        <Tabs isFitted variant="enclosed">
          <TabList>
            <Tab>ETH ➡️ STA</Tab>
            <Tab>STA ➡️ ETH</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <p>ETH ➡️ STA</p>
              <Text>ETH: {props.maxEth?.toString()}</Text>
              <Text>STA: {props.maxSta?.toString()}</Text>
            </TabPanel>
            <TabPanel>
              <p>STA ➡️ ETH</p>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
      <CardFooter>
        <a
          href={`https://testnet-zkevm.polygonscan.com/address/${props.tokenContract}`}
          rel="noopener noreferrer"
          target="_blank"
        >
          👀 STA Contract
        </a>
      </CardFooter>
    </Card>
  );
};

export default Swap;
