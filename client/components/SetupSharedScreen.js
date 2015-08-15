import React from "react";
import mui from "material-ui";
import {isLarge, isXsmall, calcWidth, gutterWidth} from "../util/device";
import TapRipple from "./TapRipple";
import CircleRipple, {getRippleStyleFromPosition} from "./CircleRipple";
import Title from "./Title";
import TransitionPage from "./TransitionPage";

const Colors = mui.Styles.Colors;
const TransitionGroup = React.addons.TransitionGroup;

const themeManager = new mui.Styles.ThemeManager();

export default class SetupSharedScreen extends React.Component {
    constructor() {
        super();
        this.state = {
            entering: false,
            leaving: false
        };
    }
    componentWillMount() {
        this.context.muiTheme.setPalette({
            primary1Color: Colors.brown500,
            accent1Color: Colors.blue500,
            textColor: Colors.darkWhite
        });
    }
    onGameOn(e) {
        e.preventDefault();
        const ne = e.nativeEvent;
        const isTouchEvent = ne.changedTouches && ne.changedTouches.length;
        const pageX = isTouchEvent ? ne.changedTouches[0].pageX : ne.pageX;
        const pageY = isTouchEvent ? ne.changedTouches[0].pageY : ne.pageY;
        this.onLeave(e, pageX, pageY, {
            type: "sharedScreen"
        });
    }
    onReset(e) {
        e.preventDefault();
        const currentReturn = this.props.location.query.return;
        this.context.router.transitionTo(this.context.router.makePath("/setup-device", {return: currentReturn}));
    }
    onLeave(e, pageX, pageY, playerInfo) {
        const rippleStyle = getRippleStyleFromPosition(window.innerWidth, window.innerHeight, pageX, pageY);
        this.setState({
            leavingRippleStyle: Object.assign({
                zIndex: 100
            }, rippleStyle)
        });
        this.context.setPlayerInfo(playerInfo);
        setTimeout(() => {
            const returnUrl = this.props.location.query.return || "/";
            this.context.router.transitionTo(returnUrl);
        }, 2000);
    }
    componentWillAppear(callback)  {
        console.log("componentWillAppear", "SetupSharedScreen");
        this.setState({
            entering: true
        });
        setTimeout(callback, 0);
    }
    componentDidAppear() {
        console.log("componentDidAppear", "SetupSharedScreen");
        this.setState({
            entering: false
        });
    }
    componentWillEnter(callback)  {
        console.log("componentWillEnter", "SetupSharedScreen");
        this.setState({
            entering: true
        });
        setTimeout(callback, 0);
    }
    componentDidEnter() {
        console.log("componentDidEnter", "SetupSharedScreen");
        this.setState({
            entering: false
        });
    }
    componentWillLeave(callback) {
        console.log("componentWillLeave", "SetupSharedScreen");
        this.setState({
            leaving: true
        });
        setTimeout(callback, 300);
    }
    componentDidLeave() {
        console.log("componentDidLeave", "SetupSharedScreen");
    }
    render() {
        const xsmallDevice = isXsmall(this.context.windowWidth);
        const largeDevice = isLarge(this.context.windowWidth);
        const columns = xsmallDevice ? 2 : largeDevice ? 3 : 4;
        const pageWidth = calcWidth(this.context.windowWidth, columns * 2);
        const boxWidth = (xsmallDevice || pageWidth === "100%") ? undefined : pageWidth / 2;
        const boxHeight = xsmallDevice ? Math.min(this.context.windowWidth, 400) : boxWidth;
        const layout = xsmallDevice ? "column" : "row";
        const ripple = this.state.leavingRippleStyle ?
            <TransitionGroup style={{
                position: "absolute",
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                overflow: "hidden"
            }}>
                <CircleRipple style={this.state.leavingRippleStyle} opacity={1} color={Colors.blue500} />
            </TransitionGroup> : null;
        return (
            <div>
                <Title pageWidth={pageWidth} entering={this.state.entering} leaving={this.state.leaving}>
                    <mui.IconButton style={{
                                        marginLeft: -16,
                                        marginRight: 8,
                                        marginTop: 8
                                    }}
                                    onTouchTap={this.onReset.bind(this)}>
                        <mui.FontIcon className="material-icons"
                                      color={this.context.muiTheme.palette.textColor}>arrow_back</mui.FontIcon>
                    </mui.IconButton>
                    <h1 style={{
                            fontWeight: 400,
                            fontSize: 24,
                            lineHeight: "64px",
                            margin: 0,
                            padding: 0,
                            display: "inline-block"
                        }}>
                        Shared screen
                    </h1>
                </Title>
                <TransitionPage style={{
                    backgroundColor: Colors.brown400,
                    color: Colors.darkWhite,
                    flexGrow: 1,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }} entering={this.state.entering} leaving={this.state.leaving}>
                    <div style={{
                        width: pageWidth,
                        display: "flex",
                        flexDirection: "column",
                        padding: 24,
                        boxSizing: "border-box"
                    }}>
                        <h1>Wave, you're on TV</h1>
                        <p style={{
                            fontSize: 14,
                            fontWeight: 400,
                            lineHeight: 1.71429
                        }}>This device will not participate in games as a player.</p>
                        <mui.RaisedButton primary={true}
                                          style={{
                                              alignSelf: "flex-end",
                                              marginTop: 24
                                          }}
                                          label="Continue"
                                          onTouchTap={this.onGameOn.bind(this)} />
                    </div>
                </TransitionPage>
                {ripple}
            </div>
        );
    }
}
SetupSharedScreen.contextTypes = {
    muiTheme: React.PropTypes.object,
    windowWidth: React.PropTypes.number,
    setPlayerInfo: React.PropTypes.func,
    router: React.PropTypes.object
};
