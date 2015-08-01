import express from "express";
import http from "http";
import SocketIO from "socket.io";

export default (port) => {
    const app = express();
    const server = http.Server(app);
    const io = SocketIO(server);

    app.use(express.static("dist/public"));
    io.on("connection", function(socket) {

    });

    return new Promise((resolve) => {
        server.listen(port, resolve);
    });
};

