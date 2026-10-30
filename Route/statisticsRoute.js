const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', async (req, res) => {
    const sqlPrimary = `SELECT primary_type, COUNT(*) AS antal
        FROM pokemon
        GROUP BY primary_type
        ORDER BY antal DESC`;

    try {
        const [results] = await db.query(sqlPrimary);
        res.json(results);
    } catch (error) {
    console.error(error);
    res.status(500).json({
        error: "Kunne ikke hente dashboard-statistik"
        });
    }
});

        router.get('/lowest-stats', async (req, res) => {
            const sqlLowest = `SELECT name,
                                      (hp + attack + defence + special_attack + special_defence + speed) AS total_stats
                               FROM pokemon
                               ORDER BY total_stats ASC
                               LIMIT 5;
            `;

            try {
                const [results] = await db.query(sqlLowest);
                res.json(results);
            } catch (error) {
                console.error(error);
                res.status(500).json({
                    error: "Kunne ikke hente Pokémon med laveste stats"
                });
            }
        });

        router.get('/highest-speed', async (req, res) => {
            const sqlFast = `SELECT name, speed
                             FROM pokemon
                             ORDER BY speed DESC
                             LIMIT 5;`;
            try {
                const [results] = await db.query(sqlFast);
                res.json(results);

            } catch (error) {
                console.error(error);
                return res.status(500).json({
                    error: "Kunne ikke hente Pokémon med højeste speed"
                });
            }
        });

        router.get("/route-25", async (req, res) => {

            const sqlRoute25 = `SELECT DISTINCT pokemon.pokedex_number,
                                                pokemon.name,
                                                pokemon.primary_type,
                                                encounter_rate
                                FROM pokemon
                                         JOIN pokemon_location
                                              ON pokemon.pokedex_number = pokemon_location.pokedex_number
                                         JOIN location
                                              ON pokemon_location.location_id = location.location_id
                                WHERE location.location_name = 'Route 25'
                                ORDER BY pokemon.pokedex_number`;

            try {
                const [results] = await db.query(sqlRoute25, ["Route 25"]);

                res.json({
                    antal_pokemon: results.length,
                    pokemon: results
                });

            } catch (error) {
                console.error(error);
                res.status(500).json({
                    error: "Kunne ikke finde Pokémon på Route 25"
                });
            }
        });
module.exports = router;