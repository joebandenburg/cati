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
        socket.on("answer", (answerIndexes) => {
            game.answer(0, answerIndexes);
        });
        socket.on("vote", (answerIndexes) => {
            game.vote(0, answerIndexes);
        });
    });

    return new Promise(resolve => {
        server.listen(port, resolve);
    });
};

