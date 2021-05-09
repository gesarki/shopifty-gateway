# Shopifty-Gateway

[(live deployment)](https://shopify-gateway.netlify.app/)

This image repository uses the ethereum blockchain as a backend. Each image is an NFT (Non-Fungible-Token) which follows the [ERC721 standard](http://erc721.org/). This means they can only be owned by one address at a time. They can also be traded/bought/sold on this or other NFT marketplace sites if you wish, since it follows the ERC721 standard.

The website is both an NFT image browser and a marketplace. In addition to minting new NFTs, you can see all other image NFTs minted, put your images up for sale, and buy images up for sale by others.

## Requirements

- [Metamask](https://metamask.io/):
In order to use the website you'll need an Ethereum wallet. I recommend metamask since it's one of the most popular ones.
- An ethereum **address**: Generated when you set up metamask fro the first time
- *(Optional)* ETH on the Ropsten Test Network. You can get some for free from a Ropsten **ETH faucet** like [this one](https://faucet.ropsten.be/) by providing your Ethereum address (found in metamask).

## How to use
1. Make sure you have all the requirements above.
2. In the metamask extension set your network to Ropsten Test Network (*important*)
3. Go to the website: https://shopify-gateway.netlify.app/
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