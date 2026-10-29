
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

// Hent alle trainers fra databasen.

app.get("/trainer", (req, res) => {

    // Sender en SQL-forespørgsel, der henter alle rækker fra trainer.
    connection.query(
        "SELECT * FROM trainer",

        // Denne callback udføres, når MySQL har svaret.
        (error, results) => {

            // Hvis der opstår en fejl, håndteres den her.
            if (error) {

                // Udskriver fejlen i terminalen.
                console.error(error);

                // Sender en fejlbesked til klienten.
                return res.status(500).json({
                    error: "Kunne ikke finde trainers"
                });
            }

            // Sender alle trainers tilbage som JSON.
            res.json(results);
        }
    );
});


// Hent de Pokémon, som en bestemt trainer ejer.
// Eksempel: http://localhost:3000/trainer/pokemon?id=1

app.get("/trainer/pokemon", (req, res) => {

    // Henter trainerens ID fra URL'ens query parameter.
    // I eksemplet ovenfor bliver trainerId lig med "1".
    const trainerId = req.query.id;

    // SQL-forespørgslen finder Pokémon, der er knyttet til traineren.
    const sqlTrainerPokemon = `
        SELECT pokemon.*
        FROM pokemon
        JOIN trainer_pokemon
        ON pokemon.pokedex_number = trainer_pokemon.pokedex_number
        WHERE trainer_pokemon.trainer_id = ?
    `;

    // Sender forespørgslen til MySQL.
    // Trainerens ID indsættes i spørgsmålstegnet.
    connection.query(sqlTrainerPokemon, [trainerId], (error, results) => {

        // Hvis MySQL melder en fejl, håndteres den her.
        if (error) {

            // Udskriver den tekniske fejl i terminalen.
            console.error(error);

            // Sender en fejlbesked tilbage til klienten.
            return res.status(500).json({
                error: "Kunne ikke hente trænerens Pokémon"
            });
        }

        // Sender trainerens Pokémon tilbage som JSON.
        res.json(results);
    });
});


// Opret en ny trainer.
// I Insomnia sendes en POST-forespørgsel med en JSON-body.
// Body kan eksempelvis indeholde trainer_name, hometown og age.

app.post("/trainer/new", (req, res) => {

    // Henter trainerens navn fra den JSON-data, klienten sender.
    const trainerName = req.body.trainer_name;

    // Henter trainerens hjemby fra JSON-dataen.
    const trainerHometown = req.body.hometown;

    // Henter trainerens alder fra JSON-dataen.
    const trainerAge = req.body.age;

    // Undersøger, om der allerede findes en trainer med dette navn.
    connection.query(
        "SELECT * FROM trainer WHERE trainer_name = ?",
        [trainerName],

        // Kører, når MySQL har svaret på SELECT-forespørgslen.
        (error, results) => {

            // Hvis der opstår en databasefejl, stopper vi her.
            if (error) {

                // Udskriver fejlen i terminalen.
                console.error(error);

                // Sender en fejlbesked til klienten.
                return res.status(500).json({
                    error: "Kunne ikke kontrollere trainer"
                });
            }

            // Kontrollerer, om søgningen fandt en eksisterende trainer.
            // results.length er antallet af rækker, som blev fundet.
            if (results.length > 0) {

                // Hvis navnet allerede findes, sendes denne besked.
                return res.send("Trainer already exists");

            } else {

                // Hvis navnet ikke findes, oprettes den nye trainer.
                connection.query(
                    "INSERT INTO trainer (trainer_name, hometown, age) VALUES (?, ?, ?)",

                    // Værdierne indsættes i samme rækkefølge som spørgsmålstegnene.
                    [trainerName, trainerHometown, trainerAge],

                    // Denne callback udføres, når INSERT-forespørgslen er færdig.
                    (error, results) => {

                        // Sender en besked om, at traineren er oprettet.
                        res.send("Trainer created");
                    }
                );
            }
        }
    );
});


// Tilføj en Pokémon til en trainer.
// I Insomnia sendes eksempelvis trainer_id og pokemon_id i JSON-body.

app.post("/trainer/catch", (req, res) => {

    // Henter ID'et på den trainer, som skal have Pokémonen.
    const trainer_id = req.body.trainer_id;

    // Henter Pokédex-nummeret på Pokémonen fra JSON-dataen.
    const pokemon_id = req.body.pokemon_id;

    // Indsætter forbindelsen mellem traineren og Pokémonen i databasen.
    // Tabellen trainer_pokemon forbinder de to tabeller.
    connection.query(
        "INSERT INTO trainer_pokemon (trainer_id, pokedex_number) VALUES (?, ?)",

        // Indsætter først trainerens ID og derefter Pokémonens ID.
        [trainer_id, pokemon_id],

        // Kører, når databasen har forsøgt at indsætte forbindelsen.
        (error, results) => {

            // Hvis indsættelsen fejler, håndteres fejlen her.
            if (error) {

                // Udskriver den tekniske fejl i terminalen.
                console.error(error);

                // Sender en fejlbesked til klienten.
                return res.status(500).json({
                    error: "Kunne ikke tilføje Pokémon til trainer"
                });
            }

            // Sender HTTP-status 201, som betyder, at noget er oprettet.
            // JSON-svaret fortæller, hvilken trainer og Pokémon det drejer sig om.
            res.status(201).json({
                message: "Pokemon was caught",
                trainer_id: trainer_id,
                pokedex_number: pokemon_id
            });
        }
    );
});
// Vi starter med et endpoint, der viser antal Pokémon pr. type.
// URL: http://localhost:3000/dashboard/types

app.get("/dashboard/types", (req, res) => {

    // Gemmer SQL-forespørgslen i en const, så den kan bruges senere.
    // Backticks gør det muligt at skrive SQL-koden over flere linjer.
    const sqlPrimary = `
        SELECT primary_type, COUNT(*) AS antal
        FROM pokemon
        GROUP BY primary_type
        ORDER BY antal DESC
    `;

    // Sender SQL-forespørgslen til databasen.
    // Her bruges ingen ekstra værdier, fordi forespørgslen ikke har ?.
    connection.query(sqlPrimary, (error, results) => {

        // Hvis der opstår en fejl i SQL-forespørgslen, håndteres den her.
        if (error) {

            // Udskriver den tekniske fejl i terminalen.
            console.error(error);

            // Sender HTTP-status 500 og en fejlbesked tilbage.
            return res.status(500).json({
                error: "Kunne ikke hente dashboard-statistik"
            });
        }

        // Sender resultatet tilbage til browseren som JSON.
        // Resultatet indeholder hver primær type og dens antal Pokémon.
        res.json(results);
    });
});


// Finder de fem Pokémon med de laveste samlede stats.
// URL: http://localhost:3000/dashboard/lowest-stats

app.get("/dashboard/lowest-stats", (req, res) => {

    // Gemmer SQL-forespørgslen, der beregner og sorterer stats.
    const sqlLowest = `
        SELECT
        name,
        (hp + attack + defence + special_attack
        + special_defence + speed) AS total_stats
        FROM pokemon
        ORDER BY total_stats ASC
        LIMIT 5;
    `;

    // Sender SQL-forespørgslen til MySQL.
    connection.query(sqlLowest, (error, results) => {

        // Kontrollerer, om der opstod en fejl.
        if (error) {

            // Udskriver fejlen i terminalen.
            console.error(error);

            // Sender en fejlbesked tilbage til klienten.
            return res.status(500).json({
                error: "Kunne ikke hente pokemon med laveste stats"
            });
        }

        // Sender de fem Pokémon med de laveste samlede stats tilbage.
        res.json(results);
    });
});


// Finder de fem Pokémon med den højeste speed.
// URL: http://localhost:3000/dashboard/highest-speed

app.get("/dashboard/highest-speed", (req, res) => {

    // Gemmer SQL-forespørgslen i en variabel.
    const sqlFast = `
        SELECT
            name,
            speed
        FROM pokemon
        ORDER BY speed DESC
        LIMIT 5
    `;

    // Sender SQL-forespørgslen til databasen.
    connection.query(sqlFast, (error, results) => {

        // Hvis der opstår en fejl, håndteres den her.
        if (error) {

            // Udskriver fejlen i terminalen.
            console.error(error);

            // Sender en fejlbesked tilbage til klienten.
            return res.status(500).json({
                error: "Kunne ikke hente Pokémon med højeste speed"
            });
        }

        // Sender de fem Pokémon med højeste speed tilbage som JSON.
        res.json(results);
    });
});


// Finder alle forskellige Pokémon på Route 25.
// URL: http://localhost:3000/dashboard/route-25

app.get("/dashboard/route-25", (req, res) => {

    // DISTINCT betyder, at identiske rækker i det valgte resultat
    // kun vises én gang.
    const sqlRoute25 = `
        SELECT DISTINCT pokemon.pokedex_number,
                        pokemon.name,
                        pokemon.primary_type
        FROM pokemon
                 JOIN pokemon_location
                      ON pokemon.pokedex_number = pokemon_location.pokedex_number
                 JOIN location
                      ON pokemon_location.location_id = location.location_id
        WHERE location.location_name = 'Route 25'
        ORDER BY pokemon.pokedex_number;
    `;

    // Sender SQL-forespørgslen til MySQL.
    connection.query(sqlRoute25, (error, results) => {

        // Hvis databasen melder en fejl, håndteres den her.
        if (error) {

            // Udskriver fejlen i terminalen.
            console.error(error);

            // Sender en fejlbesked tilbage til klienten.
            return res.status(500).json({
                error: "Kunne ikke finde pokemon på Route 25"
            });
        }

        // results.length fortæller, hvor mange rækker der er i resultatet.
        // Fordi SQL bruger DISTINCT, er det antallet af forskellige
        // Pokémon i dette resultat.
        //
        // pokemon: results indeholder selve listen over Pokémon.
        // Vi sender derfor både antallet og listen i samme JSON-svar.
        res.json({
            antal_pokemon: results.length,
            pokemon: results
        });
    });
});


// Starter serveren og får den til at lytte på den valgte port.
// Når serveren er startet, udføres funktionen og skriver en besked
// i terminalen, så vi kan se, at serveren kører.

app.listen(port, () => {
    console.log(`Serveren kører på port ${port}`);
});