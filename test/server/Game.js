import Game, {stateType, voteType} from "../../server/Game";
import {assert} from "chai";
import sinon from "sinon";
import _ from "lodash";

describe("Game", () => {
    let clock;
    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });
    afterEach(() => {
        clock.restore();
    });
    describe("initial state", () => {
        let g;
        let state;
        beforeEach(() => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100
            });
            g.onStateChange = sinon.spy();
            state = g.state;
        });
        it("is of type answering", () => {
            assert.equal(state.type, stateType.ANSWERING);
        });
        it("has 5 players", () => {
            assert.equal(state.players.length, 5);
        });
        it("has a question", () => {
            assert.isObject(state.question);
        });
        it("has 9 remaining questions", () => {
            assert.equal(state.private.remainingQuestions.length, 9);
        });
        it("moves to voting after 100 seconds", () => {
            clock.tick(99999);
            assert.equal(g.state.type, stateType.ANSWERING);
            clock.tick(1);
            assert.equal(g.state.type, stateType.VOTING);
        });
        it("fires an onStateChange event", (done) => {
            setTimeout(() => {
                sinon.assert.calledOnce(g.onStateChange);
                done();
            }, 0);
            clock.tick(1);
        });
        describe("each player", () => {
            it("has not answered", () => {
                assert.deepEqual(_.pluck(state.players, "answered"), [false, false, false, false, false]);
            });
            it("has 5 cards", () => {
                assert.deepEqual(state.players.map(p => p.private.cards.length), [5, 5, 5, 5, 5]);
            });
            it("has a score of 0", () => {
                assert.deepEqual(_.pluck(state.players, "score"), [0, 0, 0, 0, 0]);
            });
        });
    });
    describe("getPlayerState", () => {
        let state;
        beforeEach(() => {
            const g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5
            });
            state = g.getPlayerState(0);
        });
        it("has all public properties", () => {
            assert.isDefined(state.type);
            assert.isDefined(state.question);
            assert.isDefined(state.players);
        });
        it("doesn't have any private properties", () => {
            assert.isUndefined(state.private);
        });
        it("has a playerIndex", () => {
            assert.equal(state.playerIndex, 0);
        });
        it("has all public properties of players", () => {
            assert.isDefined(state.players[0].answered);
            assert.isDefined(state.players[1].answered);
            assert.isDefined(state.players[2].answered);
            assert.isDefined(state.players[3].answered);
            assert.isDefined(state.players[4].answered);
        });
        it("doesn't have any private properties of other players", () => {
            assert.isUndefined(state.players[1].private);
            assert.isUndefined(state.players[2].private);
            assert.isUndefined(state.players[3].private);
            assert.isUndefined(state.players[4].private);
        });
        it("has private properties of player", () => {
            assert.isDefined(state.players[0].private);
        });
    });
    describe("answer", () => {
        let g;
        beforeEach(() => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
        });
        it("fires an onStateChange event", (done) => {
            g.onStateChange = sinon.spy();
            g.answer(0, _.range(g.state.question.pick));
            setTimeout(() => {
                sinon.assert.calledTwice(g.onStateChange);
                done();
            }, 0);
            clock.tick(1);
        });
        describe("updated state", () => {
            let state;
            beforeEach(() => {
                g.answer(0, _.range(g.state.question.pick));
                state = g.state;
            });
            it("is of type answering", () => {
                assert.equal(state.type, stateType.ANSWERING);
            });
            it("has 5 players", () => {
                assert.equal(state.players.length, 5);
            });
            it("has a question", () => {
                assert.isObject(state.question);
            });
            it("has 9 remaining questions", () => {
                assert.equal(state.private.remainingQuestions.length, 9);
            });
            describe("answered player", () => {
                let player;
                beforeEach(() => {
                    player = g.state.players[0];
                });
                it("has answered", () => {
                    assert.equal(player.answered, true);
                });
                it("has private answers", () => {
                    assert.equal(player.private.answers.length, g.state.question.pick);
                });
                it("has fewer cards", () => {
                    assert.equal(player.private.cards.length, 5 - g.state.question.pick);
                });
            });
            describe("other players", () => {
                let otherPlayers;
                beforeEach(() => {
                    otherPlayers = g.state.players.slice(1);
                });
                it("has not answered", () => {
                    assert.deepEqual(_.pluck(otherPlayers, "answered"), [false, false, false, false]);
                });
                it("has 5 cards", () => {
                    assert.deepEqual(otherPlayers.map(p => p.private.cards.length), [5, 5, 5, 5]);
                });
            });
            describe("each player", () => {
                it("has a score of 0", () => {
                    assert.deepEqual(_.pluck(state.players, "score"), [0, 0, 0, 0, 0]);
                });
            });
        });
        it("moves to voting state when last player answers", () => {
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            assert.equal(g.state.type, stateType.ANSWERING);
            g.answer(4, _.range(g.state.question.pick));
            assert.equal(g.state.type, stateType.VOTING);
        });
        it("clears the answer timeout when moving to the voting state", () => {
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            g.state.type = 100;
            clock.tick(100000);
            assert.equal(g.state.type, 100);
        });
        it("throws if already answered", () => {
            g.answer(0, _.range(g.state.question.pick));
            assert.throws(() => {
                g.answer(0, _.range(g.state.question.pick));
            });
        });
        it("throws if provided wrong number of answers", () => {
            assert.throws(() => {
                g.answer(0, [0, 1, 2, 3]);
            });
        });
        it("throws if any answer index is out of bounds", () => {
            assert.throws(() => {
                g.answer(0, _.range(g.state.question.pick).map(i => i + 10));
            });
        });
        it("throws if in voting state", () => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            assert.equal(g.state.type, stateType.VOTING);
            assert.throws(() => {
                g.answer(0, _.range(g.state.question.pick));
            });
        });
        it("throws if in scores state", () => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            clock.tick(200000 * 5);
            assert.equal(g.state.type, stateType.SCORES);
            assert.throws(() => {
                g.answer(0, _.range(g.state.question.pick));
            });
        });
        it("throws if in final scores state", () => {
            g = new Game({
                playerCount: 5,
                questionCount: 1,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            clock.tick(200000 * 5);
            assert.equal(g.state.type, stateType.FINAL_SCORES);
            assert.throws(() => {
                g.answer(0, _.range(g.state.question.pick));
            });
        });
    });
    describe("voting state", () => {
        let g;
        let state;
        beforeEach(() => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            state = g.state;
        });
        it("is of type voting", () => {
            assert.equal(state.type, stateType.VOTING);
        });
        it("has 5 players", () => {
            assert.equal(state.players.length, 5);
        });
        it("has a question", () => {
            assert.isObject(state.question);
        });
        it("has 9 remaining questions", () => {
            assert.equal(state.private.remainingQuestions.length, 9);
        });
        it("has an index of a voter", () => {
            assert.isDefined(state.voteeIndex);
        });
        it("has a voting order with 4 remaining votes", () => {
            assert.equal(state.private.voteOrder.length, 4);
        });
        it("has a voteeIndex and voting order that is a random shuffle of the player indexes", () => {
            const voters = [state.voteeIndex].concat(state.private.voteOrder);
            const sortedVoters = _.sortBy(voters);
            assert.deepEqual(sortedVoters, _.range(5));
        });
        describe("each player", () => {
            it("has answered", () => {
                assert.deepEqual(_.pluck(state.players, "answered"), [true, true, true, true, true]);
            });
            it("has cards", () => {
                const cards = 5 - state.question.pick;
                assert.deepEqual(state.players.map(p => p.private.cards.length), [cards, cards, cards, cards, cards]);
            });
            it("has a score of 0", () => {
                assert.deepEqual(_.pluck(state.players, "score"), [0, 0, 0, 0, 0]);
            });
        });
        it("has a questionScore of 0 for the votee", () => {
            assert.equal(state.players[state.voteeIndex].questionScore, 0);
        });
        it("has a public set of answers for the votee", () => {
            assert.equal(state.players[state.voteeIndex].answers.length, state.question.pick);
        });
        it("has a undefined vote for the votee", () => {
            assert.isUndefined(state.players[state.voteeIndex].vote);
        });
        it("has a questionScore of undefined for every player except the votee", () => {
            const otherPlayers = _.at(state.players, state.private.voteOrder);
            assert.deepEqual(_.pluck(otherPlayers, "questionScore"), [undefined, undefined, undefined, undefined]);
        });
        it("does not have a public set of answers for every player except the votee", () => {
            const otherPlayers = _.at(state.players, state.private.voteOrder);
            assert.deepEqual(_.pluck(otherPlayers, "answers"), [undefined, undefined, undefined, undefined]);
        });
        it("has a vote of null for every player except the votee", () => {
            const otherPlayers = _.at(state.players, state.private.voteOrder);
            assert.deepEqual(_.pluck(otherPlayers, "vote"), [null, null, null, null]);
        });
        it("moves to next vote after 200 seconds", () => {
            const firstVoteeIndex = state.voteeIndex;
            clock.tick(199999);
            assert.equal(state.voteeIndex, firstVoteeIndex);
            clock.tick(1);
            assert.notEqual(g.state.voteeIndex, firstVoteeIndex);
        });
        it("resets votes when transitioning to next votee", () => {
            const voterIndex = g.state.private.voteOrder[1]; // Pick a voter that isn't going to the be the next votee
            g.vote(voterIndex, voteType.UP);
            clock.tick(200000);
            assert.equal(g.state.players[voterIndex].vote, null);
        });
        it("keeps question score of previous votee when transitioning to next votee", () => {
            const voteeIndex = g.state.voteeIndex;
            const voterIndex = g.state.private.voteOrder[0];
            g.vote(voterIndex, voteType.UP);
            clock.tick(200000);
            assert.equal(g.state.players[voteeIndex].questionScore, 10);
        });
    });
    describe("vote", () => {
        let g;
        let voterIndex;
        beforeEach(() => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            voterIndex = (g.state.voteeIndex === 0) ? 1 : 0;
        });
        it("fires an onStateChange event", (done) => {
            g.onStateChange = sinon.spy();
            g.vote(voterIndex, voteType.UP);
            setTimeout(() => {
                sinon.assert.callCount(g.onStateChange, 7);
                done();
            }, 0);
            clock.tick(1);
        });
        describe("updated state", () => {
            let state;
            beforeEach(() => {
                g.vote(voterIndex, voteType.UP);
                state = g.state;
            });
            it("is of type voting", () => {
                assert.equal(state.type, stateType.VOTING);
            });
            it("has 5 players", () => {
                assert.equal(state.players.length, 5);
            });
            it("has a question", () => {
                assert.isObject(state.question);
            });
            it("has 9 remaining questions", () => {
                assert.equal(state.private.remainingQuestions.length, 9);
            });
            it("has an index of a voter", () => {
                assert.isDefined(state.voteeIndex);
            });
            it("has a voting order with 4 remaining votes", () => {
                assert.equal(state.private.voteOrder.length, 4);
            });
            it("has a voteeIndex and voting order that is a random shuffle of the player indexes", () => {
                const voters = [state.voteeIndex].concat(state.private.voteOrder);
                const sortedVoters = _.sortBy(voters);
                assert.deepEqual(sortedVoters, _.range(5));
            });
            describe("voter", () => {
                let player;
                beforeEach(() => {
                    player = g.state.players[voterIndex];
                });
                it("has vote value", () => {
                    assert.equal(player.vote, voteType.UP);
                });
            });
            describe("votee", () => {
                let player;
                beforeEach(() => {
                    player = g.state.players[g.state.voteeIndex];
                });
                it("has affected question score", () => {
                    assert.equal(player.questionScore, 10);
                });
            });
            describe("other players", () => {
                let otherPlayers;
                beforeEach(() => {
                    otherPlayers = _.at(state.players, _.without(state.private.voteOrder, voterIndex));
                });
                it("have not voted", () => {
                    assert.deepEqual(_.pluck(otherPlayers, "vote"), [null, null, null]);
                });
            });
            describe("each player", () => {
                it("has answered", () => {
                    assert.deepEqual(_.pluck(state.players, "answered"), [true, true, true, true, true]);
                });
                it("has cards", () => {
                    const cards = 5 - state.question.pick;
                    assert.deepEqual(state.players.map(p => p.private.cards.length), [cards, cards, cards, cards, cards]);
                });
                it("has a score of 0", () => {
                    assert.deepEqual(_.pluck(state.players, "score"), [0, 0, 0, 0, 0]);
                });
            });
        });
        it("decreases the player's score if voted down", () => {
            g.vote(voterIndex, voteType.DOWN);
            assert.equal(g.state.players[g.state.voteeIndex].questionScore, -5);
        });
        it("doesn't move to the next vote when last player votes", () => {
            const voteeIndex = g.state.voteeIndex;
            const voters = _.without(_.range(5), voteeIndex);
            g.vote(voters[0], voteType.UP);
            g.vote(voters[1], voteType.UP);
            g.vote(voters[2], voteType.UP);
            g.vote(voters[3], voteType.UP);
            assert.equal(g.state.voteeIndex, voteeIndex);
        });
        it("throws if already voted", () => {
            g.vote(voterIndex, voteType.UP);
            assert.throws(() => {
                g.answer(voterIndex, voteType.UP);
            });
        });
        it("throws if not a valid vote", () => {
            assert.throws(() => {
                g.answer(voterIndex, 128);
            });
        });
        it("throws if votee is voting on own answer", () => {
            assert.throws(() => {
                g.answer(g.state.voteeIndex, voteType.UP);
            });
        });
        it("throws if in answering state", () => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            assert.throws(() => {
                g.vote(0, voteType.UP);
            });
        });
        it("throws if in scores state", () => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            clock.tick(200000 * 5);
            assert.equal(g.state.type, stateType.SCORES);
            assert.throws(() => {
                g.vote(0, voteType.UP);
            });
        });
        it("throws if in final scores state", () => {
            g = new Game({
                playerCount: 5,
                questionCount: 1,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            clock.tick(200000 * 5);
            assert.equal(g.state.type, stateType.FINAL_SCORES);
            assert.throws(() => {
                g.vote(0, voteType.UP);
            });
        });
    });
    describe("scores state", () => {
        let g;
        let state;
        let winningPlayerIndex;
        beforeEach(() => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            winningPlayerIndex = g.state.voteeIndex;
            const voterIndex = g.state.private.voteOrder[0];
            g.vote(voterIndex, voteType.UP);
            clock.tick(200000 * 5);
            state = g.state;
        });
        it("is of type scores", () => {
            assert.equal(state.type, stateType.SCORES);
        });
        it("has 5 players", () => {
            assert.equal(state.players.length, 5);
        });
        it("has a question", () => {
            assert.isObject(state.question);
        });
        it("has 9 remaining questions", () => {
            assert.equal(state.private.remainingQuestions.length, 9);
        });
        it("does not have an index of a voter", () => {
            assert.isUndefined(state.voteeIndex);
        });
        describe("each player", () => {
            it("has answered", () => {
                assert.deepEqual(_.pluck(state.players, "answered"), [true, true, true, true, true]);
            });
            it("has answers", () => {
                assert.deepEqual(state.players.map(p => p.answers.length === g.state.question.pick), [true, true, true, true, true]);
            });
            it("has cards", () => {
                const cards = 5 - state.question.pick;
                assert.deepEqual(state.players.map(p => p.private.cards.length), [cards, cards, cards, cards, cards]);
            });
            it("has an updated score", () => {
                const scores = [0, 0, 0, 0, 0];
                scores[winningPlayerIndex] = 10;
                assert.deepEqual(_.pluck(state.players, "score"), scores);
            });
            it("has an old score of 0", () => {
                assert.deepEqual(_.pluck(state.players, "oldScore"), [0, 0, 0, 0, 0]);
            });
            it("has a questionScore", () => {
                const scores = [0, 0, 0, 0, 0];
                scores[winningPlayerIndex] = 10;
                assert.deepEqual(_.pluck(state.players, "questionScore"), scores);
            });
            it("does not have a vote", () => {
                assert.deepEqual(_.pluck(state.players, "vote"), [undefined, undefined, undefined, undefined, undefined]);
            });
        });
        it("moves to answering state after 10 seconds", () => {
            clock.tick(9999);
            assert.equal(state.type, stateType.SCORES);
            clock.tick(1);
            assert.equal(g.state.type, stateType.ANSWERING);
        });
    });
    describe("final scores state", () => {
        let g;
        beforeEach(() => {
            g = new Game({
                playerCount: 5,
                questionCount: 1,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            clock.tick(200000 * 5);
            assert.equal(g.state.type, stateType.FINAL_SCORES);
        });
    });
});