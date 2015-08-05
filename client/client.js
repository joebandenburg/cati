import React from "react";
import Router from "react-router";
import App from "./components/App";
import Home from "./components/Home";
import Game from "./components/Game";
import CreateGame from "./components/CreateGame";

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

Router.run(routes, Router.HashLocation, (Root) =>
    React.render(
        <Root />,
        document.getElementById("app")
    )
);