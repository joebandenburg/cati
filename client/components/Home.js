import React from "react";
import { Link } from "react-router";
import mui from "material-ui";
import {isLarge, isXsmall, calcWidth, gutterWidth} from "../util/device";

const Colors = mui.Styles.Colors;

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
            width,
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
            width,
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

export default class Home extends React.Component {
    constructor() {
        super();
        this.state = {
            entering: false
        };
    }
    componentWillMount() {
        this.context.muiTheme.setPalette({
            primary1Color: Colors.blue500,
            textColor: Colors.darkWhite
        });
    }
    componentWillAppear(callback) {
        console.log("componentWillAppear", "Home");
        this.setState({
            entering: true
        });
        setTimeout(callback, 0);
    }
    componentDidAppear(callback) {
        console.log("componentDidAppear", "Home");
        this.setState({
            entering: false
        });
    }
    componentWillEnter(callback) {
        console.log("componentWillEnter", "Home");
        this.setState({
            entering: true
        });
        setTimeout(callback, 0);
    }
    componentDidEnter() {
        console.log("componentDidEnter", "Home");
        this.setState({
            entering: false
        });
    }
    render() {
        const xsmallDevice = isXsmall(this.context.windowWidth);
        const largeDevice = isLarge(this.context.windowWidth);
        const verticalPadding = xsmallDevice ? 24 : 24;
        const titleHeight = 118 + verticalPadding * 2;
        const style = {
            backgroundColor: this.context.muiTheme.component.appBar.color,
            color: this.context.muiTheme.component.appBar.textColor,
            paddingTop: verticalPadding,
            paddingBottom: verticalPadding,
            paddingLeft: 24,
            paddingRight: 24,
            height: this.state.entering ? "100%" : titleHeight,
            transition: "all 1s",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 10,
            width: "100%",
            display: "flex",
            justifyContent: "center"
        };
        const innerStyle = {
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto",
            textAlign: "center"
        };
        const h1Style = {
            fontWeight: 400,
            fontSize: (xsmallDevice) ? 24 : (largeDevice) ? 45 : 34,
            opacity: this.state.entering ? 0 : 1,
            transition: "all 0.5s ease-in 0.5s",
        };
        const h2Style = {
            fontWeight: 300,
            opacity: this.state.entering ? 0 : 1,
            transition: "all 0.5s ease-in 0.75s"
        };
        const otherStyle = {
            position: "absolute",
            top: titleHeight,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            paddingTop: verticalPadding,
            paddingBottom: verticalPadding,
            color: Colors.darkBlack
        };
        return (
            <div>
                <mui.Paper zDepth={2} rounded={false} style={style}>
                    <div style={innerStyle}>
                        <h1 style={h1Style}>Cards Against the Internet</h1>
                        <h2 style={h2Style}>A party game for horrible people.</h2>
                    </div>
                </mui.Paper>
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
    windowWidth: React.PropTypes.number,
    playerInfo: React.PropTypes.object,
    router: React.PropTypes.object
};