import Game, {stateType} from "../../server/Game";
import {assert} from "chai";
import sinon from "sinon";

describe("Game", () => {
    beforeEach(function() {
        this.clock = sinon.useFakeTimers();
    });
    afterEach(function() {
        this.clock.restore();
    });
    describe("initial state", () => {
        it("is of type answering", () => {
            var g = new Game();
            assert.equal(g.state.type, stateType.ANSWERING);
        });
    });
});