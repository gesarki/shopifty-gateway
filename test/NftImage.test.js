const { assert } = require('chai');

const NftImage = artifacts.require('./NftImage.sol');
const NftImageListing = artifacts.require('./NftImageListing.sol');


require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('NftImage', (accounts) => {

    before(async() => {
        contract = await NftImage.deployed()
        listings = await NftImageListing.deployed()
        BN = web3.utils.BN;
    })

    describe('deployment', async() => {
        it('deploys successfully', async() => {
            const address = contract.address
            assert.notEqual(address, '')
            assert.notEqual(address, 0x0)
            assert.notEqual(address, undefined)
            assert.notEqual(address, null)
        })

        it('has a name', async() => {
            const name = await contract.name()
            assert.equal(name, 'NftImage')
        })

        it('has a symbol', async() => {
            const symbol = await contract.symbol()
            assert.equal(symbol, 'NFTIMAGE')
        })

        it('deploys listing successfully', async() => {
            const address = listings.address
            assert.notEqual(address, '')
            assert.notEqual(address, 0x0)
            assert.notEqual(address, undefined)
            assert.notEqual(address, null)
        })

    })

    describe('minting', async() => {
        it('creates a new token', async() => {
            const result = await contract.mint('abc123', 'some description')
            const totalSupply = await contract.totalSupply();

            // SUCCESS
            assert.equal(totalSupply, 1)
            const event = result.logs[0].args;
            assert.equal(event.tokenId.toNumber(), 0, 'id is incorrect');
            assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is incorrect')
            assert.equal(event.to, accounts[0], 'to is incorrect')
        })

        it('does not mint a token that already exists', async() => {
            // Failure: cannot mint same hash twice
            await contract.mint('abc123', 'some description').should.be.rejected;
        })

        it('does not mint an image without a hash', async() => {
            // Failure: cannot mint same hash twice
            await contract.mint('', 'some description').should.be.rejected;
        })
    })

    describe('indexing', async() => {
        it('lists images', async() => {
            // mint 2 more tokens
            await contract.mint('def123', 'some other description')
            await contract.mint('ghi123', 'a description')

            const totalSupply = await contract.totalSupply()

            let image;
            let result = []

            for (let i = 0; i < totalSupply; i++) {
                image = await contract.images(i)
                result.push(image.hash)
            }

            let expected = ['abc123', 'def123', 'ghi123']
            assert.equal(expected.join(','), result.join(','))

        })
    })

    describe('selling', async() => {
        it('transfers image to listing contract', async() => {
            const price = web3.utils.toWei('0.3', 'Ether');
            const priceHex = web3.utils.numberToHex(price)
            const priceBytes = web3.utils.padLeft(priceHex, 64)

            // transfer image 0 to image listing contract
            const result = await contract.safeTransferFrom(accounts[0], listings.address, 0, priceBytes)

            // check owner of img 0
            const owner = await contract.ownerOf(0)
            assert.equal(owner.toString(), listings.address.toString(), 'Token was not transferred to contract!')

            // get first listing in allListings
            const listing = await listings.allListings(0)

            // make sure seller, contract, price and tokenId is correct
            assert.equal(listing.seller, accounts[0], 'listing seller is incorrect')
            assert.equal(listing.tokenId, '0', 'listing tokenId is incorrect')
            assert.equal(listing.nftContract, contract.address, 'listing nftContract address is incorrect')
            assert.equal(listing.price, price, 'listing price is incorrect')

        })

        it('does not allow non seller to set listing price', async() => {
            await listings.setPrice(0, web3.utils.toWei('0.2', 'Ether'), { from: accounts[1] }).should.be.rejected;
        })

        it('adds multiple listings properly', async() => {
            await contract.safeTransferFrom(accounts[0], listings.address, 1)
            await contract.safeTransferFrom(accounts[0], listings.address, 2)
            const owner1 = await contract.ownerOf(1)
            const owner2 = await contract.ownerOf(2)
            assert.equal(owner1.toString(), listings.address.toString(), 'second token was not transferred to contract!')
            assert.equal(owner2.toString(), listings.address.toString(), 'third token was not transferred to contract!')
        })

        it('lets you update a listing\'s price', async() => {
            const price = web3.utils.toWei('0.2', 'Ether')
            await listings.setPrice(0, price)

            const listing = await listings.allListings(0)
            assert.equal(listing.price, price, 'listing price was not updated correctly')
        })
    })


    describe('buying', async() => {
        it('should purchase image', async() => {

            const price = web3.utils.toWei('0.2', 'Ether')
            const priceBn = new BN(price)

            // store eth balance of acount 0
            let sellerBalance
            sellerBalance = await web3.eth.getBalance(accounts[0])
            sellerBalance = new BN(sellerBalance)

            // store eth balance of account 1
            let buyerBalance
            buyerBalance = await web3.eth.getBalance(accounts[1])
            buyerBalance = new BN(buyerBalance)

            // account 1 buys image 0
            const result = await listings.purchase(0, { from: accounts[1], value: price })

            // store gas cost
            const tx = await web3.eth.getTransaction(result.tx);
            const gasCost = new BN(tx.gasPrice).mul(new BN(result.receipt.gasUsed));

            // ownerOf image 0 should be acct 1
            const owner = await contract.ownerOf(0)
            assert.equal(owner, accounts[1])

            // eth balance of acct 0 should be more by img price
            let expectedSellerBalance = sellerBalance
            expectedSellerBalance = expectedSellerBalance.add(priceBn)

            sellerBalance = await web3.eth.getBalance(accounts[0])
            sellerBalance = new BN(sellerBalance)

            assert.equal(sellerBalance.toString(), expectedSellerBalance.toString(), "Seller balance isn't correct!")

            // eth balance of account 1 should be less by img price
            let expectedBuyerBalance = buyerBalance
            expectedBuyerBalance = expectedBuyerBalance.sub(priceBn)
            expectedBuyerBalance = expectedBuyerBalance.sub(gasCost)

            buyerBalance = await web3.eth.getBalance(accounts[1])
            buyerBalance = new BN(buyerBalance)

            assert.equal(buyerBalance.toString(), expectedBuyerBalance.toString(), "buyer balance isn't correct!")
        })
    })
})