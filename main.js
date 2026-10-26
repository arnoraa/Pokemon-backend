import * as express from "node/stream/consumers";

app.use(cors());
app.use(express.json());
const connection = db.createConnection({
    host:process.env.DBHOST,
    user:process.env.DBUSER,
    password:process.env.DBPASSWORD,
    database:process.env.DBNAME,
});

app.get('/', (req, res) => {

})
