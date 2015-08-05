import React from "react";

export default class Lobby extends React.Component {
    render() {
        return (
            <button onClick={this.props.onStart}>Start!</button>
        );
    }
}
