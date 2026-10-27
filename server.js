
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
                    error: "Kunne ikke pokemon med name der starter med S"
                });
            }

            res.json(results);
        }
    );
});

// Get all pokemon which can be fount in the Power Plant location
app.get("/power-plant", (req, res) => {
    const sql = `
        SELECT DISTINCT pokemon.*
        FROM pokemon
        JOIN pokemon_location
            ON pokemon.pokedex_number = pokemon_location.pokedex_number
        JOIN location
            ON pokemon_location.location_id = location.location_id
        WHERE location.location_name = ?
    `;

    connection.query(sql, ["Power Plant"], (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                error: "Kunne ikke hente Pokémon fra Power Plant"
            });
        }

        res.json(results);
    });
});


app.listen(port, () => {
    console.log(`Serveren kører på port ${port}`);
});
