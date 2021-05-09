const NFTImage = artifacts.require("NftImage");
const NFTImageListing = artifacts.require("NftImageListing");

module.exports = function(deployer) {
    deployer.deploy(NFTImage);
    deployer.deploy(NFTImageListing);
};