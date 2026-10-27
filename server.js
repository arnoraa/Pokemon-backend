
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connection = require("./database");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


// Get all pokemon
app.get("/pokemon", (req, res) => {
    connection.query("SELECT * FROM pokemon", (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                error: "Kunne ikke hente Pokémon"
            });
        }

        res.json(results);
    });
});

// Get all water type pokemon
app.get("/water-pokemon", (req, res) => {
    connection.query(
        "SELECT * FROM pokemon WHERE primary_type = ?",
        ["Water"],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    error: "Kunne ikke finde vandpokemon"
                });
            }

            res.json(results);
        }
    );
});
// Get all pokemon with attack above 80
app.get("/attack-above", (req, res) => {
    connection.query(
        "SELECT * FROM pokemon WHERE attack > ?",
        [80],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    error: "Kunne ikke strong pokemon"
                });
            }

            res.json(results);
        }
    );
});
// Get all pokemon with name that starts with S
app.get("/name-with-s", (req, res) => {
    connection.query(
        "SELECT * FROM pokemon WHERE name LIKE ?",
        ["S%"],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    error: "Kunne ikke hente pokemon med name der starter med S"
                });
            }

            res.json(results);
        }
    );
});

// Get all pokemon which can be found in the Power Plant location
app.get("/power-plant", (req, res) => {
    const sqlPowerPlant = `
        SELECT DISTINCT pokemon.*
        FROM pokemon
        JOIN pokemon_location
            ON pokemon.pokedex_number = pokemon_location.pokedex_number
        JOIN location
            ON pokemon_location.location_id = location.location_id
        WHERE location.location_name = ?
    `;

    connection.query(sqlPowerPlant, ["Power Plant"], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                error: "Kunne ikke hente Pokémon fra Power Plant"
            });
        }

        res.json(results);
    });
});

// Get all trainers
app.get("/trainer", (req, res) => {
    connection.query(
        "SELECT * FROM trainer",
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    error: "Kunne ikke finde trainers"
                });
            }

            res.json(results);
        }
    );
});

// Get a trainer and put in trainer id in url
// http://localhost:3000/trainer-pokemon?id=
app.get("/trainer-pokemon", (req, res) => {
    const trainerId = req.query.id;

    const sqlTrainerPokemon = `
        SELECT pokemon.*
        FROM pokemon
                 JOIN trainer_pokemon
                      ON pokemon.pokedex_number = trainer_pokemon.pokedex_number
        WHERE trainer_pokemon.trainer_id = ?
    `;

    connection.query(sqlTrainerPokemon, [trainerId], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                error: "Kunne ikke hente trænerens Pokémon"
            });
        }

        res.json(results);
    });
});
app.listen(port, () => {
    console.log(`Serveren kører på port ${port}`);
});
