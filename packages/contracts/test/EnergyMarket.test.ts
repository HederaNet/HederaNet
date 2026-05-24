import { expect } from 'chai';
import { ethers } from 'hardhat';
import type { EnergyMarket } from '../typechain-types/index.js';

describe('EnergyMarket', () => {
  let market: EnergyMarket;
  let owner: ReturnType<typeof ethers.getSigner> extends Promise<infer T> ? T : never;
  let seller: typeof owner;
  let buyer: typeof owner;
  let oracle: typeof owner;

  const ZERO_BYTES32 = ethers.ZeroHash;

  beforeEach(async () => {
    const signers = await ethers.getSigners();
    [owner, seller, buyer, oracle] = signers as [typeof owner, typeof owner, typeof owner, typeof owner];

    // Deploy mock tokens for testing
    const MockToken = await ethers.getContractFactory('MockERC20');
    const paymentToken = await MockToken.deploy('HNET', 'HNET');
    const energyToken = await MockToken.deploy('HEC', 'HEC');

    const EnergyMarket = await ethers.getContractFactory('EnergyMarket');
    market = (await EnergyMarket.deploy(
      await energyToken.getAddress(),
      await paymentToken.getAddress(),
      owner.address,
    )) as EnergyMarket;

    await market.setOracle(oracle.address);
  });

  describe('createListing', () => {
    it('creates a valid energy listing', async () => {
      const amount = 1000; // 10.00 kWh
      const price = 5000;  // 50 HNET smallest unit per kWh
      const duration = 86400; // 1 day

      const tx = await market.connect(seller).createListing(amount, price, duration, ZERO_BYTES32);
      const receipt = await tx.wait();
      expect(receipt?.status).to.equal(1);
    });

    it('reverts on zero amount', async () => {
      await expect(
        market.connect(seller).createListing(0, 5000, 86400, ZERO_BYTES32),
      ).to.be.revertedWithCustomError(market, 'ZeroAmount');
    });

    it('reverts on duration exceeding 30 days', async () => {
      await expect(
        market.connect(seller).createListing(1000, 5000, 31 * 86400, ZERO_BYTES32),
      ).to.be.reverted;
    });
  });

  describe('cancelListing', () => {
    it('allows seller to cancel their listing', async () => {
      const tx = await market.connect(seller).createListing(1000, 5000, 86400, ZERO_BYTES32);
      const receipt = await tx.wait();
      const event = receipt?.logs[0];

      // Get listing ID from event
      const iface = market.interface;
      const parsed = iface.parseLog({ topics: event?.topics ?? [], data: event?.data ?? '0x' });
      const listingId = parsed?.args[0] as string;

      await expect(market.connect(seller).cancelListing(listingId))
        .to.emit(market, 'ListingCancelled')
        .withArgs(listingId);
    });

    it('reverts when non-seller tries to cancel', async () => {
      const tx = await market.connect(seller).createListing(1000, 5000, 86400, ZERO_BYTES32);
      const receipt = await tx.wait();
      const event = receipt?.logs[0];
      const iface = market.interface;
      const parsed = iface.parseLog({ topics: event?.topics ?? [], data: event?.data ?? '0x' });
      const listingId = parsed?.args[0] as string;

      await expect(
        market.connect(buyer).cancelListing(listingId),
      ).to.be.revertedWithCustomError(market, 'NotSeller');
    });
  });

  describe('pause/unpause', () => {
    it('owner can pause the contract', async () => {
      await market.connect(owner).pause();
      await expect(
        market.connect(seller).createListing(1000, 5000, 86400, ZERO_BYTES32),
      ).to.be.revertedWithCustomError(market, 'EnforcedPause');
    });

    it('non-owner cannot pause', async () => {
      await expect(
        market.connect(seller).pause(),
      ).to.be.revertedWithCustomError(market, 'OwnableUnauthorizedAccount');
    });
  });
});
