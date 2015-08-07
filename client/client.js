import "core-js";
import "whatwg-fetch";
import injectTapEventPlugin from "react-tap-event-plugin";
import React from "react";
import Router from "react-router";
import App from "./components/App";
import Home from "./components/Home";
import Game from "./components/Game";
import CreateGame from "./components/CreateGame";

injectTapEventPlugin();

const Route = Router.Route;
const DefaultRoute = Router.DefaultRoute;

const routes = (
    <Route handler={App}>
        <DefaultRoute handler={Home}/>
        <Route name="game/:id" handler={Game} />
        <Route name="create-game" handler={CreateGame} />
        <Route name="join-game" handler={Game} />
    </Route>
);

Router.run(routes, Router.HistoryLocation, (Root) =>
    React.render(
        <Root />,
        document.getElementById("app")
    )
);