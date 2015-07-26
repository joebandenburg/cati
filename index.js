import "core-js";
import server from "./server/server";

const port = process.env.PORT || 8080;

server(port).then(() => {
    console.log("Server running on port " + port);
});