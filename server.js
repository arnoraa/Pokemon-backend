const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pokemonRoute = require("./Route/pokemonRoute");
const trainersRoute = require("./Route/trainersRoute");
const statisticsRoute = require("./Route/statisticsRoute");

app.use("/api/pokemon", pokemonRoute);
app.use("/api/trainers", trainersRoute);
app.use("/api/dashboard", statisticsRoute);

app.get("/", (req, res) => {
    res.json({message: "API is running!"});
});

app.listen(PORT, () => {
    console.log(`Server kører på http://localhost:${ PORT }!`);
});

module.exports = app;

