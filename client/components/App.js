import React from "react";
import Router from "react-router";
import mui from "material-ui";

const ThemeManager = new mui.Styles.ThemeManager();

const RouteHandler = Router.RouteHandler;

class App extends React.Component {
    constructor() {
        super();
        this.state = {
            windowWidth: document.body.clientWidth
        };
    }

    getChildContext() {
        return {
            muiTheme: ThemeManager.getCurrentTheme(),
            windowWidth: this.state.windowWidth
        };
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

    render() {
        return (
            <div>
                <RouteHandler />
            </div>
        );
    }
}
App.childContextTypes = {
    muiTheme: React.PropTypes.object,
    windowWidth: React.PropTypes.number
};

export default App;