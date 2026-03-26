const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PostRegistry", function () {
  let registry;
  let owner, alice, bob;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();
    const PostRegistry = await ethers.getContractFactory("PostRegistry");
    registry = await PostRegistry.deploy();
  });

  // ─── Create Post ──────────────────────────────────

  it("should allow a user to create a post", async function () {
    await registry.connect(alice).createPost("QmFakeIpfsHash", "Hello Loopin!");
    const post = await registry.getPost(1);
    expect(post.author).to.equal(alice.address);
    expect(post.ipfsHash).to.equal("QmFakeIpfsHash");
    expect(post.caption).to.equal("Hello Loopin!");
    expect(post.id).to.equal(1);
  });

  it("should increment post ID for each new post", async function () {
    await registry.connect(alice).createPost("QmHash1", "Post 1");
    await registry.connect(alice).createPost("QmHash2", "Post 2");
    await registry.connect(bob).createPost("QmHash3", "Post 3");
    expect(await registry.getTotalPosts()).to.equal(3);
  });

  it("should reject a post with an empty IPFS hash", async function () {
    await expect(registry.connect(alice).createPost("", "No hash"))
      .to.be.revertedWithCustomError(registry, "EmptyIPFSHash");
  });

  it("should store correct author address for each post", async function () {
    await registry.connect(alice).createPost("QmAliceHash", "Alice post");
    await registry.connect(bob).createPost("QmBobHash", "Bob post");

    const post1 = await registry.getPost(1);
    const post2 = await registry.getPost(2);

    expect(post1.author).to.equal(alice.address);
    expect(post2.author).to.equal(bob.address);
  });

  it("should return all post IDs for a user", async function () {
    await registry.connect(alice).createPost("QmHash1", "First");
    await registry.connect(alice).createPost("QmHash2", "Second");

    const ids = await registry.getUserPostIds(alice.address);
    expect(ids.length).to.equal(2);
    expect(ids[0]).to.equal(1);
    expect(ids[1]).to.equal(2);
  });

  it("should revert when fetching a non-existent post", async function () {
    await expect(registry.getPost(999))
      .to.be.revertedWithCustomError(registry, "PostNotFound");
  });

  it("should store a timestamp on post creation", async function () {
    await registry.connect(alice).createPost("QmHash", "Timestamped");
    const post = await registry.getPost(1);
    expect(post.timestamp).to.be.gt(0);
  });
});