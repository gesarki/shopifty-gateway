// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./NftImageListing.sol";


contract NftImage is ERC721Enumerable {
    constructor() ERC721("NftImage", "NFTIMAGE") {}

    mapping(string => bool) _hashExists;

    Image[] public images;

    uint256 public imageCount = 0;

    struct Image {
        uint256 id;
        string hash;
        string description;
        uint256 price; // in WEI
    }

    modifier isOwner(uint _imageId) {
        require(ownerOf(_imageId) == msg.sender, "only owner can call this function");
        _;
    }

    // modifier to auto check valid image id
    modifier validId(uint256 _id) {
        require(_id >= 0 && _id < imageCount);
        _;
    }


    function mint(string memory _hash, string memory _description) public {
        // make sure hash exists
        require(bytes(_hash).length > 0);


        // make sure an image with this hash doesn't already exist
        require(!_hashExists[_hash], "Image with this hash already exists!");

        // mint this nft and assign it to the sender
        _safeMint(msg.sender, imageCount);

        // track the image
        images.push(Image(imageCount, _hash, _description, 0));
        _hashExists[_hash] = true;

        // increase total image count
        imageCount++;
    }
}
