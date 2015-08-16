import React from "react";
import mui from "material-ui";
import TapRipple from "./TapRipple";

export default class ActionBox extends React.Component {
    constructor() {
        super();
        this.state = {
            hovered: false
        };
    }
    render() {
        const paperStyle = {
            backgroundColor: this.state.hovered ? this.props.hoverColor : this.props.backgroundColor,
            color: this.props.textColor,
            maxWidth: this.props.width,
            minHeight: 350,
            height: this.props.height,
            flexGrow: 1,
            flexShrink: 0,
            position: "relative",
            zIndex: this.state.hovered ? 5 : 0,
            cursor: "pointer"
        };
        const innerStyle = {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            boxSizing: "border-box",
            position: "absolute",
            height: "100%",
            width: "100%"
        };
        const iconStyle = {
            fontSize: 128
        };
        const h3Style = {
            fontSize: 24,
            marginTop: 16,
            lineHeight: 1.71429
        };
        const pStyle = {
            fontSize: 14,
            fontWeight: 400,
            lineHeight: 1.71429,
            maxWidth: 400
        }
        const zDepth = this.state.hovered ? 3 : 0;
        return (
            <mui.Paper zDepth={zDepth}
                       style={paperStyle}
                       rounded={false}
                       onMouseOver={this._onMouseOver.bind(this)}
                       onMouseOut={this._onMouseOut.bind(this)}>
                <TapRipple color={this.props.textColor} onTouchTap={this.props.onTouchTap.bind(this)}>
                    <div style={innerStyle}>
                        <mui.FontIcon style={iconStyle}
                                      className="material-icons"
                                      color={this.props.textColor}>{this.props.icon}</mui.FontIcon>
                        <h3 style={h3Style}>{this.props.title}</h3>
                        <p style={pStyle}>{this.props.text}</p>
                    </div>
                </TapRipple>
            </mui.Paper>
        );
    }
    _onMouseOver() {
        this.setState({
            hovered: true
        });
    }
    _onMouseOut() {
        this.setState({
            hovered: false
        });
    }
}