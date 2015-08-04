import React from "react";
import AnswerCard from "./AnswerCard";

export default class Answering extends React.Component {
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
        const answers = this.props.cards;
        const cards = answers.map((a, i) => {
            const cardStyle = {
                position: "absolute",
                transformOrigin: "0% 300%",
                transform: "rotate(" + (0.5 + i - answers.length / 2) * 15 + "deg) translateX(-50%)",
                zIndex: i
            };
            return <AnswerCard style={cardStyle} key={i} onClick={this.props.onAnswer.bind(this, i)}>{a}</AnswerCard>;
        });
        const question = this.props.question;
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
Answering.contextTypes = {
    muiTheme: React.PropTypes.object
};
