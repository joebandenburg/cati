import React from "react";
import Router from "react-router";
import mui from "material-ui";
import SetupPlayer from "./SetupPlayer";

const ThemeManager = new mui.Styles.ThemeManager();

const RouteHandler = Router.RouteHandler;

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
            muiTheme: ThemeManager.getCurrentTheme(),
            windowWidth: this.state.windowWidth,
            playerInfo: this.state.playerInfo
        };
    }
    componentDidMount() {
        window.addEventListener("resize", this.onResize.bind(this));
    }
    componentWillUnmount() {
        window.removeEventListener("resize", this.onResize.bind(this));
    }
    componentWillUpdate(nextProps, nextState) {
        window.localStorage[playerInfoKey] = JSON.stringify(nextState.playerInfo);
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
        if (!this.state.playerInfo) {
            return <SetupPlayer onPlayerInfo={this.onPlayerInfo.bind(this)} />;
        }
        return (
            <div>
                <RouteHandler />
            </div>
        );
    }
}
App.childContextTypes = {
    muiTheme: React.PropTypes.object,
    windowWidth: React.PropTypes.number,
    playerInfo: React.PropTypes.object
};

export default App;