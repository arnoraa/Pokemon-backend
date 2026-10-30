const express = require("express");
const router = express.Router();
const db = require("../database");

router.get("/", async (req, res) => {

    try {
        const {type, minAttack, startsWith} = req.query;

        let sql = "SELECT * FROM pokemon WHERE 1 = 1";
        const values = [];

        if (type) {
            sql += " AND primary_type = ?";
            values.push(type);
        }

        if (minAttack !== undefined && minAttack !== "") {
            const attackValue = Number(minAttack);

            if (!Number.isFinite(attackValue)) {
                return res.status(400).json({
                    error: "minAttack skal være et tal"
                });
            }
            sql += " AND attack > ?";
            values.push(attackValue);
        }

        if (startsWith) {
            sql += " AND name LIKE ?";
            values.push(`${startsWith}%`);
        }

        const [results] = await db.query(sql, values);
        res.json(results);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Kunne ikke hente pokemon"
        });
    }
});
    router.get("/power-plant", async (req, res) => {
        const sqlPowerPlant = `
        SELECT DISTINCT pokemon.*
        FROM pokemon
        JOIN pokemon_location
            ON pokemon.pokedex_number = pokemon_location.pokedex_number
        JOIN location
            ON pokemon_location.location_id = location.location_id
        WHERE location.location_name = ?
        `;

        try {
            const [results] = await db.query(sqlPowerPlant,
                ["Power Plant"]
            );

            res.json(results);

        } catch(error) {
            console.error(error);
            res.status(500).json({
                error: "Kunne ikke hente Pokémon fra Power Plant"
            });
        }

});
module.exports = router;