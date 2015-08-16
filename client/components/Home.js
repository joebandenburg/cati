import React from "react";
import { Link } from "react-router";
import mui from "material-ui";
import {isLarge, isXsmall, calcWidth, gutterWidth} from "../util/device";
import ActionBox from "./ActionBox";

const Colors = mui.Styles.Colors;

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
    componentWillLeave(callback) {
        console.log("componentWillLeave", "Home");
        this.setState({
            leaving: true
        });
        setTimeout(callback, 1000);
    }
    onJoinGame(e) {
        e.preventDefault();
        setTimeout(() => {
            this.context.router.transitionTo("/join-game");
        }, 400);
    }
    onCreateGame(e) {
        e.preventDefault();
        setTimeout(() => {
            this.context.router.transitionTo("/create-game");
        }, 400);
    }
    render() {
        const xsmallDevice = isXsmall(this.context.windowWidth);
        const largeDevice = isLarge(this.context.windowWidth);
        const columns = xsmallDevice ? 2 : largeDevice ? 3 : 4;
        const pageWidth = calcWidth(this.context.windowWidth, columns * 2);
        const boxWidth = (xsmallDevice || pageWidth === "100%") ? undefined : pageWidth / 2;
        const boxHeight = xsmallDevice ? Math.min(this.context.windowWidth, 400) : boxWidth;
        const verticalPadding = xsmallDevice ? 24 : 24;
        const titleHeight = xsmallDevice ? 128 : largeDevice ? 192 : 160;
        const layout = xsmallDevice ? "column" : "row";
        const style = {
            backgroundColor: this.context.muiTheme.component.appBar.color,
            color: this.context.muiTheme.component.appBar.textColor,
            paddingTop: verticalPadding,
            paddingBottom: verticalPadding,
            paddingLeft: 24,
            paddingRight: 24,
            height: (this.state.entering || this.state.leaving) ? "100%" : titleHeight,
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
            opacity: (this.state.entering || this.state.leaving) ? 0 : 1,
            transition: this.state.leaving ? "all 0.5s" : "all 0.5s ease-in 0.5s",
        };
        const h2Style = {
            fontWeight: 300,
            fontSize: (xsmallDevice) ? 18 : 24,
            opacity: (this.state.entering || this.state.leaving) ? 0 : 1,
            transition: this.state.leaving ? "all 0.5s" : "all 0.5s ease-in 0.75s"
        };
        const otherStyle = {
            position: "absolute",
            top: titleHeight,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: layout,
            justifyContent: "center",
            color: Colors.darkBlack,
            marginTop: xsmallDevice ? 0 : largeDevice ? 64 : 32
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
                    <ActionBox
                        backgroundColor={Colors.deepOrange500}
                        hoverColor={Colors.deepOrange400}
                        textColor={Colors.darkWhite}
                        width={boxWidth}
                        height={boxHeight}
                        icon="play_for_work"
                        title="Join game"
                        onTouchTap={this.onJoinGame.bind(this)} />
                    <ActionBox
                        backgroundColor={Colors.purple500}
                        hoverColor={Colors.purple400}
                        textColor={Colors.darkWhite}
                        width={boxWidth}
                        height={boxHeight}
                        icon="add_circle_outline"
                        title="Create game"
                        onTouchTap={this.onCreateGame.bind(this)} />
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