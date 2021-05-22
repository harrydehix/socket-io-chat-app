// HANDLE UNCAUGHT EXCEPTIONS
// Unhandled exceptions are logged to the console, after that the program exits
process.on("uncaughtException", (err) => {
    console.error(err);
    console.log("[UNHANDLED EXCEPTION] 🤬: Shutting down...");
    process.exit(1);
});

// REQUIRE EnvironmentError
const EnvironmentError = require("./utils/EnvironmentError");

// LOAD ENV VARIABLES
require("dotenv").config({ path: `${__dirname}/config.env` });

// CHECK NODE_ENV
if (process.env.NODE_ENV === "development") {
    console.log("Starting application in development mode...");
} else if (process.env.NODE_ENV === "production") {
    console.log("Starting application in production mode...");
} else {
    throw new EnvironmentError("NODE_ENV is not defined");
}

// CREATE EXPRESS APPLICATION
const app = require("./app");

// CONNECT TO MONGODB
const mongoose = require("mongoose");
const dbUrl =
    process.env.NODE_ENV === "development"
        ? process.env.DB_URL_LOCAL
        : process.env.DB_URL_ONLINE.replace(
              "<PASSWORD>",
              process.env.DB_PASSWORD
          );
mongoose
    .connect(dbUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Successfully connected to database...");
    })
    .catch((err) => {
        console.error(err);
        throw new EnvironmentError("Failed to connect to database");
    });

// CREATE SERVER
const server = require("http").createServer(app);

// INITIALIZE SOCKET
require("./socket")(server);

// START SERVER
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Listening on ${process.env.SOCKET_URL}:${port}/...`);
});

// HANDLE UNHANDLED REJECTIONS
// Unhandled rejections are logged to the console, after that the program exits
process.on("unhandledRejection", (err) => {
    console.error(err);
    console.log("[UNHANDLED REJECTION] 🤬: Shutting down...");
    server.close(() => process.exit(1));
});
