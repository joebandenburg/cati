import React from "react";
import AnswerCard from "./AnswerCard";

export default class Voting extends React.Component {
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
        const h1Style = {
            color: this.context.muiTheme.component.appBar.textColor,
            textAlign: "center",
            boxSizing: "border-box",
            padding: 48
        };
        const innerStyle = {
            display: "flex",
            flexGrow: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center"
        };
        const cardStyle = {
            flexShrink: 0
        };
        const cards = this.props.answers.map((a, i) => <AnswerCard key={i} hover={false} style={cardStyle}>{a}</AnswerCard>);
        return (
            <div style={containerStyle}>
                <h1 style={h1Style}>{this.props.question.text}</h1>
                <div style={innerStyle}>
                    <h2>{this.props.voteeName} said...</h2>
                    {cards}
                </div>
            </div>
        );
    }
}
Voting.contextTypes = {
    muiTheme: React.PropTypes.object
};