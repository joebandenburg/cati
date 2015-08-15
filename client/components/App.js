import React from "react";
import Router from "react-router";
import mui from "material-ui";
import Home from "./Home";

const themeManager = new mui.Styles.ThemeManager();
const Colors = mui.Styles.Colors;

const RouteHandler = Router.RouteHandler;
const TransitionGroup = React.addons.TransitionGroup;

const playerInfoKey = "playerInfo";

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            windowWidth: document.body.clientWidth,
            playerInfo: JSON.parse(window.localStorage[playerInfoKey] || null)
        };
    }
    getChildContext() {
        return {
            muiTheme: themeManager.getCurrentTheme(),
            windowWidth: this.state.windowWidth,
            playerInfo: this.state.playerInfo,
            setPlayerInfo: (playerInfo) => {
                window.localStorage[playerInfoKey] = JSON.stringify(playerInfo);
                this.setState({
                    playerInfo
                });
            }
        };
    }
    componentWillMount() {
        themeManager.setPalette({
            primary1Color: Colors.blue500
        });
    }
    componentDidMount() {
        window.addEventListener("resize", this.onResize.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize.bind(this));
    }
    onResize() {
        this.setState({
            windowWidth: document.body.clientWidth
        });
    }
    onPlayerInfo(playerInfo) {
        this.setState({
            playerInfo
        });
    }
    render() {
        const key = this.props.route;
        return (
            <TransitionGroup>
                {React.cloneElement(this.props.children, { key })}
            </TransitionGroup>
        );
    }
}
App.childContextTypes = {
    muiTheme: React.PropTypes.object,
    windowWidth: React.PropTypes.number,
    setPlayerInfo: React.PropTypes.func,
    playerInfo: React.PropTypes.object
};

export default App;