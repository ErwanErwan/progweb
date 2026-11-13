import express from 'express';
import morgan from 'morgan';
import mongoose from 'mongoose';
import contactRoutes from './routes/index.js';

process.loadEnvFile('.env');
const host = process.env.HOST;
const port = process.env.PORT;
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;

const app = express();

// Middleware
app.use(morgan('combined'));
app.use(express.json());

// Connexion à MongoDB
mongoose.connect(mongoUrl, { dbName })
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => console.error('Erreur de connexion MongoDB:', err));

// Routes
app.use('/api/contacts', contactRoutes);

app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.send('Hello !');
});

app.get('/home', function (req, res) {
  res.send('Maison :-)');
});

app.get('/user/:uid', function (req, res) {
  res.render('user', { uid: req.params.uid });
});

app.use(function (req, res) {
  res.status(404).send('Page introuvable !');
});

app.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`)
});
