-- Opgave beskrivelse - Backend

Denne repository indeholder backend-delen af vores Pokédex-projekt.

Backenden er udviklet med Node.js og Express og kommunikerer med en MySQL-database.

Formålet med backend er at stille et API til rådighed, som frontend-API
kan bruge til at hente, filtrere, oprette og vise data om Pokémon og trainers.


-- Database

Applikationen anvender en MySQL-database til at gemme information om
Pókemon og trainers.

Som en del af projektet er den eksisterende Pokémon-database blevet udvidet
med en ny tabel.




-- Databasedesign

Vi har tilføjet et screenshot af ER-diagrammet som viser
databasens struktur, herunder primærnøgler, fremmednøgler og relationer mellem tabellerne.


-- SQL-filer

Ny tabel -> pokemon-location-export.sql


-- API-endpoints

Backend indeholder API-endpoints, som frontend
anvender til at hente og oprette data.


Nogle Pokémon endpoints:


GET -> /pokemon -> Henter alle Pokémon.

GET -> /pokemon?startsWith=S -> Filtrerer Pokémon ved hjælp af query-parametre.

GET -> /pokemon/power-plant -> Henter alle Pokémon, der findes på Power Plant.


Nogle Trainer endpoints:


GET -> /trainer -> Henter alle trainers.

POST -> /trainer/new -> Opretter en ny trainer.

GET -> /trainer/pokemon -> Henter de Pokémon, som en trainer ejer.

POST -> /trainer/catch -> Tilføj en Pokémon til en trainer.


Nogle Dashboard endpoints:

GET -> /dashboard/lowest-stats -> Finder fem Pokémon med laveste samlede stats.

GET -> /dashboard/highest-speed -> Finder fem Pokémon med højeste speed.



INSTALLATION OG OPSÆTNING:

1. clone repository:
   'git clone "https://github.com/arnoraa/Pokemon-backend.git"'

2. 'npm install'

3. Opret en .env -fil i backenden, og konfigurer forbindelsen til jeres SQL-database.
   
   Eksempel:
   
            DBHOST=localhost

            DBUSER=dit_brugernavn
   
            DBPASSWORD=din_adgangskode
   
            DBNAME=din_database
   
            PORT=3000

5. Importer SQL-filen: "pokemon-location-export.sql" til MySQL

6. 'npm start'

Skriv URL: localhost:3000. Om serveren kører skal der stå: "Serveren kører på port 3000"



-- Forbindelse til frontend

Backend stiller data til rådighed via API-endpoints, som frontend-delen tilgår ved hjælp af JavaScript fetch()-funktion

Frontend-repository: "https://github.com/arnoraa/Pokemon-frontend.git"


-- Projekt-information
Projektet er udviklet som gruppearbejde.
   
