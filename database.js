
require("dotenv").config();

const mysql = require("mysql2");
const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());


const connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBDATABASE,
});

module.exports = connection;

app.get("/", (req, res) => {
    res.send("Pokémon-serveren virker!");
});

app.listen(port, () => {
    console.log(`Serveren kører på port ${port}`);
});



