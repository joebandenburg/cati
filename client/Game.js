import _ from "lodash";
import cards from "../cards.json";

function pickRandomSubset(indexes, count) {
    return _(indexes).shuffle().take(count).value();
}

function pickRandomQuestions(indexes, count) {
    return pickRandomSubset(indexes, count).map(i => cards.blackCards[i]);
}

function pickRandomAnswers(indexes, count) {
    return pickRandomSubset(indexes, count).map(i => cards.whiteCards[i]);
}

export default class Game {
    constructor({playerCount = 5, questionCount = 10, answersInHandCount = 5} = {}) {
        if (questionCount > cards.blackCards.length) {
            throw new Error("Too many questions");
        }
        this.questions = pickRandomQuestions(_.range(cards.blackCards.length), questionCount);
        const playerAnswerCount = answersInHandCount + _.sum(this.questions.map(q => q.pick));
        const totalAnswerCount = playerCount * playerAnswerCount;
        if (totalAnswerCount > cards.whiteCards.length) {
            throw new Error("Too many questions or players");
        }
        const answers = pickRandomAnswers(_.range(cards.whiteCards.length), totalAnswerCount);
        this.players = _.range(playerCount).map(i => ({
            answers: answers.slice(i * playerAnswerCount, (i + 1) * playerAnswerCount)
        }));
    }
}
