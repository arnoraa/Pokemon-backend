
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connection = require("./database");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Test af serveren
app.get("/", (req, res) => {
    res.send("Pokémon-serveren virker!");
});

// Test af databaseforbindelsen
app.get("/test-databasen", (req, res) => {
    connection.query("SELECT 1", (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Databaseforbindelsen fejlede");
        }

        res.send("Forbindelsen til MySQL virker!");
    });
});

// Hent alle Pokémon
app.get("/all-pokemon", (req, res) => {
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



app.listen(port, () => {
    console.log(`Serveren kører på port ${port}`);
});
