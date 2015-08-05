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
    const io = SocketIO(server);
    const gameMap = new Map();

    app.use(express.static("dist/public"));

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
            game.on("stateChanged", () => {
                socket.emit("client game state update", game.getPlayerState(playerIndex));
            });
            socket.on("start", () => {
                try {
                    game.start();
                } catch (e) {
                    socket.emit("error", e);
                }
            });
            socket.on("answer", (answerIndexes) => {
                try {
                    game.answer(playerIndex, answerIndexes);
                } catch (e) {
                    socket.emit("error", e);
                }
            });
            socket.on("vote", (answerIndexes) => {
                try {
                    game.vote(playerIndex, answerIndexes);
                } catch (e) {
                    socket.emit("error", e);
                }
            });
        });
    });

    return new Promise(resolve => {
        server.listen(port, resolve);
    });
};

