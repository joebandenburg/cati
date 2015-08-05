import Game, {stateType, voteType} from "../../server/Game";
import {assert} from "chai";
import sinon from "sinon";
import _ from "lodash";

describe("Game", () => {
    let clock;
    let g;
    beforeEach(() => {
        clock = sinon.useFakeTimers();
        g = new Game({
            playerCount: 5,
            questionCount: 10,
            answersInHandCount: 5,
            answerTimeoutSeconds: 100,
            voteTimeoutSeconds: 200
        });
        g.onStateChange = sinon.spy();
    });
    afterEach(() => {
        clock.restore();
    });
    it("is initially in lobby state", () => {
        assert.equal(g.state.type, stateType.LOBBY);
    });
    describe("in lobby state", () => {
        describe("state", () => {
            it("has an empty list of players", () => {
                assert.equal(g.state.players.length, 0);
            });
        });
        describe("join", () => {
            it("adds a new player to the end of the list of players", () => {
                g.join();
                assert.equal(g.state.players.length, 1);
            });
            it("returns the index of the newly created player", () => {
                assert.equal(g.join(), 0);
                assert.equal(g.join(), 1);
            });
        });
        describe("start", () => {
            it("transitions to the answering state", () => {
                g.start();
                assert.equal(g.state.type, stateType.ANSWERING);
            });
        });
        describe("answer", () => {
            it("throws", () => {
                assert.throws(() => g.answer(0, [0]));
            });
        });
        describe("vote", () => {
            it("throws", () => {
                assert.throws(() => g.vote(0, voteType.UP));
            });
        });
    });
    describe("in answering state", () => {
        beforeEach(() => {
            g.join();
            g.join();
            g.join();
            g.join();
            g.join();
            g.start();
            assert.equal(g.state.type, stateType.ANSWERING);
        });
        it("transitions to voting after 100 seconds", () => {
            clock.tick(99999);
            assert.equal(g.state.type, stateType.ANSWERING);
            clock.tick(1);
            assert.equal(g.state.type, stateType.VOTING);
        });
        it("maintains the answers for players who have answered", () => {
            const answers = _.take(g.state.players[0].private.cards, g.state.question.pick);
            g.answer(0, _.range(g.state.question.pick));
            clock.tick(100000);
            assert.deepEqual(g.state.players[0].private.answers, answers);
        });
        it("randomly picks cards for players who have not answered", () => {
            clock.tick(100000);
            assert.equal(g.state.players[0].private.answers.length, g.state.question.pick);
        });
        describe("state", () => {
            it("is of type answering", () => {
                assert.equal(g.state.type, stateType.ANSWERING);
            });
            it("has 5 players", () => {
                assert.equal(g.state.players.length, 5);
            });
            it("has a question", () => {
                assert.isObject(g.state.question);
            });
            it("has 9 remaining questions", () => {
                assert.equal(g.state.private.remainingQuestions.length, 9);
            });
            describe("each player", () => {
                it("has not answered", () => {
                    assert.deepEqual(_.pluck(g.state.players, "answered"), [false, false, false, false, false]);
                });
                it("has 5 cards", () => {
                    assert.deepEqual(g.state.players.map(p => p.private.cards.length), [5, 5, 5, 5, 5]);
                });
                it("has a score of 0", () => {
                    assert.deepEqual(_.pluck(g.state.players, "score"), [0, 0, 0, 0, 0]);
                });
            });
        });
        describe("join", () => {
            it("throws", () => {
                assert.throws(() => g.join());
            });
        });
        describe("start", () => {
            it("throws", () => {
                assert.throws(() => g.start());
            });
        });
        describe("answer", () => {
            it("fires an onStateChange event", (done) => {
                g.answer(0, _.range(g.state.question.pick));
                setTimeout(() => {
                    sinon.assert.callCount(g.onStateChange, 7);
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
        });
        describe("vote", () => {
            it("throws", () => {
                assert.throws(() => g.vote(0, voteType.UP));
            });
        });
    });
    describe("in voting state", () => {
        let voterIndex;
        beforeEach(() => {
            g.join();
            g.join();
            g.join();
            g.join();
            g.join();
            g.start();
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            assert.equal(g.state.type, stateType.VOTING);
            voterIndex = g.state.private.voteOrder[1];
        });
        it("transitions to next vote after 200 seconds", () => {
            const firstVoteeIndex = g.state.voteeIndex;
            clock.tick(199999);
            assert.equal(g.state.voteeIndex, firstVoteeIndex);
            clock.tick(1);
            assert.notEqual(g.state.voteeIndex, firstVoteeIndex);
        });
        it("resets votes when transitioning to next votee", () => {
            g.vote(voterIndex, voteType.UP);
            clock.tick(200000);
            assert.equal(g.state.players[voterIndex].vote, null);
        });
        it("keeps question score of previous votee when transitioning to next votee", () => {
            const voteeIndex = g.state.voteeIndex;
            g.vote(voterIndex, voteType.UP);
            clock.tick(200000);
            assert.equal(g.state.players[voteeIndex].questionScore, 10);
        });
        describe("state", () => {
            it("is of type voting", () => {
                assert.equal(g.state.type, stateType.VOTING);
            });
            it("has 5 players", () => {
                assert.equal(g.state.players.length, 5);
            });
            it("has a question", () => {
                assert.isObject(g.state.question);
            });
            it("has 9 remaining questions", () => {
                assert.equal(g.state.private.remainingQuestions.length, 9);
            });
            it("has an index of a voter", () => {
                assert.isDefined(g.state.voteeIndex);
            });
            it("has a voting order with 4 remaining votes", () => {
                assert.equal(g.state.private.voteOrder.length, 4);
            });
            it("has a voteeIndex and voting order that is a random shuffle of the player indexes", () => {
                const voters = [g.state.voteeIndex].concat(g.state.private.voteOrder);
                const sortedVoters = _.sortBy(voters);
                assert.deepEqual(sortedVoters, _.range(5));
            });
            describe("each player", () => {
                it("doesn't have an answered field", () => {
                    assert.deepEqual(_.pluck(g.state.players, "answered"), [undefined, undefined, undefined, undefined, undefined]);
                });
                it("has cards", () => {
                    const cards = 5 - g.state.question.pick;
                    assert.deepEqual(g.state.players.map(p => p.private.cards.length), [cards, cards, cards, cards, cards]);
                });
                it("has a score of 0", () => {
                    assert.deepEqual(_.pluck(g.state.players, "score"), [0, 0, 0, 0, 0]);
                });
                it("has a questionScore of 0", () => {
                    assert.deepEqual(_.pluck(g.state.players, "questionScore"), [0, 0, 0, 0, 0]);
                });
            });
            it("has a questionScore of 0 for the votee", () => {
                assert.equal(g.state.players[g.state.voteeIndex].questionScore, 0);
            });
            it("has a public set of answers for the votee", () => {
                assert.equal(g.state.players[g.state.voteeIndex].answers.length, g.state.question.pick);
            });
            it("has a undefined vote for the votee", () => {
                assert.isUndefined(g.state.players[g.state.voteeIndex].vote);
            });
            it("does not have a public set of answers for every player except the votee", () => {
                const otherPlayers = _.at(g.state.players, g.state.private.voteOrder);
                assert.deepEqual(_.pluck(otherPlayers, "answers"), [undefined, undefined, undefined, undefined]);
            });
            it("has a vote of null for every player except the votee", () => {
                const otherPlayers = _.at(g.state.players, g.state.private.voteOrder);
                assert.deepEqual(_.pluck(otherPlayers, "vote"), [null, null, null, null]);
            });
        });
        describe("join", () => {
            it("throws", () => {
                assert.throws(() => g.join());
            });
        });
        describe("start", () => {
            it("throws", () => {
                assert.throws(() => g.start());
            });
        });
        describe("answer", () => {
            it("throws", () => {
                assert.throws(() => {
                    g.answer(0, _.range(g.state.question.pick));
                });
            });
        });
        describe("vote", () => {
            it("fires an onStateChange event", (done) => {
                g.vote(voterIndex, voteType.UP);
                setTimeout(() => {
                    sinon.assert.callCount(g.onStateChange, 12);
                    done();
                }, 0);
                clock.tick(1);
            });
            describe("updated state", () => {
                beforeEach(() => {
                    g.vote(voterIndex, voteType.UP);
                });
                it("is of type voting", () => {
                    assert.equal(g.state.type, stateType.VOTING);
                });
                it("has 5 players", () => {
                    assert.equal(g.state.players.length, 5);
                });
                it("has a question", () => {
                    assert.isObject(g.state.question);
                });
                it("has 9 remaining questions", () => {
                    assert.equal(g.state.private.remainingQuestions.length, 9);
                });
                it("has an index of a voter", () => {
                    assert.isDefined(g.state.voteeIndex);
                });
                it("has a voting order with 4 remaining votes", () => {
                    assert.equal(g.state.private.voteOrder.length, 4);
                });
                it("has a voteeIndex and voting order that is a random shuffle of the player indexes", () => {
                    const voters = [g.state.voteeIndex].concat(g.state.private.voteOrder);
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
                        otherPlayers = _.at(g.state.players, _.without(g.state.private.voteOrder, voterIndex));
                    });
                    it("have not voted", () => {
                        assert.deepEqual(_.pluck(otherPlayers, "vote"), [null, null, null]);
                    });
                });
                describe("each player", () => {
                    it("has cards", () => {
                        const cards = 5 - g.state.question.pick;
                        assert.deepEqual(g.state.players.map(p => p.private.cards.length), [cards, cards, cards, cards, cards]);
                    });
                    it("has a score of 0", () => {
                        assert.deepEqual(_.pluck(g.state.players, "score"), [0, 0, 0, 0, 0]);
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
        });
    });
    describe("in scores state", () => {
        let winningPlayerIndex;
        beforeEach(() => {
            g.join();
            g.join();
            g.join();
            g.join();
            g.join();
            g.start();
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            winningPlayerIndex = g.state.voteeIndex;
            const voterIndex = g.state.private.voteOrder[0];
            g.vote(voterIndex, voteType.UP);
            clock.tick(200000 * 5);
            assert.equal(g.state.type, stateType.SCORES);
        });
        it("transitions to answering state after 10 seconds", () => {
            clock.tick(9999);
            assert.equal(g.state.type, stateType.SCORES);
            clock.tick(1);
            assert.equal(g.state.type, stateType.ANSWERING);
        });
        describe("state", () => {
            it("is of type scores", () => {
                assert.equal(g.state.type, stateType.SCORES);
            });
            it("has 5 players", () => {
                assert.equal(g.state.players.length, 5);
            });
            it("has a question", () => {
                assert.isObject(g.state.question);
            });
            it("has 9 remaining questions", () => {
                assert.equal(g.state.private.remainingQuestions.length, 9);
            });
            it("does not have an index of a voter", () => {
                assert.isUndefined(g.state.voteeIndex);
            });
            describe("each player", () => {
                it("has answers", () => {
                    assert.deepEqual(g.state.players.map(p => p.answers.length === g.state.question.pick), [true, true, true, true, true]);
                });
                it("has cards", () => {
                    const cards = 5 - g.state.question.pick;
                    assert.deepEqual(g.state.players.map(p => p.private.cards.length), [cards, cards, cards, cards, cards]);
                });
                it("has an updated score", () => {
                    const scores = [0, 0, 0, 0, 0];
                    scores[winningPlayerIndex] = 10;
                    assert.deepEqual(_.pluck(g.state.players, "score"), scores);
                });
                it("has an old score of 0", () => {
                    assert.deepEqual(_.pluck(g.state.players, "oldScore"), [0, 0, 0, 0, 0]);
                });
                it("has a questionScore", () => {
                    const scores = [0, 0, 0, 0, 0];
                    scores[winningPlayerIndex] = 10;
                    assert.deepEqual(_.pluck(g.state.players, "questionScore"), scores);
                });
                it("does not have a vote", () => {
                    assert.deepEqual(_.pluck(g.state.players, "vote"), [undefined, undefined, undefined, undefined, undefined]);
                });
            });
        });
        describe("join", () => {
            it("throws", () => {
                assert.throws(() => g.join());
            });
        });
        describe("start", () => {
            it("throws", () => {
                assert.throws(() => g.start());
            });
        });
        describe("answer", () => {
            it("throws", () => {
                assert.throws(() => {
                    g.answer(0, _.range(g.state.question.pick));
                });
            });
        });
        describe("vote", () => {
            it("throws", () => {
                assert.throws(() => g.vote(0, voteType.UP));
            });
        });
    });
    describe("next answering state", () => {
        let winningPlayerIndex;
        beforeEach(() => {
            g.join();
            g.join();
            g.join();
            g.join();
            g.join();
            g.start();
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            winningPlayerIndex = g.state.voteeIndex;
            const voterIndex = g.state.private.voteOrder[0];
            g.vote(voterIndex, voteType.UP);
            clock.tick(200000 * 5 + 10000);
        });
        describe("state", () => {
            it("is of type answering", () => {
                assert.equal(g.state.type, stateType.ANSWERING);
            });
            it("has 5 players", () => {
                assert.equal(g.state.players.length, 5);
            });
            it("has a question", () => {
                assert.isObject(g.state.question);
            });
            it("has 8 remaining questions", () => {
                assert.equal(g.state.private.remainingQuestions.length, 8);
            });
            describe("each player", () => {
                it("has not answered", () => {
                    assert.deepEqual(_.pluck(g.state.players, "answered"), [false, false, false, false, false]);
                });
                it("has 5 cards", () => {
                    assert.deepEqual(g.state.players.map(p => p.private.cards.length), [5, 5, 5, 5, 5]);
                });
                it("has an updated score", () => {
                    const scores = [0, 0, 0, 0, 0];
                    scores[winningPlayerIndex] = 10;
                    assert.deepEqual(_.pluck(g.state.players, "score"), scores);
                });
            });
        });
    });
    describe("in final scores state", () => {
        beforeEach(() => {
            g = new Game({
                playerCount: 5,
                questionCount: 1,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100,
                voteTimeoutSeconds: 200
            });
            g.join();
            g.join();
            g.join();
            g.join();
            g.join();
            g.start();
            g.answer(0, _.range(g.state.question.pick));
            g.answer(1, _.range(g.state.question.pick));
            g.answer(2, _.range(g.state.question.pick));
            g.answer(3, _.range(g.state.question.pick));
            g.answer(4, _.range(g.state.question.pick));
            clock.tick(200000 * 5);
            assert.equal(g.state.type, stateType.FINAL_SCORES);
        });
        describe("join", () => {
            it("throws", () => {
                assert.throws(() => g.join());
            });
        });
        describe("start", () => {
            it("throws", () => {
                assert.throws(() => g.start());
            });
        });
        describe("answer", () => {
            it("throws", () => {
                assert.throws(() => {
                    g.answer(0, _.range(g.state.question.pick));
                });
            });
        });
        describe("vote", () => {
            it("throws", () => {
                assert.throws(() => g.vote(0, voteType.UP));
            });
        });
    });
    describe("getPlayerState", () => {
        let state;
        beforeEach(() => {
            g.join();
            g.join();
            g.join();
            g.join();
            g.join();
            g.start();
            assert.equal(g.state.type, stateType.ANSWERING);
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
});