// SPDX-License-Identifier: MIT

pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

error MAX_BENEFICIERIES_REACHED();
error NO_AMOUNT_TO_BE_REALEASED();

contract Vesting is ERC20, Ownable {
    using SafeMath for uint256;
    uint256 private tokenPerMinute = (100000000 * 10**decimals()) / 525600; //year contains 525600 min.

    uint256 private startTime;
    address[] private beneficieries;
    uint256 constant maxBeneficieries = 10;
    uint256 private currentBeneficiery = 1;
    uint256 private released = 0;

    constructor() ERC20("MyToken", "XYZ") {
        _mint(msg.sender, 100000000 * 10**decimals()); //100,000,000 from start
        startTime = block.timestamp;
        beneficieries.push(msg.sender);
    }

    function addBeneficiery(address _beneficiery) public onlyOwner {
        if (currentBeneficiery >= maxBeneficieries) {
            revert MAX_BENEFICIERIES_REACHED();
        }

        releaseAllTokens();

        beneficieries.push(_beneficiery);
        currentBeneficiery++;
    }

    function releaseAllTokens() public {
        uint256 unreleased = releasableAmount();

        released = released.add(unreleased);
        uint256 individualRelease = unreleased / beneficieries.length;

        startTime = block.timestamp;

        for (uint i = 0; i < beneficieries.length; i++) {
            release(beneficieries[i], individualRelease);
        }
    }

    function releasableAmount() public view returns (uint256) {
        uint256 totalTime = block.timestamp - startTime;
        uint256 totalTimeInMinutes = totalTime / 60 seconds;

        uint256 unreleasedAmount = tokenPerMinute.mul(totalTimeInMinutes);

        return unreleasedAmount;
    }

    function vestedAmount() public view returns (uint256) {
        uint256 currentBalance = balanceOf(address(this));
        uint256 totalBalance = currentBalance.add(released);

        return totalBalance;
    }

    function release(address _beneficiary, uint256 _amount) private {
        transfer(_beneficiary, _amount);
    }

    function getBeneficiary(uint256 _index) public view returns (address) {
        return beneficieries[_index];
    }

    function getStartTime() public view returns (uint256) {
        return startTime;
    }

    function getTotalBeneficiaries() public view returns (uint256) {
        return currentBeneficiery;
    }
}
