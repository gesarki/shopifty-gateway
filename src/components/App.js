import NftImage from '../abis/NftImage.json'
import NftImageListing from '../abis/NftImageListing.json'
import React, { Component } from 'react';
import Identicon from 'identicon.js';
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
    const networkData = NftImage.networks[networkId]
    if(networkData) {
      const nftImage = new web3.eth.Contract(NftImage.abi, networkData.address)
      this.setState({ nftImage })
      const imagesCount = await nftImage.methods.imageCount().call()
      this.setState({ imagesCount })
      // Load images
      for (var i = 0; i < imagesCount; i++) {
        const image = await nftImage.methods.images(i).call()
        const owner = await nftImage.methods.ownerOf(image.id).call()
        image.owner = owner;

        this.setState({
          images: [...this.state.images, image]
        })
      }
      // // Sort images. Show highest tipped images first
      // this.setState({
      //   images: this.state.images.sort((a,b) => b.tipAmount - a.tipAmount )
      // })
      this.setState({ loading: false})
    } else {
      window.alert('NftImage contract not deployed to detected network.')
    }
  }

  captureFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  uploadImage = async description => {
    console.log("Submitting file to ipfs...")

    //adding file to the IPFS
    const file = await ipfs.add(this.state.buffer)
    console.log(`ipfs hash: ${file.cid}`)

    this.setState({ loading: true })
    this.state.nftImage.methods.mint(file.cid.toString(), description).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  tipImageOwner(id, tipAmount) {
    window.alert('TODO: remove button');
    // this.setState({ loading: true })
    // this.state.nftImage.methods.tipImageOwner(id).send({ from: this.state.account, value: tipAmount }).on('transactionHash', (hash) => {
    //   this.setState({ loading: false })
    // })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      nftImage: null,
      images: [],
      loading: true
    }

    this.uploadImage = this.uploadImage.bind(this)
    this.tipImageOwner = this.tipImageOwner.bind(this)
    this.captureFile = this.captureFile.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              images={this.state.images}
              captureFile={this.captureFile}
              uploadImage={this.uploadImage}
              tipImageOwner={this.tipImageOwner}
            />
        }
      </div>
    );
  }
}

export default App;
