import React from "react";

export default class Answered extends React.Component {
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
        return <div style={containerStyle}>Answered!</div>;
    }
}
Answered.contextTypes = {
    muiTheme: React.PropTypes.object
};
