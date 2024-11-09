import psql from "pg"
import dotenv from "dotenv"
const { Client } = psql

export const connectToDb = () => {
    dotenv.config()
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