const express = require("express");
const morgan = require("morgan");
const app = express();
const globalErrorHandler = require("./controllers/errorController");

// MIDDLEWARE
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(`${__dirname}/assets`));
app.use("/api/v1/auth", require("./routers/authRouter"));
app.use(globalErrorHandler);

// // HOMEPAGE
// app.get("/", (req, res) => {
//     res.sendFile(`${__dirname}/assets/index.html`);
// });

module.exports = app;
