// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title Ownable
 * @dev Simplified ownership contract
 */
abstract contract Ownable {
    address private _owner;
    
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    error OwnableUnauthorizedAccount(address account);
    error OwnableInvalidOwner(address owner);
    
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }
    
    function owner() public view virtual returns (address) {
        return _owner;
    }
    
    modifier onlyOwner() {
        if (owner() != msg.sender) {
            revert OwnableUnauthorizedAccount(msg.sender);
        }
        _;
    }
}

/**
 * @title ReentrancyGuard
 * @dev Contract module that helps prevent reentrant calls
 */
abstract contract ReentrancyGuard {
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    
    uint256 private _status;
    
    error ReentrancyGuardReentrantCall();
    
    constructor() {
        _status = NOT_ENTERED;
    }
    
    modifier nonReentrant() {
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }
}

/**
 * @title CreatorRegistryV4
 * @dev Ultra-simplified smart contract for managing creator registration
 * This version ONLY tracks creator status - no token transfers in the contract
 * Users must transfer tokens separately before calling register
 * 
 * STANDALONE VERSION - All dependencies inlined for easy Remix compilation
 */
contract CreatorRegistryV4 is Ownable, ReentrancyGuard {
    // Platform token contract address (for reference only)
    address public immutable platformToken;
    
    // Registration fee in tokens (100 tokens with 8 decimals)
    uint256 public constant REGISTRATION_FEE = 100 * 10**8;
    
    // Mapping to track creator status
    mapping(address => bool) public isCreator;
    
    // Events
    event CreatorRegistered(address indexed creator, uint256 fee);
    
    // Custom errors
    error AlreadyRegistered(address user);
    error ZeroAddress();
    
    /**
     * @dev Constructor sets the platform token address and initial owner
     * @param _platformToken Address of the HTS platform token
     * @param _owner Address of the contract owner
     */
    constructor(address _platformToken, address _owner) Ownable(_owner) {
        if (_platformToken == address(0)) revert ZeroAddress();
        if (_owner == address(0)) revert ZeroAddress();
        
        platformToken = _platformToken;
    }
    
    /**
     * @dev Register as a creator
     * User must have already transferred the registration fee to this contract
     * This function ONLY marks the user as a creator - no token transfers
     * Requirements:
     * - User must not already be registered as a creator
     */
    function registerAsCreator() external nonReentrant {
        if (isCreator[msg.sender]) {
            revert AlreadyRegistered(msg.sender);
        }
        
        // Simply mark the user as a creator
        // No token transfer logic - that must be done separately
        isCreator[msg.sender] = true;
        
        emit CreatorRegistered(msg.sender, REGISTRATION_FEE);
    }
    
    /**
     * @dev Check if an address is registered as a creator
     * @param user Address to check
     * @return bool True if the address is a registered creator
     */
    function getCreatorStatus(address user) external view returns (bool) {
        return isCreator[user];
    }
    
    /**
     * @dev Get the registration fee amount
     * @return uint256 The registration fee in smallest token units
     */
    function getRegistrationFee() external pure returns (uint256) {
        return REGISTRATION_FEE;
    }
}
