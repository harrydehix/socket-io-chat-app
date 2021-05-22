const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const authController = require("./controllers/authController");

module.exports = function (server) {
    const io = new Server(server, {
        cors: { origin: "*" },
    });

    io.use(function (socket, next) {
        if (socket.handshake.query && socket.handshake.query.token) {
            jwt.verify(
                socket.handshake.query.token,
                process.env.JWT_SECRET,
                function (err, decoded) {
                    if (err) return next(new Error("Authentication error"));
                    socket.decoded = decoded;
                    next();
                }
            );
        } else {
            next(new Error("Authentication error"));
        }
    }).on("connection", function (socket) {
        const { username } = socket.decoded;
        console.log(`'${username}' connected`);
        socket.broadcast.emit("user joined", username);
        socket.on("chat message", (msg) => {
            console.log(`'${username}' wrote '${msg}'`);
            socket.broadcast.emit("chat message", { username, msg });
        });
        socket.on("disconnect", () => {
            console.log(`'${username}' disconnected`);
            socket.broadcast.emit("user left", username);

            authController.logout(username);
        });
    });

    return io;
};
