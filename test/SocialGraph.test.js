const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SocialGraph", function () {
  let graph;
  let owner, alice, bob, carol;

  beforeEach(async function () {
    [owner, alice, bob, carol] = await ethers.getSigners();
    const SocialGraph = await ethers.getContractFactory("SocialGraph");
    graph = await SocialGraph.deploy();
  });

  // ─── Follow ───────────────────────────────────────

  it("should allow alice to follow bob", async function () {
    await graph.connect(alice).follow(bob.address);
    expect(await graph.isFollowing(alice.address, bob.address)).to.equal(true);
  });

  it("should increment follower/following counts correctly", async function () {
    await graph.connect(alice).follow(bob.address);
    expect(await graph.getFollowerCount(bob.address)).to.equal(1);
    expect(await graph.getFollowingCount(alice.address)).to.equal(1);
  });

  it("should prevent a user from following themselves", async function () {
    await expect(graph.connect(alice).follow(alice.address))
      .to.be.revertedWithCustomError(graph, "CannotFollowSelf");
  });

  it("should prevent following the same user twice", async function () {
    await graph.connect(alice).follow(bob.address);
    await expect(graph.connect(alice).follow(bob.address))
      .to.be.revertedWithCustomError(graph, "AlreadyFollowing");
  });

  // ─── Unfollow ─────────────────────────────────────

  it("should allow alice to unfollow bob", async function () {
    await graph.connect(alice).follow(bob.address);
    await graph.connect(alice).unfollow(bob.address);
    expect(await graph.isFollowing(alice.address, bob.address)).to.equal(false);
  });

  it("should decrement counts correctly after unfollow", async function () {
    await graph.connect(alice).follow(bob.address);
    await graph.connect(alice).unfollow(bob.address);
    expect(await graph.getFollowerCount(bob.address)).to.equal(0);
    expect(await graph.getFollowingCount(alice.address)).to.equal(0);
  });

  it("should prevent unfollowing someone you don't follow", async function () {
    await expect(graph.connect(alice).unfollow(bob.address))
      .to.be.revertedWithCustomError(graph, "NotFollowing");
  });

  // ─── Lists ────────────────────────────────────────

  it("should return correct following list", async function () {
    await graph.connect(alice).follow(bob.address);
    await graph.connect(alice).follow(carol.address);
    const following = await graph.getFollowing(alice.address);
    expect(following.length).to.equal(2);
    expect(following).to.include(bob.address);
    expect(following).to.include(carol.address);
  });

  it("should return correct followers list", async function () {
    await graph.connect(alice).follow(bob.address);
    await graph.connect(carol).follow(bob.address);
    const followers = await graph.getFollowers(bob.address);
    expect(followers.length).to.equal(2);
    expect(followers).to.include(alice.address);
    expect(followers).to.include(carol.address);
  });

  it("should update lists correctly after unfollow", async function () {
    await graph.connect(alice).follow(bob.address);
    await graph.connect(alice).follow(carol.address);
    await graph.connect(alice).unfollow(bob.address);
    const following = await graph.getFollowing(alice.address);
    expect(following.length).to.equal(1);
    expect(following).to.include(carol.address);
    expect(following).to.not.include(bob.address);
  });
});