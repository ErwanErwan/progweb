import express from 'express';
import morgan from 'morgan';
import { MongoClient, ObjectId } from 'mongodb';

process.loadEnvFile('.env');
const host = process.env.HOST || 'localhost';
const port = process.env.PORT || 8080;
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const databaseName = process.env.DB_NAME || 'M2WEB';
const collectionName = 'contacts';

const app = express();
const client = new MongoClient(mongoUrl);

let contacts;

async function getContactsCollection() {
  if (!contacts) {
    await client.connect();
    contacts = client.db(databaseName).collection(collectionName);
  }
  return contacts;
}

app.use(morgan('combined'));
app.use(express.json());

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.send('Hello !');
});

app.get('/home', function(req, res) {
  res.send('Maison :-)');
});

app.get('/user/:uid', function(req, res) {
  res.render('user', {uid: req.params.uid});
});

app.get('/contacts', async function(req, res) {
  try {
    const collection = await getContactsCollection();
    const contacts = await collection.find().toArray();
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: 'Impossible de récupérer les contacts.' });
  }
});

app.get('/contacts/:id', async function(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de contact invalide.' });
  }

  try {
    const collection = await getContactsCollection();
    const contact = await collection.findOne({ _id: new ObjectId(req.params.id) });
    if (!contact) {
      return res.status(404).json({ error: 'Contact introuvable.' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: 'Impossible de récupérer le contact.' });
  }
});

app.post('/contacts', async function(req, res) {
  try {
    const collection = await getContactsCollection();
    const result = await collection.insertOne(req.body);
    const contact = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de créer le contact.' });
  }
});

app.put('/contacts/:id', async function(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de contact invalide.' });
  }

  try {
    const collection = await getContactsCollection();
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!result) {
      return res.status(404).json({ error: 'Contact introuvable.' });
    }
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Impossible de mettre à jour le contact.' });
  }
});

app.delete('/contacts/:id', async function(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de contact invalide.' });
  }

  try {
    const collection = await getContactsCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact introuvable.' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Impossible de supprimer le contact.' });
  }
});

app.use(function(req, res){
  res.status(404).send('Page introuvable !');
});

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
});