import "core-js";
import "whatwg-fetch";
import injectTapEventPlugin from "react-tap-event-plugin";
import React from "react";
import { Router, Route } from "react-router";
import { history } from "react-router/lib/BrowserHistory";
import App from "./components/App";
import Game from "./components/Game";
import Home from "./components/Home";
import CreateGame from "./components/CreateGame";
import SetupDevice from "./components/SetupDevice";
import SetupPlayer from "./components/SetupPlayer";
import SetupSharedScreen from "./components/SetupSharedScreen";

injectTapEventPlugin();

function shouldRedirectToDeviceSetup(nextState, transition) {
    if (!localStorage["playerInfo"]) {
        transition.to("/setup-device", { return: nextState.location.pathname });
    }
}

React.render(
    <Router history={history}>
        <Route component={App}>
            <Route path="/" component={Home} onEnter={shouldRedirectToDeviceSetup} />
            <Route path="game/:id" component={Game} onEnter={shouldRedirectToDeviceSetup} />
            <Route path="create-game" component={CreateGame} onEnter={shouldRedirectToDeviceSetup} />
            <Route path="join-game" component={Game} onEnter={shouldRedirectToDeviceSetup} />
            <Route path="setup-device" component={SetupDevice}>
                <Route path="player" component={SetupPlayer} />
                <Route path="shared" component={SetupSharedScreen} />
            </Route>
        </Route>
    </Router>,
    document.getElementById("app")
);