import React from "react";
import mui from "material-ui";

const Colors = mui.Styles.Colors;

class Player extends React.Component {
    render() {
        const containerStyle = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingLeft: 16,
            paddingRight: 16
        };
        const avatarStyle = {
            textTransform: "uppercase",
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: this.props.color,
            color: this.props.textColor,
            fontSize: 32,
            lineHeight: "48px",
            textAlign: "center"
        };
        const nameStyle = {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: "48px",
            color: Colors.darkBlack
        };
        return (
            <div style={containerStyle}>
                <div style={avatarStyle}>{this.props.name.substring(0, 1)}</div>
                <div style={nameStyle}>{this.props.name}</div>
            </div>
        );
    }
}
Player.defaultProps = {
    textColor: Colors.darkWhite
};

const colors = [
    Colors.orange500,
    Colors.cyan500,
    Colors.green500
];

export default class Lobby extends React.Component {
    render() {
        const containerStyle = {
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: this.context.muiTheme.component.appBar.color,
            color: Colors.darkWhite
        };
        const codeStyle = {
            fontSize: 120,
            lineHeight: "160px",
            fontWeight: 100
        };
        const players = this.props.playerNames.map((p, i) => <Player name={p} color={colors[i % colors.length]} />);
        return (
            <div style={containerStyle}>
                <div style={codeStyle}>{this.props.gameCode}</div>
                <mui.RaisedButton label="Start game" primary={true} onClick={this.props.onStart}></mui.RaisedButton>
                <div style={{
                    backgroundColor: Colors.grey200,
                    flewGrow: 1,
                    width: "100%",
                    padding: 24,
                    boxSizing: "border-box",
                    display: "flex",
                    marginTop: 24,
                    justifyContent: "center"
                }}>
                    {players}
                </div>
            </div>
        );
    }
}
Lobby.contextTypes = {
    muiTheme: React.PropTypes.object
};
