const { expectRevert, time } = require('@openzeppelin/test-helpers');
const token = artifacts.require('Aravindh');
//const MockERC20 = artifacts.require('MockERC20');

contract('MasterChef', ([alice, bob, lucy, ed, minter]) => {

    var tokenInstance;

    beforeEach(async () => {
        tokenInstance = await token.new({ from: minter });
    });

    it('check the BalanceOfAt function', async () => {
        await tokenInstance.delegate(alice, '0', {from: alice});
        await tokenInstance.mint(alice, "10000000000000000000", { from: minter });
        await tokenInstance.mint(alice, "10000000000000000000", { from: minter });

        //BalanceAt check block-wise
        let getBal = await tokenInstance.BalanceOfAt(alice, "5");
        assert.equal(Number(getBal), Number("10000000000000000000")); // Except 10e18
    });

    it('Delegates with percentage', async () => {
        await tokenInstance.delegate(bob, '0', {from: bob});        
        await tokenInstance.delegate(lucy, '0', {from: lucy});      
        await tokenInstance.delegate(ed, '0', {from: ed});
        await tokenInstance.mint(bob, "20000000000000000000", { from: minter });
        await tokenInstance.mint(lucy,"10000000000000000000", { from: minter });
        await time.advanceBlockTo('15');
        assert.equal((await tokenInstance.BalanceOfAt(bob,14)), ("20000000000000000000")); // Except 20e18
        assert.equal((await tokenInstance.BalanceOfAt(lucy,14)), ("10000000000000000000")); // Except 10e18
        assert.equal((await tokenInstance.BalanceOfAt(ed,14)), ("0")); // Except 0   
        
        // bob delegate 50% votes to Lucy        
        await tokenInstance.delegate(lucy, 50, {from: bob});
        await time.advanceBlockTo('20');
        assert.equal((await tokenInstance.BalanceOfAt(bob,19)), ("10000000000000000000")); 
        assert.equal((await tokenInstance.BalanceOfAt(lucy,19)), ("20000000000000000000")); 
        await tokenInstance.delegate(ed, 50, {from: bob});        
        await time.advanceBlockTo('23');
        assert.equal((await tokenInstance.BalanceOfAt(bob,22)), ("5000000000000000000")); 
        assert.equal((await tokenInstance.BalanceOfAt(lucy,22)), ("20000000000000000000")); 
        assert.equal((await tokenInstance.BalanceOfAt(ed,22)), ("5000000000000000000")); 

        // ed receive 15 tokens     
        await tokenInstance.mint(ed, "15000000000000000000", { from: minter });
        await time.advanceBlockTo('30');
        assert.equal((await tokenInstance.BalanceOfAt(ed,29)), ("20000000000000000000")); 
        await tokenInstance.delegate(lucy, 50, {from: ed});
        await tokenInstance.delegate(bob, 50, {from: ed});
        await time.advanceBlockTo('40');
        assert.equal((await tokenInstance.BalanceOfAt(ed,39)), ("5000000000000000000")); 
        assert.equal((await tokenInstance.BalanceOfAt(lucy,39)), ("30000000000000000000"));        
        assert.equal((await tokenInstance.BalanceOfAt(bob,39)), ("10000000000000000000")); 
        
        // Lucy delegated 100% vote power
        await tokenInstance.delegate(ed, 0, {from : lucy});        
        await time.advanceBlockTo('45');
        assert.equal((await tokenInstance.BalanceOfAt(ed,44)), ("15000000000000000000")); 
        assert.equal((await tokenInstance.BalanceOfAt(lucy,44)), ("20000000000000000000")); 
    }) 
    
    it('failure case', async () => { 
        await expectRevert( tokenInstance.delegate(lucy, 200, {from: ed}), "Aravindh:: percentage should be  valid");
    });
});