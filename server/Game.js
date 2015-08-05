import {EventEmitter} from "events";
import _ from "lodash";
import cards from "./cards.json";

function pickRandomSubset(indexes, count) {
    return _(indexes).shuffle().take(count).value();
}

function pickRandomQuestions(indexes, count) {
    return pickRandomSubset(indexes, count).map(i => cards.blackCards[i]);
}

function pickRandomAnswers(indexes, count) {
    return pickRandomSubset(indexes, count).map(i => cards.whiteCards[i]);
}

export const stateType = {
    LOBBY: 0,
    ANSWERING: 1,
    VOTING: 2,
    SCORES: 3,
    FINAL_SCORES: 4
};

export const voteType = {
    UP: 1,
    DOWN: 2
};

const scoresTimeoutSeconds = 10;
const voteUpScore = 10;
const voteDownScore = -5;

export default class Game extends EventEmitter {
    constructor({
        questionCount = 10,
        answersInHandCount = 5,
        answerTimeoutSeconds = 30,
        voteTimeoutSeconds = 10
    } = {}) {
        super();

        if (questionCount > cards.blackCards.length) {
            throw new Error("Too many questions");
        }

        this.questionCount = questionCount;
        this.answersInHandCount = answersInHandCount;
        this.answerTimeoutSeconds = answerTimeoutSeconds;
        this.voteTimeoutSeconds = voteTimeoutSeconds;

        this.state = {
            type: stateType.LOBBY,
            players: []
        };
    }
    getPlayerState(playerIndex) {
        const stateForPlayer = _.omit(_.cloneDeep(this.state), "private");
        stateForPlayer.players = stateForPlayer.players.map((p, i) => {
            if (i === playerIndex) {
                return p;
            } else {
                return _.omit(p, "private");
            }
        });
        stateForPlayer.playerIndex = playerIndex;
        return stateForPlayer;
    }
    join() {
        if (this.state.type !== stateType.LOBBY) {
            throw new Error("Cannot join a game in progress");
        }
        const newState = _.cloneDeep(this.state);
        newState.players.push({
        });
        this._setState(newState);
        return newState.players.length - 1;
    }
    start() {
        if (this.state.type !== stateType.LOBBY) {
            throw new Error("Cannot join a game in progress");
        }
        this._transitionToFirstAnsweringState();
    }
    answer(playerIndex, answerIndexes) {
        if (this.state.type !== stateType.ANSWERING) {
            throw new Error("Invalid action");
        }
        const playerState = this.state.players[playerIndex];
        if (playerState.answered) {
            throw new Error("Already answered");
        }
        if (answerIndexes.length !== this.state.question.pick) {
            throw new Error("Wrong number of cards picked");
        }
        if (!answerIndexes.every(i => _.inRange(i, playerState.private.cards.length))) {
            throw new Error("Invalid answer index");
        }
        const newState = _.cloneDeep(this.state);
        const newPlayerState = newState.players[playerIndex];
        [newPlayerState.private.answers, newPlayerState.private.cards] =
            _.partition(playerState.private.cards, (c, i) => _.includes(answerIndexes, i));
        newPlayerState.answered = true;
        const allPlayersPicked = newState.players.every(p => p.answered);
        if (allPlayersPicked) {
            clearTimeout(this.timeout);
            this._transitionToVotingState(newState);
        } else {
            this._setState(newState);
        }
    }
    vote(playerIndex, vote) {
        if (this.state.type !== stateType.VOTING) {
            throw new Error("Invalid action");
        }
        if (!_.includes(_.values(voteType), vote)) {
            throw new Error("Invalid vote");
        }
        if (this.state.voteeIndex === playerIndex) {
            throw new Error("You can't vote on your own answer");
        }
        const oldPlayerState = this.state.players[playerIndex];
        if (oldPlayerState.vote !== null) {
            throw new Error("You can't vote more than once");
        }
        const newState = _.cloneDeep(this.state);
        const newPlayerState = newState.players[playerIndex];
        const newVoteeState = newState.players[this.state.voteeIndex];
        newPlayerState.vote = vote;
        if (vote === voteType.UP) {
            newVoteeState.questionScore += voteUpScore;
        } else {
            newVoteeState.questionScore += voteDownScore;
        }
        this._setState(newState);
    }
    _setState(newState) {
        this.state = newState;
        setTimeout(() => {
            this.emit("stateChanged");
        }, 0);
    }
    _transitionToFirstAnsweringState(oldState = this.state) {
        const questions = pickRandomQuestions(_.range(cards.blackCards.length), this.questionCount);
        const playerAnswerCount = this.answersInHandCount + _.sum(questions.map(q => q.pick));
        const totalAnswerCount = oldState.players.length * playerAnswerCount;
        if (totalAnswerCount > cards.whiteCards.length) {
            throw new Error("Too many questions or players");
        }
        const answers = pickRandomAnswers(_.range(cards.whiteCards.length), totalAnswerCount);
        const newState = {
            players: oldState.players.map(p => ({
                score: 0,
                private: {
                    cards: []
                }
            })),
            private: {
                remainingAnswers: answers,
                remainingQuestions: questions
            }
        };
        this._transitionToAnsweringState(newState);
    }
    _transitionToAnsweringState(oldState = this.state) {
        const [newCards, newRemainingAnswers] = oldState.players.reduce((acc, p) => {
            const cardCountNeeded = this.answersInHandCount - p.private.cards.length;
            const newCards = _.take(acc[1], cardCountNeeded);
            const remainingAnswers = _.drop(acc[1], cardCountNeeded);
            return [acc[0].concat([newCards]), remainingAnswers];
        }, [[], oldState.private.remainingAnswers]);
        const newState = {
            type: stateType.ANSWERING,
            question: _.first(oldState.private.remainingQuestions),
            private: {
                remainingQuestions: _.rest(oldState.private.remainingQuestions),
                remainingAnswers: newRemainingAnswers
            },
            players: oldState.players.map((oldPlayer, i) => ({
                score: oldPlayer.score,
                answered: false,
                private: {
                    cards: oldPlayer.private.cards.concat(newCards[i])
                }
            }))
        };

        this._setState(newState);
        this.timeout = setTimeout(() => {
            this._transitionToVotingState();
        }, this.answerTimeoutSeconds * 1000);
    }
    _transitionToVotingState(oldState = this.state) {
        const newState = _.cloneDeep(oldState);
        newState.type = stateType.VOTING;
        newState.private.voteOrder = _().range(oldState.players.length).shuffle().value();
        newState.players = oldState.players.map(p => {
            let answers, cards;
            if (p.answered) {
                answers = p.private.answers;
                cards = p.private.cards;
            } else {
                const randomAnswerIndexes = pickRandomSubset(_.range(p.private.cards.length), oldState.question.pick);
                [answers, cards] = _.partition(p.private.cards, (c, i) => _.includes(randomAnswerIndexes, i));
            }
            return {
                score: p.score,
                questionScore: 0,
                private: {
                    cards,
                    answers
                }
            };
        });
        this._transitionToNextVotingState(newState);
    }
    _transitionToNextVotingState(oldState = this.state) {
        const newState = _.cloneDeep(oldState);
        newState.voteeIndex = _.first(oldState.private.voteOrder);
        newState.private.voteOrder = _.rest(oldState.private.voteOrder);
        newState.players = oldState.players.map((p, i) => {
            if (i === newState.voteeIndex) {
                return {
                    score: p.score,
                    answers: p.private.answers,
                    questionScore: 0,
                    private: p.private
                };
            } else {
                return {
                    score: p.score,
                    answers: p.answers,
                    vote: null,
                    questionScore: p.questionScore,
                    private: p.private
                };
            }
        });
        this._setState(newState);
        this.timeout = setTimeout(() => {
            if (newState.private.voteOrder.length === 0) {
                this._transitionToScoresState();
            } else {
                this._transitionToNextVotingState();
            }
        }, this.voteTimeoutSeconds * 1000);
    }
    _transitionToScoresState(oldState = this.state) {
        const newState = {
            type: (oldState.private.remainingQuestions.length === 0) ? stateType.FINAL_SCORES : stateType.SCORES,
            question: oldState.question,
            private: oldState.private,
            players: oldState.players.map((p, i) => ({
                score: p.score + p.questionScore,
                answered: p.answered,
                answers: p.answers,
                questionScore: p.questionScore,
                private: p.private,
                oldScore: p.score
            }))
        };
        this._setState(newState);
        if (newState.type === stateType.SCORES) {
            this.timeout = setTimeout(() => {
                this._transitionToAnsweringState();
            }, scoresTimeoutSeconds * 1000);
        }
    }
}
