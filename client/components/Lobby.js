import React from "react";
import mui from "material-ui";

export default class Lobby extends React.Component {
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
        const codeStyle = {
            fontSize: 120,
            lineHeight: "160px",
            fontWeight: 100
        };
        return (
            <div style={containerStyle}>
                <div style={codeStyle}>{this.props.gameCode}</div>
                <mui.RaisedButton label="Start" onClick={this.props.onStart}></mui.RaisedButton>
            </div>
        );
    }
}
Lobby.contextTypes = {
    muiTheme: React.PropTypes.object
};
