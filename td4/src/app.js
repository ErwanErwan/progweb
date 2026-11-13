import express from 'express';
import morgan from 'morgan';
import { MongoClient, ObjectId } from 'mongodb';

process.loadEnvFile('.env');
const host = process.env.HOST;
const port = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;
const databaseName = process.env.DB_NAME;
const collectionName = 'contacts';

const app = express();
const client = new MongoClient(mongoUrl);
let contactsCollection;

app.use(morgan('combined'));
app.use(express.json());

app.set('view engine', 'ejs');

async function getContactsCollection() {
  if (!contactsCollection) {
    await client.connect();
    contactsCollection = client.db(databaseName).collection(collectionName);
  }
  return contactsCollection;
}

function isValidContact(contact) {
  return contact
    && typeof contact.name === 'string'
    && contact.name.trim().length > 0
    && Number.isInteger(contact.age)
    && contact.age >= 0;
}

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
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer les contacts.' });
  }
});

app.get('/contacts/:id', async function(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de contact invalide.' });
  }

  try {
    const collection = await getContactsCollection();
    const contact = await collection.findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact introuvable.' });
    }

    res.json(contact);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de récupérer le contact.' });
  }
});

app.post('/contacts', async function(req, res) {
  if (!isValidContact(req.body)) {
    return res.status(400).json({
      error: 'Un contact doit contenir un nom et un âge entier positif.'
    });
  }

  try {
    const collection = await getContactsCollection();
    const contact = {
      name: req.body.name.trim(),
      age: req.body.age
    };
    const result = await collection.insertOne(contact);
    res.status(201).json({ ...contact, _id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de créer le contact.' });
  }
});

app.put('/contacts/:id', async function(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de contact invalide.' });
  }

  if (!isValidContact(req.body)) {
    return res.status(400).json({
      error: 'Un contact doit contenir un nom et un âge entier positif.'
    });
  }

  try {
    const collection = await getContactsCollection();
    const contact = {
      name: req.body.name.trim(),
      age: req.body.age
    };
    const result = await collection.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: contact }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Contact introuvable.' });
    }

    res.json({ ...contact, _id: new ObjectId(req.params.id) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de mettre à jour le contact.' });
  }
});

app.delete('/contacts/:id', async function(req, res) {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'ID de contact invalide.' });
  }

  try {
    const collection = await getContactsCollection();
    const result = await collection.deleteOne({
      _id: new ObjectId(req.params.id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Contact introuvable.' });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Impossible de supprimer le contact.' });
  }
});

app.use(function(req, res){
  res.status(404).send('Page introuvable !');
});

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
});
