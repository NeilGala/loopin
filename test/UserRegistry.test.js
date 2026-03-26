const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("UserRegistry", function () {
  let registry;
  let owner, user1, user2;

  // Deploy a fresh contract before each test
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    registry = await UserRegistry.deploy();
  });

  // ─── Registration ───────────────────────────────

  it("should allow a new user to register a username", async function () {
    await registry.connect(user1).register("alice");
    expect(await registry.getUsername(user1.address)).to.equal("alice");
    expect(await registry.isRegistered(user1.address)).to.equal(true);
  });

  it("should reject a username shorter than 3 characters", async function () {
    await expect(registry.connect(user1).register("ab"))
      .to.be.revertedWithCustomError(registry, "InvalidUsername");
  });

  it("should reject a username longer than 20 characters", async function () {
    await expect(registry.connect(user1).register("thisusernameiswaytoolong"))
      .to.be.revertedWithCustomError(registry, "InvalidUsername");
  });

  it("should prevent duplicate usernames (case-insensitive)", async function () {
    await registry.connect(user1).register("alice");
    await expect(registry.connect(user2).register("Alice"))
      .to.be.revertedWithCustomError(registry, "UsernameTaken");
  });

  it("should prevent a wallet from registering twice", async function () {
    await registry.connect(user1).register("alice");
    await expect(registry.connect(user1).register("alice2"))
      .to.be.revertedWithCustomError(registry, "AlreadyRegistered");
  });

  it("should look up a wallet address by username", async function () {
    await registry.connect(user1).register("alice");
    expect(await registry.getAddressByUsername("alice"))
      .to.equal(user1.address);
    // Case-insensitive lookup
    expect(await registry.getAddressByUsername("ALICE"))
      .to.equal(user1.address);
  });

  // ─── Profile Update ──────────────────────────────

  it("should allow a registered user to update their profile", async function () {
    await registry.connect(user1).register("alice");
    await registry.connect(user1).updateProfile("Hello world", "QmFakeHash123");
    expect(await registry.getBio(user1.address)).to.equal("Hello world");
    expect(await registry.getAvatar(user1.address)).to.equal("QmFakeHash123");
  });

  it("should prevent an unregistered user from updating profile", async function () {
    await expect(
      registry.connect(user2).updateProfile("bio", "hash")
    ).to.be.revertedWithCustomError(registry, "NotRegistered");
  });
});