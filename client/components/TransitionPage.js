import React from "react";

export default class TransitionPage extends React.Component {
    render() {
        const style = Object.assign({
            opacity: (this.props.leaving || this.props.entering) ? 0 : 1,
            display: "flex",
            flexDirection: "column",
            position: "absolute",
            top: this.props.entering ? 364 : 64,
            visibility: this.props.entering ? "hidden" : "visible",
            left: 0,
            width: "100%",
            minHeight: "calc(100% - 64px)",
            transition: this.props.entering ? "none" : "opacity 0.3s, top 0.3s",
            boxSizing: "border-box"
        }, this.props.style);
        return (
            <div style={style}>{this.props.children}</div>
        );
    }
}