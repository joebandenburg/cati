import React from "react";
import mui from "material-ui";

export default class AnswerCard extends React.Component {
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
        const style = Object.assign({
            width: 200,
            height: 300,
            padding: 16,
            fontSize: 20,
            borderRadius: 10,
            transition: "transform 0.5s, box-shadow 0.1s",
            zIndex: 0,
            cursor: this.props.hover ? "pointer" : "default"
        }, this.props.style);
        if (this.state.hover) {
            style.zIndex += 100;
        }
        return (
            <mui.Paper zDepth={this.state.hover ? 3 : 1}
                       transitionEnabled={true}
                       style={style}
                       onMouseOver={(this.props.hover) ? this.onMouseOver.bind(this) : undefined}
                       onMouseOut={(this.props.hover) ? this.onMouseOut.bind(this) : undefined}
                       onClick={this.props.onClick}>
                {this.props.children}
            </mui.Paper>
        );
    }
}
AnswerCard.defaultProps = {
    hover: true
};