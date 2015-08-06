import React from "react";

export default class Lobby extends React.Component {
    render() {
        return (
            <div>
                <div>{this.props.gameCode}</div>
                <button onClick={this.props.onStart}>Start!</button>
            </div>
        );
    }
}
