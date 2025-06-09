// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FoodSupplyChain {
    enum Stage { Produced, Shipped, Received }

    struct Item {
        string name;
        string origin;
        address farmer;
        address distributor;
        address retailer;
        Stage stage;
    }

    mapping(uint => Item) public items;
    uint public itemCount;

    function addItem(string memory _name, string memory _origin) public {
        items[itemCount] = Item(_name, _origin, msg.sender, address(0), address(0), Stage.Produced);
        itemCount++;
    }

    function shipItem(uint _id, address _distributor) public {
        require(items[_id].stage == Stage.Produced, "Already shipped or received");
        require(msg.sender == items[_id].farmer, "Only farmer can ship");
        items[_id].distributor = _distributor;
        items[_id].stage = Stage.Shipped;
    }

    function receiveItem(uint _id, address _retailer) public {
        require(items[_id].stage == Stage.Shipped, "Not shipped yet");
        require(msg.sender == items[_id].distributor, "Only distributor can confirm delivery");
        items[_id].retailer = _retailer;
        items[_id].stage = Stage.Received;
    }

    function getItem(uint _id) public view returns (Item memory) {
        return items[_id];
    }
}
