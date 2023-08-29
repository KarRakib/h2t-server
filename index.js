const express = require('express')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json());
require('dotenv').config()


const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster7.fzzeo8a.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
console.log(uri);
async function run() {
  try {
    const productCollection = client.db('Redux').collection('shoe-products')
    const bestSellCollection = client.db('Redux').collection('best-sell')
    const addProdCollection = client.db('Redux').collection('addCart')
    const usersCollection = client.db('Redux').collection('Users')
    const ht2_productsCollection = client.db('Redux').collection('h2t-products')


    function verifyJWT(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
      }
      const token = authHeader.split(' ')[1]
      jwt.verify(token, 'ac39a23145c020ca7b85713a070731de3e1cf866eee4357d60c18d9d5f23ce67', function (err, decoded) {
        if (err) {
          return res.status(401).send({ message: 'invalid token' })
        }
        req.decoded = decoded;
        next()
      })
    }
    app.get('/best-sell', async (req, res) => {
      const query = {};
      const result = await bestSellCollection.find(query).toArray();
      res.send(result)
    })

    app.get('/products', async (req, res) => {
      const query = {};
      const result = await ht2_productsCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/products', async (req, res) => {
      const body = req.body
      console.log(body);
      const result = await ht2_productsCollection.insertOne(body)
      res.send(result)
    })
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await ht2_productsCollection.findOne(query);
      console.log('why', result);
      res.send(result)
    })
    app.get('/products', async (req, res) => {
      const query = {}
      const result = await productCollection.find(query).toArray()
      // const result = await cursor.toArray()
      res.send(result)
    })
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id
      console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await productCollection.findOne(query)
      res.send(result)
    })
    app.post('/add-order', async (req, res) => {
      const cart = req.body;
      const data = cart.data
      const email = cart.email
      const order = cart.order
      const date = cart.date
      const status = cart.status
      const totalPrice = cart.grandPrice
      const modified = cart.cartItems.map(item => {
        const { description, _id, sizes, rating, reviews, to, ...rest } = item;
        return rest
      })

      const result = await addht2_productsCollection.insertOne({ email, modified, data, order, date, status, totalPrice })
      res.send(result)
    })
    app.get('/my-orders/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await addProdCollection.findOne(query);
      res.send(result)
    })
    app.get('/get-order', async (req, res) => {
      const query = {};
      const result = await addProdCollection.find(query).toArray()
      res.send(result)
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })
    app.get('/user/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      console.log(query);
      const user = await usersCollection.findOne(query)
      console.log(user.role)
      res.send({ isAdmin: user?.role === 'admin' })
    })
    app.post('/jwt', async (req, res) => {
      const user = req.body
      console.log(user);
      const token = jwt.sign({ user }, 'ac39a23145c020ca7b85713a070731de3e1cf866eee4357d60c18d9d5f23ce67', { expiresIn: '1h' });
      res.send({ token })
    })

    app.get('/users', async (req, res) => {
      const query = {}
      const result = await usersCollection.find(query).toArray()
      res.send(result)

    })
    app.delete('/users/:id', async (req, res) => {
      const id = req.params
      const query = {_id : new ObjectId(id)}
      console.log('delete',query);
      const result = await usersCollection.deleteOne(query)
      res.send(result)

    })

    app.get('/get-orders', verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decoded = req.decoded
      console.log(decoded.user);
      if (decoded.user.email !== email) {
        return res.status(403).send({ message: 'Un Authorized' })
      }
      const query = { email: email };
      const result = await addProdCollection.find(query).toArray()
      res.send(result)
    })
    app.patch('/status/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { status: "Shipping" } };
      const result = await addProdCollection.updateOne(query, update);
      res.send(result);

    })


  }
  finally {

  }
}
run().catch(error => console.log(error))

app.get('/', (req, res) => {
  res.send('Hi Im H2T Server Running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})