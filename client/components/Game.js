import React from "react";
import SocketIO from "socket.io-client";
import _ from "lodash";
import Answering from "./Answering";
import Answered from "./Answered";
import Voting from "./Voting";
import Scores from "./Scores";

// TODO: Factor out commonaility with server
const stateType = {
    ANSWERING: 1,
    VOTING: 2,
    SCORES: 3,
    FINAL_SCORES: 4
};

class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            loading: true
        };
    }
    componentDidMount() {
        this.socket = SocketIO();
        this.socket.on("client game state update", newGameState => {
            newGameState.loading = false;
            this.setState(newGameState);
        });
    }
    answer(answerIndex) {
        this.socket.emit("answer", [answerIndex]);
    }
    vote(vote) {
        this.socket.emit("vote", vote);
    }
    render() {
        if (this.state.loading) {
            return <div></div>;
        }
        const player = this.state.players[this.state.playerIndex];
        const otherPlayers = _.without(this.state.players, player);
        const otherPlayersAnswered = _.pluck(otherPlayers, "answered");
        switch (this.state.type) {
        case stateType.ANSWERING:
            if (!player.answered) {
                return <Answering question={this.state.question}
                                  cards={player.private.cards}
                                  otherPlayersAnswered={otherPlayersAnswered}
                                  onAnswer={this.answer.bind(this)}/>;
            } else {
                return <Answered />;
            }
        case stateType.VOTING:
            const votee = this.state.players[this.state.voteeIndex];
            return <Voting question={this.state.question}
                           isMe={this.state.voteeIndex === this.state.playerIndex}
                           voteeName={votee.name}
                           answered={votee.answered}
                           answers={votee.answers}
                           onVote={this.vote.bind(this)} />;
        case stateType.SCORES:
        case stateType.FINAL_SCORES:
            return <Scores />;
        }
    }
}
Game.contextTypes = {
    muiTheme: React.PropTypes.object
};

export default Game;