# Shopifty-Gateway

https://shopifty-gateway.netlify.app/

**An NFT marketplace for minting, buying and selling images.** Built on the Ethereum blockchain

This image repository uses the ethereum blockchain as a backend. Each image is an NFT (Non-Fungible-Token) which follows the [ERC721 standard](http://erc721.org/). This means they can only be owned by one address at a time. They can also be traded/bought/sold on this or other NFT marketplace sites (on the Ropsten Test Network) if you wish, since it follows the ERC721 standard.

The website is both an NFT image browser and a marketplace. In addition to minting new NFTs, you can see all other image NFTs minted, put your images up for sale, and buy images up for sale by others.

- [Requirements](#requirements)
- [How To Use](#how-to-use)
- [How This Was Made](#how-this-was-made)
---

## Requirements

- [Metamask](https://metamask.io/):
In order to use the website you'll need an Ethereum wallet. I recommend metamask since it's one of the most popular ones.
- An ethereum **address**: Generated when you set up metamask fro the first time
- *(Optional)* ETH on the Ropsten Test Network. You can get some for free from a Ropsten **ETH faucet** like [this one](https://faucet.ropsten.be/) by providing your Ethereum address (found in metamask).

## How to use
1. Make sure you have all the requirements above.
2. In the metamask extension set your network to Ropsten Test Network (***important!***)
3. Go to the website: https://shopifty-gateway.netlify.app/
4. Accept the metamask connection request

You can now view all NFTs created, buy the ones on sale and mint your own.

### Minting
You can only mint NFT images that haven't been minted before, since the contract doesn't allow duplicate images tokens to exist. (It uses infura IPFS to securely store the images, and if another image already has that IPFS hash it rejects the mint.)

**Note:** since this writes to the blockchain (which requires gas), your address will need to have a positive ETH balance to pay the gas. See the last bullet in [requirements](#requirements).

### Selling
For images you own, you can put them up for sale by specifying its price using the form bellow the image.

You can update the price of your listing anytime by finding it and using the form bellow the image to update its price. Again, this uses gas so you'll need a positive ETH balance.

### Buying
Images that are for sale will have a "Buy" button bellow, allowing you to send ETH to the current owner so the ERC721 token can be transferred to your address.

## "Awaiting confirmation"
This message shows up whenever you make a transaction such as minting a new image, putting one up for sale, or buying one. Since we are on a real ethereum test network, it needs to be confirmed by nodes in the network to be considered valid. Only once it's done will you see the effects of your transaction on the website. 

**Note:** if you reload the page, the spinner will disappear and you'll have to manually reload it again once metamask notifies you that the transaction has been confirmed to see the effects.

# How this was made

The backend code for this app runs on the ethereum blockchain using smart contracts. They can be found here: [src/contracts/](src/contracts).

## NftImage.sol Contract
This is the NFT contract itself. In order to implement the ERC721 standard, it has data structures to hold each NFT image ever minted using this contract. Each of them contains some metadata:
- `hash`: the hash returned by infura's IPFS service, a distributed file system to securely store the uploaded image in a content-addressible way.
- `description`: the description of the image given when minting the NFT

## NftImageListing.sol Contract
When putting a token up for sale, you're actually transferring it to the NftImageListing contract address. It stores the owner who transferred it, and the price provided. It has the following methods:
- `setPrice(listingId)`: lets you update the listing price if you were the owner who sent it the NFT originally
- `purchase(listingId)`: lets you purchase an NFT if you pay the price provided. This transfers the value to the original owner, and transfers the NFT to the caller.

## IPFS 
Infura's [IPFS service](https://infura.io/) is used to store the images. When uploading an image, it returns a hash that is used as its address in the ipfs network (https://ipfs.infura.io/ipfs/\<HASH\>). The hash is generated from the image file, so uploading a duplicate image will return the same hash. This allows us to easily implement duplicate rejection in our NFT smart contract, by storing the existing hashes and rejecting mints when the provided hash matches one of them.

## Front End
The front end was built quickly with React, using web3.js to interact directly with the contracts.