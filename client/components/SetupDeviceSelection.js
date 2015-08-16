import React from "react";
import Router from "react-router";
import mui from "material-ui";
import {isLarge, isXsmall, calcWidth, gutterWidth} from "../util/device";
import TapRipple from "./TapRipple";
import CircleRipple, {getRippleStyleFromPosition} from "./CircleRipple";
import Title from "./Title";
import TransitionPage from "./TransitionPage";
import ActionBox from "./ActionBox";

const Colors = mui.Styles.Colors;
const RouteHandler = Router.RouteHandler;
const TransitionGroup = React.addons.TransitionGroup;

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
                        <ActionBox
                            backgroundColor={Colors.green500}
                            hoverColor={Colors.green400}
                            textColor={Colors.darkWhite}
                            width={boxWidth}
                            height={boxHeight}
                            icon="phone_android"
                            title="Player"
                            text="This device will be used by you to play the game. You should be the only person who can see this screen."
                            onTouchTap={this.onSelectPlayer.bind(this)} />
                        <ActionBox
                            backgroundColor={Colors.brown500}
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
