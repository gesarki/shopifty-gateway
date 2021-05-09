import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Main extends Component {

  render() {
    return (
      <div className="container-fluid mt-5">
          <main role="main" className="col-lg-12" >
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <div className="row text-center mx-auto" style={{ maxWidth: 500 }}>
                <h2>Mint Image</h2>
                <form onSubmit={(event) => {
                  event.preventDefault()
                  const description = this.imageDescription.value
                  this.props.uploadImage(description)
                }} >
                  <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.props.captureFile} />
                  <div className="form-group mr-sm-2">
                  <br></br>
                  <input
                    id="imageDescription"
                    type="text"
                    ref={(input) => { this.imageDescription = input }}
                    className="form-control"
                    placeholder="Image description..."
                    required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block btn-lg">Mint!</button>
                </form>
              </div>
                <hr />
              <div className="row">
              <p>&nbsp;</p>
              <h2 className="text-center">All NFTs</h2>
              <p>&nbsp;</p>
              { this.props.images.map((image, key) => {
                return(
                  <div className="col-md-4" key={key}>
                  <div className="card mb-4">
                    <div className="card-header">
                      <img
                        className='mr-2 img-fluid'
                        alt="owner identicon"
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(image.owner, 30).toString()}`}
                      />
                      <small className="text-muted">{image.owner}</small>
                      { (image.owner === this.props.account) ? <small className="badge bg-info text-dark ms-2" >You!</small> : <span></span>}
                      { image.isForSale ? <small className="badge bg-primary text-white ms-2" >For Sale!</small> : <span></span>}
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p className="text-center">
                          <img className="img-fluid" alt="nft" src={`https://ipfs.infura.io/ipfs/${image.hash}`} style={{height:350}} />
                        </p>
                        <p>hash: <span className="badge bg-dark">{image.hash}</span></p>
                        <p>{image.description}</p>
                      </li>
                      { image.price > 0 ? 
                      <li key={key+"purchase"} className="list-group-item py-2">
                            <button
                            className="btn btn-primary float-right"
                            name={image.listingId}
                            price={image.price}
                            onClick={(event) => {
                              this.props.purchaseImage(image.listingId, image.price)
                            }}
                          >
                            Buy for { window.web3.utils.fromWei(image.price) } ETH
                          </button>
                        </li>
                        : <span></span> }
                        { image.owner === this.props.account && !image.isForSale ?
                          <li key={key+"sell"} className="list-group-item py-2">
                          <form onSubmit={(event) => {
                            event.preventDefault()
                            let price = image.newPrice
                            price = window.web3.utils.toWei(price, 'Ether')
                            this.props.putUpForSale(image.id, price)
                          }} >
                            <div className="input-group me-sm-2">
                              <br></br>
                              <input
                                id="listingPrice"
                                type="number"
                                step="any"
                                onChange={(event) => { image.newPrice = event.target.value }}
                                className="form-control"
                                placeholder="price in ETH, e.g. 0.001"
                                required 
                              />
                              <button type="submit" className="btn btn-primary btn-block">Put up for sale!</button>
                            </div>
                          </form>
                          </li>
                         :
                         <span></span> }
                         { image.owner === this.props.account && image.isForSale ?
                          <li key={key+"updatePrice"} className="list-group-item py-2">
                          <form onSubmit={(event) => {
                            event.preventDefault()
                            let price = image.newPrice
                            price = window.web3.utils.toWei(price, 'Ether')
                            this.props.updatePrice(image.listingId, price)
                          }} >
                            <div className="input-group me-sm-2">
                              <br></br>
                              <input
                                id="upateListingPrice"
                                type="number"
                                step="any"
                                onChange={(event) => { image.newPrice = event.target.value }}
                                className="form-control"
                                placeholder="price in ETH, e.g. 0.001"
                                required 
                              />
                              <button type="submit" className="btn btn-primary btn-block">Update price!</button>
                            </div>
                          </form>
                          </li>
                         :
                         <span></span> }
                    </ul>
                  </div>
                  </div>
                )
              })}
              </div>
            </div>
          </main>
      </div>
    );
  }
}

export default Main;
