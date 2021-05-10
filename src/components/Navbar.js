import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Navbar extends Component {

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top flex-md-nowrap p-0 shadow">
        <span
          className="navbar-brand col-sm-3 col-md-2 ms-3"
        >
          Shopifty Gateway
        </span>
        <span className="navbar=text">
            <small className="text-secondary text-white">
              <small id="account">{this.props.account}</small>
            </small>
            { this.props.account
              ? <img
                alt="current account identicon"
                className='mx-3'
                width='30'
                height='30'
                src={`data:image/png;base64,${new Identicon(this.props.account, 30).toString()}`}
              />
              : <span></span>
            }
        </span>
      </nav>
    );
  }
}

export default Navbar;
