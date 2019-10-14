// use mocha and chai
var Election = artifacts.require("./Election.sol");

contract("Election", function(accounts) {
	var electionInstance;
	it("initialized with two candidates", function() {
		return Election.deployed().then(function(instance) {
			return instance.candidatesCount();
		}).then(function(count) {
			assert.equal(count, 2);
		}); 
	});

	it("initializes the candidates with correct values", function() {
		return Election.deployed().then(function(instance) {
			electionInstance = instance;
			return electionInstance.candidates(1);
		}).then(function(candidate) {
			assert.equal(candidate[0],1,"contains correct id");
			assert.equal(candidate[1],"Candidate 1", "contains correct name");
			assert.equal(candidate[2],0, "contains correct vote count");
			return electionInstance.candidates(2);
		}).then(function(candidate) {
			assert.equal(candidate[0],2,"contains correct id");
			assert.equal(candidate[1],"Candidate 2", "contains correct name");
			assert.equal(candidate[2],0, "contains correct vote count");
			return electionInstance.candidates(2);			
		}); 
	});

	it("allows a voter to cast a vote", function() {
		return Election.deployed().then(function(instance) {
			electionInstance = instance;
			candidateId=1;
			return electionInstance.vote(candidateId, {from: accounts[0]});
		}).then(function(receipt) {
			return electionInstance.voters(accounts[0]);
		}).then(function(voted) {
			assert(voted, "the voter has been marked as voted");
			return electionInstance.candidates(candidateId);
		}).then(function(candidate) {
			var votecount = candidate.voteCount;
			assert.equal(votecount, 1, "increments the candidate's vote count");
		});
	});

	it("throws exception for invalid candidate", function() {
		return Election.deployed().then(function(instance) {
			electionInstance=instance;
			return electionInstance.vote(99, {from: accounts[3]})
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >=0, "error message must contain revert");
			return electionInstance.candidates(1);
		}).then(function(candidate1) {
			var votecount = candidate1.voteCount;
			assert.equal(votecount, 1, "candidate 1 did not receive any votes");
			return electionInstance.candidates(2);
		}).then(function(candidate2) {
			var votecount = candidate2.voteCount;
			assert.equal(votecount, 0, "candidate 2 did not receive any votes");
		});
	});

	it("throws exception on double voting", function() {
		return Election.deployed().then(function(instance) {
			electionInstance = instance;
			candidateId=2;
			electionInstance.vote(candidateId, {from: accounts[5]});
			return electionInstance.candidates(candidateId);
		}).then(function(candidate) {
			var votecount = candidate.voteCount;
			assert.equal(votecount, 1, "accepts first vote");
			return electionInstance.vote(candidateId, {from:accounts[5]});
		}).then(assert.fail).catch(function(error) {
			assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
			return electionInstance.candidates(1);
		}).then(function(candidate1) {
			var votecount = candidate1.voteCount;
			assert.equal(votecount, 1, "candidate 1 did not receive any votes");
			return electionInstance.candidates(2);
		}).then(function(candidate2) {
			var votecount = candidate2.voteCount;
			assert.equal(votecount, 1, "candidate 2 did not receive any votes");
		});
	});
});