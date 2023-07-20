import { NextComponentType } from "next";
import styles from "../styles/Swap.module.css";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Heading,
} from "@chakra-ui/react";

const Swap = (props: { priceFeed: number }) => {
  return (
    <Card my={4} p={4}>
      <CardHeader>
        <Heading>Swap Tokens</Heading>
        <a
          href="https://market.api3.org/dapis/polygon-zkevm-testnet/ETH-USD"
          rel="noopener noreferrer"
          target="_blank"
          style={{ textDecoration: "underline" }}
        >
          ETH / USD price feed
        </a>{" "}
        - ${Number(props.priceFeed).toLocaleString("en")}
      </CardHeader>
      <CardBody>
        <div></div>
        <Text>swap swap swap</Text>
      </CardBody>
    </Card>
  );
};

export default Swap;
