const { Client } = require("pg")
const { configDotenv } = require("dotenv")

const connectToDb = () => {
    configDotenv()
    const client = new Client({
        user: process.env.PGUSER,
        host: process.env.PGHOST,
        port: process.env.PGPORT,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
    })
    client
	.connect()
	.then(() => {
		console.log('Connected to PostgreSQL database');
	})
	.catch((err) => {
		console.error('Error connecting to PostgreSQL database', err);
	})
    return client
}

module.exports = { connectToDb };