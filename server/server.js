import express from "express";
import http from "http";
import SocketIO from "socket.io";
import _ from "lodash";
import Game from "./Game";

function generateGameId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 4;
    return _.times(length, _.partial(_.random, chars.length)).map(i => chars[i]).join("");
}

function generateUniqueGameId(gameMap) {
    while (true) {
        const id = generateGameId();
        if (!gameMap.has(id)) return id;
    }
}

export default port => {
    const app = express();
    const server = http.Server(app);
    const io = SocketIO(server, {
        path: "/api/socket"
    });
    const gameMap = new Map();

    const redirectToIndex = (req, res, next) => {
        req.url = req.originalUrl = "/";
        next();
    };

    app.get("/create-game", redirectToIndex);
    app.get("/join-game", redirectToIndex);
    app.get("/game/:id", redirectToIndex);
    app.use("/", express.static("static"));

    app.post("/api/game", (req, res) => {
        const id = generateUniqueGameId(gameMap);
        const game = new Game();
        gameMap.set(id, game);
        res.status(201).json({
            id
        });
    });

    io.on("connection", socket => {
        socket.on("error", (e) => {
            console.log(e);
        });
        socket.on("join game", (id) => {
            if (!gameMap.has(id)) {
                socket.emit("error", "no such game");
            }
            const game = gameMap.get(id);
            const playerIndex = game.join();
            const emit = () => {
                socket.emit("client game state update", game.getPlayerState(playerIndex));
            };
            game.on("stateChanged", emit);
            const safe = fn => {
                return (...args) => {
                    try {
                        fn(...args);
                    } catch (e) {
                        socket.emit("error", e);
                    }
                };
            };
            const start = safe(() => game.start());
            const answer = safe(answerIndexes => game.answer(playerIndex, answerIndexes));
            const vote = safe(vote => game.vote(playerIndex, vote));
            socket.on("start", start);
            socket.on("answer", answer);
            socket.on("vote", vote);
            socket.on("leave game", () => {
                game.removeListener("stateChanged", emit);
                socket.removeListener("start", start);
                socket.removeListener("answer", answer);
                socket.removeListener("vote", vote);
            });
        });
    });

    return new Promise(resolve => {
        server.listen(port, resolve);
    });
};

