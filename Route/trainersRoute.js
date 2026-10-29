liste over alle trainers
async function hentPokemon() {
    const type = document.getElementById("type-filter").value;
    const liste = document.getElementById("trainer-liste");

    const response = await fetch("http://localhost:3000/api/trainers");
    const trainers = await response.json();

    if (!response.ok) {
        throw new Error("Kunne ikke hente trainers");
    }
    const trainers = await response.json();
    const liste = document.getElementById("trainer-liste");

catch (error) {
        console.error("Fejl:", error);
    }
}
hentTrainers()
_____________________________________________________________________________
Se hvilken Pokemon en bestemt trainer ejer

async function hentTrainerPokemon() {
    const trainerId = document.getElementById("trainer-id").value;
    const liste = document.getElementById("pokemon-liste");
    if (!trainerId) {
        liste.textContent = "Indtast et trainer-ID.";
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/trainers/${trainerId}/pokemon`
        );

        if (!response.ok) {
            throw new Error("Kunne ikke hente trainerens Pokémon");
        }

        const pokemon = await response.json();

        catch (error) {
            console.error("Fejl:", error);
        }
    }
    hentTrainerspokemon();
    ________________________________________________________________________________
    Oprettelse af en ny trainer.

    async function opretTrainer(event) {
        event.preventDefault();

        const navn = document.getElementById("trainer-navn").value;
        const alder = document.getElementById("trainer-alder").value;
        const by = document.getElementById("trainer-by").value;
        const response = await fetch("http://localhost:3000/api/trainers", {

            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: navn,
                age: Number(alder),
                city: by
            })
        });
        if (!response.ok) {
            throw new Error("Kunne ikke oprette trainer");
        }
        await hentTrainers();
    }
.getElementById("opret-trainer-form")
        .addEventListener("submit", opretTrainer);
    _______________________________________________________________________________
    Tilføje en Pokémon til en trainer
