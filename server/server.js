import express from "express";

export default (port) => {
    const app = express();

    app.use(express.static("dist/public"));

    return new Promise((resolve) => {
        app.listen(port, resolve);
    });
};

