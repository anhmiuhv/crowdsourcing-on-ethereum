pragma solidity ^0.5.0;
import "./Crowdsourcing.sol";

contract CrdSet {
    Crowdsourcing[] public list;
    event newContract(Crowdsourcing indexed c);

    function createCC(uint total, string memory content) public payable returns (Crowdsourcing){
        require(msg.value % total == 0, "Amount of money need to be dividable by the total number of answers");
        Crowdsourcing a = new Crowdsourcing(msg.sender, total, content, msg.value);
        list.push(a);
        address(a).transfer(msg.value);
        emit newContract(a);
        return a;
    }
    
    function getContracCount() public view returns (uint) {
        return list.length;
    }
    
}