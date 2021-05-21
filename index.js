const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const port = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" },
});

const secret = "secret";
const users = [];

app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
});

app.post("/login", (req, res) => {
    const { username } = req.body;
    // if no username given
    if (!username) {
        return res.status(400).send({
            status: "fail",
            message: "Invalid username.",
        });
    }
    // if username already taken
    if (users.includes(username)) {
        return res.status(400).send({
            status: "fail",
            message: "Username already taken.",
        });
    }
    // if invalid username
    if (
        !/^(?=.{3,20}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/.test(
            username
        ) ||
        username === "You"
    ) {
        return res.status(400).send({
            status: "fail",
            message: "Invalid username.",
        });
    }
    // if everything ok generate token and send it
    users.push(username);
    const token = jwt.sign(
        {
            username,
        },
        secret,
        { expiresIn: "60d" }
    );
    return res.status(201).send({
        status: "success",
        token,
    });
});

io.use(function (socket, next) {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(
            socket.handshake.query.token,
            secret,
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
        delete users[users.indexOf(username)];
    });
});

server.listen(port, () => {
    console.log(
        `Listening on http://simple-socket-io-jwt-chat-app.herokuapp.com:${port}/...`
    );
});
