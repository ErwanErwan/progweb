process.loadEnvFile('.env');

const databaseName = process.env.DB_NAME;
const collectionName = 'contacts';
const mongoUrl = process.env.MONGO_URL;

import { MongoClient } from 'mongodb';

async function printAllContacts(collection) {
    const results = await collection.find().toArray();
    for (const result of results) {
        console.log(`Contact : ${result.name} is ${result.age}`);
    }
}

async function main() {
    let client;
    try {
        console.log('Trying to connect...')
        const client = new MongoClient(mongoUrl);
        connection = await client.connect();
        console.log("Successfully connected to MongoDB.");
        const db = connection.db(databaseName);
        const contacts = db.collection(collectionName);
        await printAllContacts(contacts);
    } catch (e) {
        console.error(e)
    } finally {
        if (client) {
            client.close();
        }
    }
}

main();
