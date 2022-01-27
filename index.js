let express = require("express");
let apiRoutes = require("./routers/apiRoutes");
let { Client } = require("pg");
require("dotenv").config();
let cors = require("cors");
let app = express();
let port = process.env.PORT || 5000;
//!middlewares
app.use(cors());
app.use(express.urlencoded({ limit: "500000mb", extended: true }));
app.use(express.json({ limit: "500000mb" }));
app.use("/api", apiRoutes.route);
app.listen(port);
