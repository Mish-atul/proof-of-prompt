const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ProofOfPromptRegistry", function () {
  let registry;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    const RegistryFactory = await ethers.getContractFactory("ProofOfPromptRegistry");
    registry = await RegistryFactory.deploy();
    await registry.waitForDeployment();
  });

  describe("registerProof", function () {
    it("Should register a new proof", async function () {
      const fingerprint = ethers.keccak256(ethers.toUtf8Bytes("test-content"));
      const metadataCID = "QmTest123";

      const tx = await registry.registerProof(fingerprint, metadataCID);
      await tx.wait();

      const proof = await registry.getProof(fingerprint);
      expect(proof.owner).to.equal(owner.address);
      expect(proof.metadataCID).to.equal(metadataCID);
      expect(proof.timestamp).to.be.gt(0);
    });

    it("Should reject duplicate registrations", async function () {
      const fingerprint = ethers.keccak256(ethers.toUtf8Bytes("test-content"));
      const metadataCID = "QmTest123";

      await registry.registerProof(fingerprint, metadataCID);

      await expect(
        registry.connect(addr1).registerProof(fingerprint, "QmTest456")
      ).to.be.revertedWith("Already registered");
    });

    it("Should allow different users to register different fingerprints", async function () {
      const fingerprint1 = ethers.keccak256(ethers.toUtf8Bytes("content-1"));
      const fingerprint2 = ethers.keccak256(ethers.toUtf8Bytes("content-2"));

      await registry.registerProof(fingerprint1, "QmTest1");
      await registry.connect(addr1).registerProof(fingerprint2, "QmTest2");

      const proof1 = await registry.getProof(fingerprint1);
      const proof2 = await registry.getProof(fingerprint2);

      expect(proof1.owner).to.equal(owner.address);
      expect(proof2.owner).to.equal(addr1.address);
    });
  });

  describe("getProof", function () {
    it("Should return empty proof for unregistered fingerprint", async function () {
      const fingerprint = ethers.keccak256(ethers.toUtf8Bytes("nonexistent"));
      const proof = await registry.getProof(fingerprint);

      expect(proof.owner).to.equal(ethers.ZeroAddress);
      expect(proof.timestamp).to.equal(0);
      expect(proof.metadataCID).to.equal("");
    });
  });
});
