import React from "react";
import Router from "react-router";
import mui from "material-ui";
import {isLarge, isXsmall, calcWidth, gutterWidth} from "../util/device";

const Colors = mui.Styles.Colors;
const Link = Router.Link;

class HomeFeature extends React.Component {
    constructor() {
        super();
        this.state = {
            hovered: false
        };
    }

    onMouseOver() {
        this.setState({
            hovered: true
        });
    }

    onMouseOut() {
        this.setState({
            hovered: false
        });
    }

    render() {
        const zDepth = (this.state.hovered) ? 4 : 1;
        const columns = isXsmall(this.context.windowWidth) ? 2 : 3;
        const width = calcWidth(this.context.windowWidth, columns);
        const paperStyle = {
            width: width,
            marginRight: (this.props.lastChild) ? 0 : gutterWidth(this.context.windowWidth)
        };
        const captionStyle = {
            fontSize: 20,
            fontWeight: 500,
            color: Colors.darkBlack,
            letterSpacing: 0,
            lineHeight: "64px",
            textAlign: "center"
        };
        const iconStyle = {
            backgroundColor: this.props.color,
            height: width,
            width: width,
            fontSize: 0.6 * width,
            lineHeight: width + "px",
            textAlign: "center",
            color: Colors.darkWhite,
            boxSizing: "border-box"
        };
        return (
            <mui.Paper zDepth={zDepth}
                       onMouseOver={this.onMouseOver.bind(this)}
                       onMouseOut={this.onMouseOut.bind(this)}
                       style={paperStyle}
                       rounded={true}>
                <Link to={this.props.route}>
                    <mui.FontIcon style={iconStyle} className="material-icons">{this.props.icon}</mui.FontIcon>
                </Link>
                <h3 style={captionStyle}>{this.props.caption}</h3>
            </mui.Paper>
        );
    }
}
HomeFeature.contextTypes = {
    windowWidth: React.PropTypes.number
};

class Home extends React.Component {
    render() {
        const xsmallDevice = isXsmall(this.context.windowWidth);
        const largeDevice = isLarge(this.context.windowWidth);
        const verticalPadding = xsmallDevice ? 24 : 72;
        const style = {
            backgroundColor: this.context.muiTheme.component.appBar.color,
            color: this.context.muiTheme.component.appBar.textColor,
            paddingTop: verticalPadding,
            paddingBottom: verticalPadding,
            paddingLeft: 24,
            paddingRight: 24
        };
        const innerStyle = {
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center"
        };
        const h1Style = {
            fontWeight: 400,
            fontSize: (xsmallDevice) ? 24 : (largeDevice) ? 45 : 34
        };
        const h2Style = {
            fontWeight: 300
        };
        const otherStyle = {
            display: "flex",
            justifyContent: "center",
            paddingTop: verticalPadding,
            paddingBottom: verticalPadding,
            color: Colors.darkBlack
        };
        return (
            <div>
                <div style={style}>
                    <div style={innerStyle}>
                        <h1 style={h1Style}>Cards Against the Internet</h1>
                        <h2 style={h2Style}>A party game for horrible people.</h2>
                    </div>
                </div>
                <div style={otherStyle}>
                    <HomeFeature caption="Create Game" route="create-game" icon="add_circle_outline" color={Colors.red300} />
                    <HomeFeature caption="Join Game" route="join-game" icon="play_for_work" color={Colors.amber300} lastChild={true} />
                </div>
            </div>
        );
    }
}
Home.contextTypes = {
    muiTheme: React.PropTypes.object,
    windowWidth: React.PropTypes.number
};

export default Home;