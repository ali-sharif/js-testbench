pragma solidity ^0.4.8;

contract EventLogs {
    
    uint public nonce;

    function EventLogs() public {
        nonce = 0;
    }

    event Tigger(address indexed _from, address indexed _to, uint indexed _nonce, uint data);
    event Eeyore(address indexed _from, address indexed _to, uint indexed _nonce, uint data);
    event Kanga(address indexed _from, address indexed _to, uint indexed _nonce, uint data);
    event Roo(address indexed _from, address indexed _to, uint indexed _nonce, uint data);
    event Rabbit(address indexed _from, address indexed _to, uint indexed _nonce, uint data);

    function trigger(address _to, uint _data) public returns (bool success) {
        nonce++;
        Tigger(msg.sender, _to, nonce, _data);
        Eeyore(msg.sender, _to, nonce, _data);
        Kanga(msg.sender, _to, nonce, _data);
        Roo(msg.sender, _to, nonce, _data);
        Rabbit(msg.sender, _to, nonce, _data);
        return true;
    }
}