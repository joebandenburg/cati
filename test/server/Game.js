import Game, {stateType} from "../../server/Game";
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
            it("has a position based on their index", () => {
                assert.deepEqual(_.pluck(state.players, "position"), [0, 1, 2, 3, 4]);
            });
        });
    });
    describe("answer", () => {
        let g;
        beforeEach(() => {
            g = new Game({
                playerCount: 5,
                questionCount: 10,
                answersInHandCount: 5,
                answerTimeoutSeconds: 100
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
                it("has a position based on their index", () => {
                    assert.deepEqual(_.pluck(state.players, "position"), [0, 1, 2, 3, 4]);
                });
            });
        });
        it("throws if not in answering state", () => {

        });
        it("throws if already answered", () => {

        });
        it("throws if provided wrong number of answers", () => {

        });
        it("throws if any answer index is out of bounds", () => {

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
});