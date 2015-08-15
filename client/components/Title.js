import React from "react";
import mui from "material-ui";

export default class Title extends React.Component {
    constructor() {
        super();
    }
    render() {
        const style = {
            opacity: (this.props.appearing || this.props.entering || this.props.leaving) ? 0 : 1,
            display: "flex",
            position: "absolute",
            top: 0,
            left: (this.props.appearing) ? 24 : (this.props.entering) ? (this.props.fromRight) ? 58 : -10 : 24,
            transition: (this.props.entering) ? "none" : "opacity 0.3s, left 0.3s",
            boxSizing: "border-box"
        };
        const titleHeight = 64;
        return (
            <mui.Paper zDepth={this.props.leaving ? 0 : 2} rounded={false} style={{
                    backgroundColor: this.props.leaving ? "transparent" : this.context.muiTheme.palette.primary1Color,
                    color: this.context.muiTheme.palette.textColor,
                    position: "fixed",
                    zIndex: 10,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    minHeight: titleHeight
                }}>
                <div style={{
                        width: this.props.pageWidth,
                        position: "relative",
                        paddingLeft: 24,
                        paddingRight: 24,
                        boxSizing: "border-box"
                    }}>
                    <div style={style}>{this.props.children}</div>
                </div>
            </mui.Paper>
        );
    }
}
Title.contextTypes = {
    muiTheme: React.PropTypes.object
};