import NftImage from '../abis/NftImage.json'
import NftImageListing from '../abis/NftImageListing.json'
import React, { Component } from 'react';
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {

  async componentDidMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    // Network ID
    const networkId = await web3.eth.net.getId()
    const listingNetworkData = NftImageListing.networks[networkId]
    const networkData = NftImage.networks[networkId]
    if(networkData) {
      const nftImage = new web3.eth.Contract(NftImage.abi, networkData.address)
      const nftImageListing = new web3.eth.Contract(NftImageListing.abi, listingNetworkData.address)
      this.setState({ nftImage, nftImageListing })
      const imagesCount = await nftImage.methods.imageCount().call()
      this.setState({ imagesCount })
      // Load images
      let images = []
      for (let i = 0; i < imagesCount; i++) {
        const image = await nftImage.methods.images(i).call()
        const owner = await nftImage.methods.ownerOf(image.id).call()
        image.owner = owner

        images.push(image)
      }


      // load listings
      const listingsCount = await nftImageListing.methods.listingCount().call()

        let listings = [];
        for (let i = 0; i < listingsCount; i++) {
            const listing = await nftImageListing.methods.allListings(i).call()
            listings.push(listing)
        }

        this.mergeListings(images, listings);
        this.setState({images});
      this.setState({ loading: false})
    } else {
      window.alert('NftImage and Listing contracts not deployed to detected network.')
    }
  }

    mergeListings(images, listings) {
        // for all listings, update the image in state.images
        // to have a listingId, price, owner
        listings.forEach( (listing, listIndex) => {
            
                // find the image in images by its id
                // set its owner to seller, listingPrice, price
                const index = images.findIndex((img) => img.id === listing.tokenId)
                images[index].owner = listing.seller;
                images[index].price = listing.price;
                images[index].listingId = listIndex;
                images[index].isForSale = true;
        });
    }
  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
    }
  }

  uploadImage = async description => {
    console.log("Submitting file to ipfs...")
    this.setState({ loading: true })

    //adding file to the IPFS
    const file = await ipfs.add(this.state.buffer)
    console.log(`ipfs hash: ${file.cid}`)

    this.state.nftImage.methods.mint(file.cid.toString(), description).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ images:[]});
      this.loadBlockchainData();
      this.setState({ waitConfirmation: true, loading: false })
    }).on('error', (error, receipt) => {
      this.setState({ images:[]});
      this.loadBlockchainData();
      this.setState({ waitConfirmation: false, loading: false })
      window.alert("there was an error with the transaction!")
    }).on('confirmation', (number, receipt) => {
      this.setState({ images:[]});
      this.loadBlockchainData();
      this.setState({ waitConfirmation: false })
    });
  }

  purchaseImage(listingId, price) {
    this.setState({ loading: true })
    this.state.nftImageListing.methods.purchase(listingId).send({ from: this.state.account, value: price }).on('transactionHash', (hash) => {
      this.setState({ images:[]});
      this.loadBlockchainData();
      this.setState({ loading: false, waitConfirmation: true })
    }).on('confirmation', (number, receipt) => {
      this.setState({ images:[]});
      this.loadBlockchainData();
      this.setState({ waitConfirmation: false })
    });
  }

  putUpForSale(imageId, price) {
    console.log(`image: ${imageId}, price: ${price}`)
    this.setState({ loading: true })

    // convert price to hex then bytes with 64 padding
    const priceHex = window.web3.utils.numberToHex(price)
    const priceBytes = window.web3.utils.padLeft(priceHex, 64)

    this.state.nftImage.methods.safeTransferFrom(this.state.account, this.state.nftImageListing.options.address, imageId, priceBytes).send({ from: this.state.account }).on('transactionHash', async (hash) => {
      this.setState({ images:[]});
      this.loadBlockchainData();
      this.setState({ loading: false })
    })
  }

  updatePrice(imageId, price) {
    console.log(`listingId: ${imageId}, price: ${price}`)
    this.setState({ loading: true })

    this.state.nftImageListing.methods.setPrice(imageId, price).send({ from: this.state.account }).on('transactionHash', async (hash) => {
      this.setState({ images:[]});
      this.loadBlockchainData();
      this.setState({ loading: false, waitConfirmation: true })
    }).on('confirmation', (number, receipt) => {
      this.setState({ images:[]});
      this.loadBlockchainData();
      this.setState({ waitConfirmation: false })
    });
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      nftImage: null,
      images: [],
      loading: true,
      waitConfirmation: false
    }

    this.uploadImage = this.uploadImage.bind(this)
    this.purchaseImage = this.purchaseImage.bind(this)
    this.captureFile = this.captureFile.bind(this)
    this.putUpForSale = this.putUpForSale.bind(this)
    this.updatePrice = this.updatePrice.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.waitConfirmation ? 
          <div className="text-center mt-5 fixed-top">
            <span>awaiting confirmation</span> 
            <div className="spinner-border d-inline-block text-success" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        : <span></span>
        }
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              images={this.state.images}
              account={this.state.account}
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
              updatePrice={this.updatePrice}
              putUpForSale={this.putUpForSale}
              purchaseImage={this.purchaseImage}

            />
        }
      </div>
    );
  }
}

export default App;
