const Swap = artifacts.require("swap");
const PowerToken = artifacts.require("powerToken");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const assert = require('assert');

contract('swap', accounts => {
    const [owner, user1, user2, user3] = accounts;
    let swapInstance;
    let tokenInstance;

    beforeEach(async () => {
        tokenInstance = await PowerToken.new({ from: owner });
        swapInstance = await Swap.new(tokenInstance.address, { from: owner });
    });

    describe('Initialization', function () {
        it('should only allow the owner to initialize', async () => {
            const userAddresses = [user1, user2, user3];
            await expectRevert(
                swapInstance.init(userAddresses, { from: user1 }),
                "Ownable: caller is not the owner"  // Correct this line to match the actual error message
            );
        });
    });
    
    describe('Token buying', function () {
        it('allows users to buy tokens after transfer of token ownership to swap', async () => {
            // Transfer ownership to allow token minting
            await tokenInstance.transferOwnership(swapInstance.address, { from: owner });
    
            const purchaseAmount = web3.utils.toWei('1', 'ether');
            await swapInstance.buyTokens({ from: user1, value: purchaseAmount });
    
            const expectedTokenAmount = new BN(purchaseAmount).div(new BN(await swapInstance.tokenPrice()));
            const actualTokenAmount = await tokenInstance.balanceOf(user1);
            assert.strictEqual(actualTokenAmount.toString(), expectedTokenAmount.toString(), "Token amount did not match expected value");
        });
    });

    describe('Token deposit', function () {
        it('allows users to deposit tokens', async () => {
            const tokensToBuy = new BN(100);
            await tokenInstance.mint(user1, tokensToBuy, { from: owner });
            await tokenInstance.approve(swapInstance.address, tokensToBuy, { from: user1 });
            
            await swapInstance.depositTokens(user1, { from: user1 });
            const tokensInContract = await tokenInstance.balanceOf(swapInstance.address);
            assert.strictEqual(tokensInContract.toString(), tokensToBuy.toString(), "Tokens were not deposited correctly");
        });
    });

    describe('Battery Management', function () {
        it('handles the complete battery swap process', async () => {
            // Assuming user1 has enough tokens and has approved the swap contract
            await tokenInstance.mint(user1, web3.utils.toWei('1000', 'ether'), { from: owner });
            await tokenInstance.approve(swapInstance.address, web3.utils.toWei('1000', 'ether'), { from: user1 });
    
            // Ensure there are batteries initialized at the station
            // Assuming initialization or direct setting in the setup phase
            // For example, let's assume battery ID 1 is initialized and set to the station
            await swapInstance.init([user1], { from: owner });  // This method should set some batteries to the station
    
            // User1 deposits tokens
            await swapInstance.depositTokens(user1, { from: user1 });
    
            // Deposit a battery belonging to user1
            const userInitialBatteryId = (await swapInstance.userBattery(user1)).id;
            await swapInstance.depositBattery(userInitialBatteryId, user1, { from: user1 });
    
            // Ensure the battery is at the station
            let batteryAtStation = await swapInstance.batteryMap(1); // Check a specific battery known to be initialized to the station
            assert.strictEqual(batteryAtStation.location.toString(), '1', "Battery should be at the STATION");
    
            // User1 tries to collect the battery from the station
            await swapInstance.collectBattery(1,user1, { from: user1 });  // Ensure this battery is at the station
    
            // Verify collection
            const collectedBattery = await swapInstance.batteryMap(1);
            assert.strictEqual(collectedBattery.location.toString(), '0', "Battery should be with the user");
    
            // Check the user state is updated to COLLECTED
            const userState = await swapInstance.userStates(user1);
            assert.strictEqual(userState.toString(), '2', "User state should be COLLECTED");
        });
    });           
});
