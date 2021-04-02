const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
require('dotenv').config()

const port = process.env.PORT || 4200;


const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World! Welcome to BackEnd Development')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zvgp5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db(process.env.DB_NAME).collection("products");
  const ordersCollection = client.db(process.env.DB_NAME).collection("orders");

  console.log(err);

  // full products database API
  app.get('/products', (req, res) => {
    productsCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })

  // Load Product according to Product ID API
  app.get('/product/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    productsCollection.find({ _id: id })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })

  // API for add product to the Database
  app.post('/addProduct', (req, res) => {
    const newProduct = req.body;
    console.log('adding new product: ', newProduct)
    productsCollection.insertOne(newProduct)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // API for delete a product
  app.delete('/deleteProduct/:id', (req, res) => {
    const id = ObjectID(req.params.id);
    console.log(id);
    productsCollection.findOneAndDelete({ _id: id })
      .then(documents => res.send(!!documents.value))
  })

  // API for save client orders
  app.post('/checkOut', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })

  // api for load all the orders according to the loggedin Client
  app.get('/orders', (req, res) => {
    ordersCollection.find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

});



app.listen(port, () => console.log('listening to port 4200'))