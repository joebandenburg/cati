import React from "react";
import mui from "material-ui";
import GameModel from "../Game";

class Card extends React.Component {
    constructor() {
        super();
        this.state = {
            hover: false
        };
    }
    onMouseOver() {
        this.setState({
            hover: true
        });
    }
    onMouseOut() {
        this.setState({
            hover: false
        });
    }
    render() {
        const style = {
            position: "absolute",
            width: 200,
            height: 300,
            padding: 16,
            fontSize: 20,
            borderRadius: 10,
            transformOrigin: "0% 300%",
            transform: "rotate(" + (0.5 + this.props.i - this.props.n / 2) * 15 + "deg) translateX(-50%)",
            transition: "transform 0.5s, box-shadow 0.1s",
            zIndex: this.props.n + (this.state.hover ? 100 : 0)
        };
        return (
            <mui.Paper zDepth={this.state.hover ? 3 : 1}
                       transitionEnabled={true}
                       style={style}
                       onMouseOver={this.onMouseOver.bind(this)}
                       onMouseOut={this.onMouseOut.bind(this)}>
                {this.props.children}
            </mui.Paper>
        );
    }
}

class Game extends React.Component {
    constructor() {
        super();
        this.state = {
            game: new GameModel({
                questionCount: 1
            })
        };
    }
    render() {
        const containerStyle = {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: this.context.muiTheme.component.appBar.color
        };
        const innerStyle = {
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            flexGrow: 1,
            marginTop: 24
        };
        const h1Style = {
            color: this.context.muiTheme.component.appBar.textColor,
            textAlign: "center",
            boxSizing: "border-box",
            width: "100%",
            padding: 24
        };
        const answers = this.state.game.players[0].answers.slice(0, 5);
        const cards = answers.map((a, n) => <Card i={n} n={5} key={n}>{a}</Card>);
        const question = this.state.game.questions[0];
        const pickMessage = (question.pick === 1) ? "Pick a card." : "Pick " + question.pick + " cards.";
        return (
            <div style={containerStyle}>
                <h1 style={h1Style}>{question.text}</h1>
                <h2>{pickMessage}</h2>
                <div style={innerStyle}>
                    {cards}
                </div>
            </div>
        );
    }
}
Game.contextTypes = {
    muiTheme: React.PropTypes.object
};

export default Game;