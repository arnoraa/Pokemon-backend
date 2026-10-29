
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connection = require("./database");

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());


// Find alle Pokémon, og gør det muligt at filtrere dem via URL'en.
// Eksempel: /pokemon?type=Water&minAttack=80

app.get("/pokemon", (req, res) => {

    // Henter værdien af parameteren "type" fra URL'en.
    // Eksempel: /pokemon?type=Water giver værdien "Water".
    const type = req.query.type;

    // Henter den ønskede minimumsværdi for attack fra URL'en.
    const minAttack = req.query.minAttack;

    // Henter det bogstav, som Pokémon-navnet skal starte med.
    // Eksempel: /pokemon?startsWith=S.
    const startsWith = req.query.startsWith;

    // Gemmer SQL-forespørgslen i en variabel.
    // WHERE 1=1 gør det nemmere at tilføje flere betingelser med AND.
    let sqlValues = "SELECT * FROM pokemon WHERE 1=1";

    // Opretter en tom liste til de værdier, som skal indsættes
    // i SQL-forespørgslens spørgsmålstegn (?).
    let values = [];

    // Hvis der er angivet en type i URL'en, tilføjes denne betingelse.
    // Vi undersøger kun Pokémonens primary_type.
    if (type) {
        // Tilføjer et filter, så kun den valgte type returneres.
        sqlValues += " AND primary_type = ?";

        // Gemmer typen i listen over SQL-værdier.
        values.push(type);
    }

    // Hvis minAttack er angivet i URL'en, udføres dette.
    if (minAttack !== undefined) {

        // Konverterer værdien fra URL'en til et tal.
        const attackValue = Number(minAttack);

        // Kontrollerer, om værdien er et gyldigt tal.
        // Number.isFinite() afviser blandt andet NaN og Infinity.
        if (!Number.isFinite(attackValue)) {

            // Sender HTTP-status 400 tilbage, hvis værdien er ugyldig.
            // return stopper samtidig resten af denne funktion.
            return res.status(400).json({
                error: "minAttack skal være et tal"
            });
        }

        // Tilføjer en betingelse, som finder Pokémon med attack
        // større end den angivne værdi.
        sqlValues += " AND attack > ?";

        // Tilføjer attack-værdien til SQL-forespørgslens parametre.
        values.push(attackValue);
    }

    // Hvis der er angivet et startbogstav, tilføjes dette filter.
    if (startsWith) {

        // LIKE bruges til at søge efter tekst, der matcher et mønster.
        // % betyder, at der må komme vilkårlige tegn efter bogstavet.
        sqlValues += " AND name LIKE ?";

        // Eksempel: S bliver til S%, som finder navne, der starter med S.
        values.push(startsWith + "%");
    }

    // Sender SQL-forespørgslen og de tilhørende værdier til MySQL.
    // Spørgsmålstegnene bliver erstattet sikkert med værdierne fra values.
    connection.query(sqlValues, values, (error, results) => {

        // Hvis databasen melder en fejl, udføres denne del.
        if (error) {

            // Udskriver den tekniske fejl i terminalen.
            console.error(error);

            // Sender HTTP-status 500 og en fejlbesked til klienten.
            // return stopper funktionen her.
            return res.status(500).json({
                error: "Kunne ikke hente Pokémon"
            });
        }

        // Sender de fundne Pokémon tilbage som JSON.
        res.json(results);
    });
});


// Find alle Pokémon, der findes på Power Plant.

app.get("/pokemon/power-plant", (req, res) => {

    // Gemmer SQL-forespørgslen i en variabel.
    // Backticks gør det muligt at skrive SQL over flere linjer.
    const sqlPowerPlant = `
        SELECT DISTINCT pokemon.*
        FROM pokemon
        JOIN pokemon_location
            ON pokemon.pokedex_number = pokemon_location.pokedex_number
        JOIN location
            ON pokemon_location.location_id = location.location_id
        WHERE location.location_name = ?
    `;

    // Udfører SQL-forespørgslen.
    // "Power Plant" indsættes i det sidste spørgsmålstegn.
    connection.query(sqlPowerPlant, ["Power Plant"], (error, results) => {

        // Kontrollerer, om der opstod en databasefejl.
        if (error) {

            // Viser den tekniske fejl i terminalen.
            console.error(error);

            // Sender en fejlbesked tilbage til klienten.
            return res.status(500).json({
                error: "Kunne ikke hente Pokémon fra Power Plant"
            });
        }

        // Sender listen over Pokémon fra Power Plant tilbage som JSON.
        res.json(results);
    });
});
app.listen(port, () => {
    console.log(`Serveren kører på port ${port}`);
});