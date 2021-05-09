// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// credit: https://ethereum.stackexchange.com/questions/55269/transfer-an-erc721-token-from-another-contract
contract NftImageListing is IERC721Receiver {

    ListingDetails[] public allListings;
    uint256 public listingCount = 0;

    struct ListingDetails {
        ERC721 nftContract;
        address seller;
        uint256 tokenId;
        uint price;
        bool isReadyForSale;
    }

    function onERC721Received(address, address from, uint256 tokenId, bytes calldata) override external returns(bytes4) {
        allListings.push(ListingDetails({
            nftContract: ERC721(msg.sender),
            seller: from,
            tokenId: tokenId,
            price: 0,
            isReadyForSale: false
        }));

        listingCount ++;
        return IERC721Receiver.onERC721Received.selector;
    }

    function setPrice(uint listingId, uint price) external {
        // make sure listing exists
        require(listingId < allListings.length, "Listing doesn't exist!");

        ListingDetails memory listing = allListings[listingId];

        // make sure sender is listing seller
        require(listing.seller == msg.sender, "You aren't the seller!");

        // change the price
        listing.price = price;

        // mark ready for sale
        listing.isReadyForSale = true;
        allListings[listingId] = listing;
    }

    function purchase(uint256 listingId) external payable {
        // make sure listing exists
        require(listingId < allListings.length, "Listing doesn't exist!");

        ListingDetails memory listing = allListings[listingId];
        
        // make sure listing is for sale
        require(listing.isReadyForSale, "Listing is not ready for sale yet!");

        // make sure the msg value is the right price
        require(msg.value >= listing.price);
        
        // transfer funds to seller
        payable(listing.seller).transfer(msg.value);

        // transfer token to buyer
        listing.nftContract.safeTransferFrom(address(this), msg.sender, listing.tokenId);

        // remove from listing list
        removeFromListingList(listingId);

        listingCount --;
        
    }

    /// @dev Removes a listing from allListings given its index
    /// swaps the last listing into its spot if it wasn't the last element
    function removeFromListingList(uint256 listingId) internal {
        // if index is not the last element swap the last element into its spot
        // and update its index
        uint length = allListings.length;
        if (listingId != length - 1) {
            allListings[listingId] = allListings[length - 1];
        }

        // length --;
        allListings.pop();
    }
}