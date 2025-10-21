// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreatorRegistry
 * @dev Smart contract for managing creator registration on the Hedera Content Platform
 * Creators must pay 100 $PLATFORM tokens to register and gain access to premium content features
 */
contract CreatorRegistry is Ownable, ReentrancyGuard {
    // Platform token contract address
    address public immutable platformToken;
    
    // Registration fee in tokens (100 tokens with 8 decimals)
    uint256 public constant REGISTRATION_FEE = 100 * 10**8;
    
    // Mapping to track creator status
    mapping(address => bool) public isCreator;
    
    // Events
    event CreatorRegistered(address indexed creator, uint256 fee);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    
    // Custom errors
    error InsufficientAllowance(uint256 required, uint256 available);
    error AlreadyRegistered(address user);
    error TransferFailed(address token, address from, address to, uint256 amount);
    error ZeroAddress();
    
    /**
     * @dev Constructor sets the platform token address and initial owner
     * @param _platformToken Address of the HTS platform token
     * @param _owner Address of the contract owner who can withdraw fees
     */
    constructor(address _platformToken, address _owner) Ownable(_owner) {
        if (_platformToken == address(0)) revert ZeroAddress();
        if (_owner == address(0)) revert ZeroAddress();
        
        platformToken = _platformToken;
    }
    
    /**
     * @dev Register as a creator by paying the registration fee
     * User must first approve the contract to spend REGISTRATION_FEE tokens
     * Requirements:
     * - User must not already be registered as a creator
     * - User must have approved sufficient tokens for transfer
     * - Token transfer must succeed
     */
    function registerAsCreator() external nonReentrant {
        if (isCreator[msg.sender]) {
            revert AlreadyRegistered(msg.sender);
        }
        
        // Check allowance
        (bool success, bytes memory data) = platformToken.call(
            abi.encodeWithSignature("allowance(address,address)", msg.sender, address(this))
        );
        
        if (!success) {
            revert TransferFailed(platformToken, msg.sender, address(this), REGISTRATION_FEE);
        }
        
        uint256 allowance = abi.decode(data, (uint256));
        if (allowance < REGISTRATION_FEE) {
            revert InsufficientAllowance(REGISTRATION_FEE, allowance);
        }
        
        // Transfer tokens from user to contract
        (bool transferSuccess,) = platformToken.call(
            abi.encodeWithSignature("transferFrom(address,address,uint256)", msg.sender, address(this), REGISTRATION_FEE)
        );
        
        if (!transferSuccess) {
            revert TransferFailed(platformToken, msg.sender, address(this), REGISTRATION_FEE);
        }
        
        // Set creator status
        isCreator[msg.sender] = true;
        
        emit CreatorRegistered(msg.sender, REGISTRATION_FEE);
    }
    
    /**
     * @dev Withdraw accumulated registration fees (owner only)
     * Transfers all platform tokens held by the contract to the owner
     */
    function withdrawFees() external onlyOwner nonReentrant {
        // Get contract's token balance
        (bool success, bytes memory data) = platformToken.call(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        
        if (!success) {
            revert TransferFailed(platformToken, address(this), owner(), 0);
        }
        
        uint256 balance = abi.decode(data, (uint256));
        
        if (balance > 0) {
            // Transfer tokens to owner
            (bool transferSuccess,) = platformToken.call(
                abi.encodeWithSignature("transfer(address,uint256)", owner(), balance)
            );
            
            if (!transferSuccess) {
                revert TransferFailed(platformToken, address(this), owner(), balance);
            }
            
            emit FeesWithdrawn(owner(), balance);
        }
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
     * @dev Get the current contract balance of platform tokens
     * @return uint256 Current balance of platform tokens held by the contract
     */
    function getContractBalance() external view returns (uint256) {
        (bool success, bytes memory data) = platformToken.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        
        if (!success) {
            return 0;
        }
        
        return abi.decode(data, (uint256));
    }
}