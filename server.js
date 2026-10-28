
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connection = require("./database");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


// Find alle pokemon

app.get("/pokemon", (req, res) => {
    const type = req.query.type;
    const minAttack = req.query.minAttack;
    const startsWith = req.query.startsWith;

    let sqlValues = "SELECT * FROM pokemon WHERE 1=1";
    let values = [];

    // primary_type
    if (type) {
        sqlValues += " AND primary_type = ?";
        values.push(type);
    }

    // attack over en bestemt værdi
    if (minAttack !== undefined) {
        const attackValue = Number(minAttack);

        if (!Number.isFinite(attackValue)) {
            return res.status(400).json({
                error: "minAttack skal være et tal"
            });
        }

        sqlValues += " AND attack > ?";
        values.push(attackValue);
    }

    // navn starter med et bestemt bogstav
    if (startsWith) {
        sqlValues += " AND name LIKE ?";
        values.push(startsWith + "%");
    }

    connection.query(sqlValues, values, (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                error: "Kunne ikke hente Pokémon"
            });
        }

        res.json(results);
    });
});


// Find alle pokemon i power-plant location
app.get("/pokemon/power-plant", (req, res) => {
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

// Hent alle trainers
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

// Sæt trainer id ind til sidst i url for at finde trainerens pokemons
// http://localhost:3000/trainer/pokemon?id=
app.get("/trainer/pokemon", (req, res) => {
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

// tilføj ny trainer - Skriv dette i insomnia og udfyld ?
// {
//   "trainer_name": "?",
//   "hometown": "?",
//   "age": ?
// }
app.post("/trainer/new", (req,res) => {
const trainerName = req.body.trainer_name;
const trainerHometown = req.body.hometown;
const trainerAge = req.body.age;

connection.query(
    "SELECT * FROM trainer WHERE trainer_name = ?",
    [trainerName],
    (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).json({
                error: "Kunne ikke kontrollere trainer"
            });
        }
        if (results.length > 0) {
            return res.send("Trainer already exists");
        } else {
            connection.query(
                "INSERT INTO trainer (trainer_name, hometown, age) VALUES (?, ?, ?)",
                [trainerName, trainerHometown, trainerAge],
                (error, results) => {

                    res.send("Trainer created");});
        }
    }
);
})

// tilføj pokemon til trainer - Skrive i insomnia
// {
//   "trainer_id": ?,
// 	"pokemon_id": ?
// }
app.post("/trainer/catch", (req, res) => {
    const trainer_id = req.body.trainer_id;
    const pokemon_id = req.body.pokemon_id;

    connection.query(
        "INSERT INTO trainer_pokemon (trainer_id, pokedex_number) VALUES (?, ?)",
        [trainer_id, pokemon_id],
        (error, results) => {
            if (error) {
                console.error(error);
                return res.status(500).json({
                    error: "Kunne ikke tilføje Pokémon til trainer"
                });
            }

            res.status(201).json({
                message: "Pokemon was caught",
                trainer_id: trainer_id,
                pokedex_number: pokemon_id
            });
        }
    );
});
// vi starter med at lave et endpoint
app.get("/dashboard/types", (req, res) => {
// Vi gemmer SQL-forespørgslen i en const til senere brug
    // bruger backticks til at kunne skrive sqlkoden over flere linjer
    const sqlDashboard = `
        SELECT primary_type, COUNT(*) AS antal
        FROM pokemon
        GROUP BY primary_type
        ORDER BY antal DESC
        `;
// vores connection.query sender SQL til vores database og beder om svar
    connection.query(sqlDashboard, (error, results) => {
// hvis der er fejl håndterer vi det således
        if (error) {
            console.error(error);
            return res.status(500).json({
                error: "Kunne ikke hente dashboard-statistik"
            });
        }
        // resultatet sendes tilbage til browseren
        res.json(results);
            });
        });

app.listen(port, () => {
    console.log(`Serveren kører på port ${port}`);
});