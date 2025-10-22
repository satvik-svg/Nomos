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
 * @title IERC20
 * @dev Standard ERC-20 interface
 * Works with Hedera HTS tokens through facade contracts (HIP-218, HIP-376)
 */
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function associate() external returns (uint256 responseCode);
}

/**
 * @title CreatorRegistryV4
 * @dev HEDERA-COMPATIBLE smart contract for managing creator registration
 * 
 * This contract works with Hedera HTS tokens using ERC-20 interface
 * Thanks to HIP-218 and HIP-376, HTS tokens support standard ERC-20 operations
 * including transferFrom(), approve(), and balanceOf()
 * 
 * Registration Flow:
 * 1. User approves this contract to spend REGISTRATION_FEE tokens
 * 2. User calls registerAsCreator()
 * 3. Contract transfers tokens from user using transferFrom()
 * 4. Contract marks user as creator
 * 
 * STANDALONE VERSION - All dependencies inlined for easy Remix compilation
 */
contract CreatorRegistryV4 is Ownable, ReentrancyGuard {
    // Platform token (HTS token with ERC-20 facade)
    IERC20 public immutable platformToken;
    
    // Registration fee in tokens (100 tokens with 8 decimals)
    uint256 public constant REGISTRATION_FEE = 100 * 10**8;
    
    // Mapping to track creator status
    mapping(address => bool) public isCreator;
    
    // Events
    event CreatorRegistered(address indexed creator, uint256 fee);
    
    // Custom errors
    error AlreadyRegistered(address user);
    error InsufficientBalance(uint256 balance, uint256 required);
    error InsufficientAllowance(uint256 allowance, uint256 required);
    error TokenTransferFailed();
    error ZeroAddress();
    
    /**
     * @dev Constructor sets the platform token address and initial owner
     * Also associates the contract with the token (required for HTS)
     * @param _platformToken Address of the HTS platform token
     * @param _owner Address of the contract owner
     */
    constructor(address _platformToken, address _owner) Ownable(_owner) {
        if (_platformToken == address(0)) revert ZeroAddress();
        if (_owner == address(0)) revert ZeroAddress();
        
        platformToken = IERC20(_platformToken);
        
        // Associate this contract with the token (HIP-719)
        // This is required for the contract to receive HTS tokens
        platformToken.associate();
    }
    
    /**
     * @dev Register as a creator using ERC-20 transferFrom
     * 
     * Requirements:
     * - User must not already be registered as a creator
     * - User must have at least REGISTRATION_FEE tokens
     * - User must have approved this contract to spend at least REGISTRATION_FEE tokens
     * 
     * The function will:
     * 1. Check if user is already registered
     * 2. Verify user has sufficient token balance
     * 3. Verify user has approved sufficient allowance
     * 4. Transfer tokens from user to this contract
     * 5. Mark user as creator
     */
    function registerAsCreator() external nonReentrant {
        if (isCreator[msg.sender]) {
            revert AlreadyRegistered(msg.sender);
        }
        
        // Check user's token balance
        uint256 balance = platformToken.balanceOf(msg.sender);
        if (balance < REGISTRATION_FEE) {
            revert InsufficientBalance(balance, REGISTRATION_FEE);
        }
        
        // Check allowance
        uint256 allowance = platformToken.allowance(msg.sender, address(this));
        if (allowance < REGISTRATION_FEE) {
            revert InsufficientAllowance(allowance, REGISTRATION_FEE);
        }
        
        // Transfer tokens from user to this contract
        // This works with HTS tokens thanks to HIP-218 and HIP-376
        bool success = platformToken.transferFrom(msg.sender, address(this), REGISTRATION_FEE);
        if (!success) {
            revert TokenTransferFailed();
        }
        
        // Mark the user as a creator
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
