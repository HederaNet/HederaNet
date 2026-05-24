import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: {
    hardhat: {},
    testnet: {
      url: process.env['HEDERA_TESTNET_JSON_RPC'] ?? 'https://testnet.hashio.io/api',
      accounts: process.env['HEDERA_OPERATOR_PRIVATE_KEY_HEX']
        ? [process.env['HEDERA_OPERATOR_PRIVATE_KEY_HEX']]
        : [],
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
