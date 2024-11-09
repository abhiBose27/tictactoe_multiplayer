import psql from "pg"
import dotenv from "dotenv"
const { Client } = psql

export const connectToDb = () => {
    dotenv.config()
    const client = new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
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