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
        bool isForSale;
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

    event imagePutUpForSale(uint id, uint price);


    function mint(string memory _hash, string memory _description) public {
        // make sure hash exists
        require(bytes(_hash).length > 0);


        // make sure an image with this hash doesn't already exist
        require(!_hashExists[_hash], "Image with this hash already exists!");

        // mint this nft and assign it to the sender
        _safeMint(msg.sender, imageCount);

        // track the image
        images.push(Image(imageCount, _hash, _description, false, 0));
        _hashExists[_hash] = true;

        // increase total image count
        imageCount++;
    }

    // function putImageUpForSale(uint _imageId, uint _price, address _address) validId(_imageId) isOwner(_imageId) public {
    //     NftImageListing candidateContract = NftImageListing(_address);

    //     Image memory img = images[_imageId];

    //     // make sure the image isn't already for sale
    //     require(!img.isForSale, "Image is already for sale!");

    //     // add this contract as approved
    //     approve(address(this), _imageId);

    //     // set the image price, isForSale = true
    //     img.price = _price;
    //     img.isForSale = true;

    //     // put it back in the list
    //     images[_imageId] = img;

    //     // emit imagePutUpForSale
    //     emit imagePutUpForSale(_imageId, _price);
    // }

    // function buyImage(uint _imageId) validId(_imageId) public payable {
    //     // make sure image is on sale
    //     Image memory img = images[_imageId];
    //     require(img.isForSale, "Trying to buy an image that's not on sale!");

    //     // make sure msg.sender isn't the current owner
    //     address payable owner = payable(ownerOf(_imageId));
    //     require(owner != msg.sender, "Trying to buy an image you already own!");

    //     // make sure msg.value is == image.price
    //     require(msg.value >= img.price);

    //     // transfer msg.value to img owner
    //     owner.transfer(msg.value);

    //     // make sure this contract is approved on this token **TO REMOVE **
    //     require(getApproved(_imageId) == address(this), "Contract isn't set as approved!");

    //     // transfer image from owner to new owner (also clear's contract's approval)
    //     safeTransferFrom(owner, msg.sender, _imageId);

    //     // set image back to not on sale
    //     img.isForSale = false;
    //     images[_imageId] = img;
    // }
}
