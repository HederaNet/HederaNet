import { ethers } from 'hardhat';

const TESTNET_ADDRESSES = {
  energyCreditToken: '0x0000000000000000000000000000000006D45685', // HEC 0.0.7153605
  paymentToken:      '0x0000000000000000000000000000000006D45639', // HNET 0.0.7153593
  feeRecipient:      process.env['FEE_RECIPIENT_EVM_ADDRESS'] ?? ethers.ZeroAddress,
  governanceToken:   '0x0000000000000000000000000000000006D45639',
};

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying from:', deployer.address);

  // 1. EnergyMarket
  const EnergyMarket = await ethers.getContractFactory('EnergyMarket');
  const energyMarket = await EnergyMarket.deploy(
    TESTNET_ADDRESSES.energyCreditToken,
    TESTNET_ADDRESSES.paymentToken,
    TESTNET_ADDRESSES.feeRecipient,
  );
  await energyMarket.waitForDeployment();
  console.log('EnergyMarket:', await energyMarket.getAddress());

  // 2. OperatorStaking
  const OperatorStaking = await ethers.getContractFactory('OperatorStaking');
  const staking = await OperatorStaking.deploy();
  await staking.waitForDeployment();
  console.log('OperatorStaking:', await staking.getAddress());

  // 3. HederaNetOracle
  const Oracle = await ethers.getContractFactory('HederaNetOracle');
  const oracle = await Oracle.deploy();
  await oracle.waitForDeployment();
  console.log('HederaNetOracle:', await oracle.getAddress());

  // 4. Wire oracle → market
  await oracle.setEnergyMarket(await energyMarket.getAddress());
  await energyMarket.setOracle(await oracle.getAddress());
  console.log('Oracle wired to EnergyMarket');

  // 5. Governance (uses zero address for reputation — replace in prod)
  const Governance = await ethers.getContractFactory('GovernanceContract');
  const governance = await Governance.deploy(
    TESTNET_ADDRESSES.governanceToken,
    ethers.ZeroAddress,
  );
  await governance.waitForDeployment();
  await governance.setStakingContract(await staking.getAddress());
  console.log('Governance:', await governance.getAddress());

  console.log('\n=== DEPLOYMENT COMPLETE ===');
  console.log('Add these to your .env:');
  console.log(`ENERGY_TRADING_CONTRACT_ADDRESS=${await energyMarket.getAddress()}`);
  console.log(`OPERATOR_STAKING_CONTRACT_ADDRESS=${await staking.getAddress()}`);
  console.log(`ORACLE_CONTRACT_ADDRESS=${await oracle.getAddress()}`);
  console.log(`GOVERNANCE_CONTRACT_ADDRESS=${await governance.getAddress()}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
