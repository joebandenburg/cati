import React from "react";
import Router from "react-router";
import mui from "material-ui";
import {isLarge, isXsmall, calcWidth, gutterWidth} from "../util/device";
import TapRipple from "./TapRipple";
import CircleRipple, {getRippleStyleFromPosition} from "./CircleRipple";
import Title from "./Title";
import TransitionPage from "./TransitionPage";

const Colors = mui.Styles.Colors;
const RouteHandler = Router.RouteHandler;
const TransitionGroup = React.addons.TransitionGroup;

class Box extends React.Component {
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
                        <mui.FontIcon style={iconStyle} className="material-icons">{this.props.icon}</mui.FontIcon>
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

const themeManager = new mui.Styles.ThemeManager();

export default class SetupDeviceSelection extends React.Component {
    constructor() {
        super();
        this.state = {
            isPlayer: false,
            isSharedScreen: false,
            entering: false,
            leaving: false
        };
    }
    componentWillMount() {
        this.context.muiTheme.setPalette({
            primary1Color: Colors.blue500,
            textColor: Colors.darkWhite
        });
    }
    onSelectPlayer(e) {
        e.preventDefault();
        setTimeout(() => {
            const currentReturn = this.props.location.query.return;
            this.context.router.transitionTo(this.context.router.makePath("/setup-device/player", {return: currentReturn}));
        }, 400);
    }
    onSelectSharedScreen(e) {
        e.preventDefault();
        setTimeout(() => {
            const currentReturn = this.props.location.query.return;
            this.context.router.transitionTo(this.context.router.makePath("/setup-device/shared", {return: currentReturn}));
        }, 400);
    }
    componentWillAppear(callback) {
        console.log("componentWillAppear", "SetupDeviceSelection");
        this.setState({
            entering: true
        });
        setTimeout(callback, 0);
    }
    componentDidAppear() {
        console.log("componentDidAppear", "SetupDeviceSelection");
        this.setState({
            entering: false
        });
    }
    componentWillEnter(callback) {
        console.log("componentWillEnter", "SetupDeviceSelection");
        this.setState({
            entering: true
        });
        setTimeout(callback, 0);
    }
    componentDidEnter() {
        console.log("componentDidEnter", "SetupDeviceSelection");
        this.setState({
            entering: false
        });
    }
    componentWillLeave(callback) {
        console.log("componentWillLeave", "SetupDeviceSelection");
        this.setState({
            leaving: true
        });
        callback();
    }
    componentDidLeave() {
        console.log("componentDidLeave", "SetupDeviceSelection");
    }
    render() {
        const xsmallDevice = isXsmall(this.context.windowWidth);
        const largeDevice = isLarge(this.context.windowWidth);
        const columns = xsmallDevice ? 2 : largeDevice ? 3 : 4;
        const pageWidth = calcWidth(this.context.windowWidth, columns * 2);
        const boxWidth = (xsmallDevice || pageWidth === "100%") ? undefined : pageWidth / 2;
        const boxHeight = xsmallDevice ? Math.min(this.context.windowWidth, 400) : boxWidth;
        const layout = xsmallDevice ? "column" : "row";
        return (
            <div>
                <Title fromRight={true}
                       pageWidth={pageWidth}
                       entering={this.state.entering}
                       leaving={this.state.leaving}>
                    <h1 style={{
                        fontWeight: 400,
                        fontSize: 24,
                        lineHeight: "64px",
                        margin: 0,
                        padding: 0,
                        display: "inline-block"
                        }}>
                        What device is this?
                    </h1>
                </Title>
                <TransitionPage entering={this.state.entering} leaving={this.state.leaving}>
                    <div style={{
                        display: "flex",
                        flexDirection: layout,
                        justifyContent: "center",
                        marginTop: xsmallDevice ? 0 : largeDevice ? 64 : 32
                    }}>
                        <Box backgroundColor={Colors.green500}
                             hoverColor={Colors.green400}
                             textColor={Colors.darkWhite}
                             width={boxWidth}
                             height={boxHeight}
                             icon="phone_android"
                             title="Player"
                             text="This device will be used by you to play the game. You should be the only person who can see this screen."
                             onTouchTap={this.onSelectPlayer.bind(this)} />
                        <Box backgroundColor={Colors.brown500}
                             hoverColor={Colors.brown400}
                             textColor={Colors.darkWhite}
                             width={boxWidth}
                             height={boxHeight}
                             icon="tv"
                             title="Shared screen"
                             text="This device will be viewable by multiple players."
                             onTouchTap={this.onSelectSharedScreen.bind(this)} />
                    </div>
                </TransitionPage>
            </div>
        );
    }
}
SetupDeviceSelection.contextTypes = {
    muiTheme: React.PropTypes.object,
    windowWidth: React.PropTypes.number,
    setPlayerInfo: React.PropTypes.func,
    router: React.PropTypes.object
};
