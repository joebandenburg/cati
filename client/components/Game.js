import React from "react";
import SocketIO from "socket.io-client";
import _ from "lodash";
import Lobby from "./Lobby";
import Answering from "./Answering";
import Answered from "./Answered";
import Voting from "./Voting";
import Scores from "./Scores";

// TODO: Factor out commonality with server
const stateType = {
    LOBBY: 0,
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
        this.socket = SocketIO(undefined, {
            path: "/api/socket"
        });
        this.socket.emit("join game", {
            gameId: this.props.params.id,
            playerName: this.context.playerInfo.name
        });
        this.socket.on("client game state update", newGameState => {
            newGameState.loading = false;
            this.setState(newGameState);
        });
    }
    componentWillUnmount() {
        this.socket.emit("leave game");
        this.socket.removeAllListeners("client game state update");
    }
    start() {
        this.socket.emit("start");
    }
    answer(answerIndex) {
        this.socket.emit("answer", [answerIndex]);
    }
    vote(vote) {
        this.socket.emit("vote", vote);
    }
    render() {
        if (this.state.loading) {
            return <div>Joining...</div>;
        }
        const player = this.state.players[this.state.playerIndex];
        const otherPlayers = _.without(this.state.players, player);
        const otherPlayersAnswered = _.pluck(otherPlayers, "answered");
        switch (this.state.type) {
        case stateType.LOBBY:
            return <Lobby onStart={this.start.bind(this)}
                          playerNames={this.state.players.map(p => p.name)}
                          gameCode={this.props.params.id} />;
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
                           voteeName={"Bob"}
                           answers={votee.answers}
                           onVote={this.vote.bind(this)} />;
        case stateType.SCORES:
        case stateType.FINAL_SCORES:
            return <Scores />;
        }
    }
}
Game.contextTypes = {
    muiTheme: React.PropTypes.object,
    playerInfo: React.PropTypes.object
};

export default Game;