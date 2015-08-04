import express from "express";
import http from "http";
import SocketIO from "socket.io";
import Game from "./Game";

export default port => {
    const app = express();
    const server = http.Server(app);
    const io = SocketIO(server);

    app.use(express.static("dist/public"));
    io.on("connection", socket => {
        const game = new Game();
        game.onStateChange = () => {
            socket.emit("client game state update", game.getPlayerState(0));
        };
        socket.on("error", (e) => {
            console.log(e);
        });
        socket.on("answer", (answerIndexes) => {
            try {
                game.answer(0, answerIndexes);
            } catch (e) {
                socket.emit("error", e);
            }
        });
        socket.on("vote", (answerIndexes) => {
            try {
                game.vote(0, answerIndexes);
            } catch (e) {
                socket.emit("error", e);
            }
        });
    });

    return new Promise(resolve => {
        server.listen(port, resolve);
    });
};

