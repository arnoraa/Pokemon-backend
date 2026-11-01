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
