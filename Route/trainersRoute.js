const express = require('express');
const db = require("../database");
const router = express.Router();

router.get("/", async (req, res) => {

    try {
        const [results] = await db.query("SELECT * FROM trainer");
        res.json(results);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Kunne ikke finde trainers"
        });
    }
});

        router.get("/pokemon", async (req, res) => {
            const trainerId = req.query.id;

            if (!trainerId) {
                return res.status(400).json({
                    error: "Trainer ID mangler"
                });
            }

            const sqlTrainerPokemon = `
                SELECT pokemon.*
                FROM pokemon
                         JOIN trainer_pokemon
                              ON pokemon.pokedex_number = trainer_pokemon.pokedex_number
                WHERE trainer_pokemon.trainer_id = ?
            `;

            try {
                const [results] = await db.query(sqlTrainerPokemon, [trainerId]);
                res.json(results);
            } catch (err) {
                console.error(err);
                res.status(500).json({
                    error: "Kunne ikke hente trænerens Pokémon"
                });
            }
        });

        router.post("/new", async (req, res) => {

            const {trainer_name, hometown, age} = req.body;

            if (!trainer_name || !hometown || age === underfined || age === "")
                return res.status(400).json({
                    error: "Navn, hjemby og alder skal udfyldes"
                });

            try {
                const [existing] = await db.query(
                    "SELECT * FROM trainer WHERE trainer_name = ?",
                    [trainerName]
                );

                if (existing.length > 0) {
                    return res.status(400).json({
                        error: "Trainer findes allerede"
                    });
                }
                const [results] = await db.query(
                    "INSERT INTO trainer (trainer_name, hometown, age) VALUES (?, ?, ?)",
                    [trainer_name, hometown, age]
                );

                res.status(201).json({
                    message: "Trainer created",
                    id: results.insertId
                });

            } catch (error) {
                console.error(error);
                res.status(500).json({
                    error: "Kunne ikke oprette trainer"
                });
            }

            router.post("/catch", async (req, res) => {
                const {trainer_id, pokemon_id} = req.body;

                if (trainer_id == null || pokemon_id == null) {
                    return res.status(400).json({
                        error: "Trainer ID og Pokémon ID skal udfyldes"
                    });
                }

                try {
                    await db.query(
                        "INSERT INTO trainer_pokemon (trainer_id, pokedex_number) VALUES (?, ?)",
                        [trainer_id, pokemon_id]
                    );

                    res.status(201).json({
                        message: "Pokémon tilføjet til trainer", trainer_id,
                        pokedex_number: pokemon_id
                    });

                } catch (error) {
                    console.error(error);
                    res.status(500).json({
                        error: "Kunne ikke tilføje Pokémon til trainer"
                    });
                }
            });
        });

        module.exports = router;
