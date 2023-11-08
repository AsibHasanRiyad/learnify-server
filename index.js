const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5001;

//middleware
app.use(cors({
    origin:['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

//created middleware
const verifyToken = (req, res, next) =>{
    const token = req?.cookies?.token;
    console.log('token in the middleware', token);
    if (!token) {
        return res.status(401).send({message:'Unauthorized Access'})
    }
    jwt.verify(token, process.env.SECRET, (err, decoded) =>{
        if (err) {
            return res.status(401).send({message:'Unauthorized Access.....'})
        }
        req.user = decoded
        next()
    })
}



    //jwt related api

    app.post('/jwt', async(req, res) =>{
        const user = req.body;
        // console.log(user);
        const token = jwt.sign(user, process.env.SECRET, {expiresIn:'1h'})
        res
        .cookie('token',token,{
            httpOnly: true,
            secure:true,
            sameSite:'none'
        })
        .send({Success: 'True'})
    })

    app.post('/logout', async(req, res) =>{
        const user = req.body;
        console.log('logging out', user);
        res.clearCookie('token',{maxAge:0})
        .send({Success:'True'})
    })

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2x6r8lz.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const assignmentCollection = client
      .db("Learnify")
      .collection("allAssignment");

    const submittedAssignmentCollection = client
      .db("Learnify")
      .collection("submittedAssignment");

    //receive data from client side
    app.post("/assignments", async (req, res) => {
      const newAssignment = req.body;
    //   console.log("data received from client", newAssignment);
      const result = await assignmentCollection.insertOne(newAssignment);
      // console.log(result);
      res.send(result);
    });

    //get data
    app.get("/assignments", async (req, res) => {
        // console.log(req.query);
        // if (condition) {
            
        // }
      const cursor = assignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //delete assignments
    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
    //   console.log(id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await assignmentCollection.deleteOne(query);
    //   console.log(result);
      res.send(result);
    });

    //update
    app.get("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await assignmentCollection.findOne(query);
      res.send(result);
    });

    app.put("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const data = req.body;
    //   console.log(data);
      const updateDetails = {
        $set: {
          title: data.title,
          description: data.description,
          marks: data.marks,
          date: data.date,
          level: data.level,
          url: data.url,
        },
      };
      const result = await assignmentCollection.updateOne(
        filter,
        updateDetails,
        options
      );
      res.send(result);
    });

    //submitted Assignment related api


    //receive data from client side
    app.post("/submittedAssignments", async (req, res) => {
      const submittedAssignment = req.body;
    //   console.log("data received from client", submittedAssignment);
      const result = await submittedAssignmentCollection.insertOne(
        submittedAssignment
      );
      // console.log(result);
      res.send(result);
    });

    //get data
    app.get("/submittedAssignments",verifyToken, async (req, res) => {
      console.log('querrryyyyy',req.query.submittedBy, req.query.all);
    console.log('Verify token user', req.user.email);
    // if (req.query.submittedBy !== req.user?.email) {
    //     return res.status(403).send({Message:'Forbidden Access'})
    // }
      let query = {};
      if (req.query?.submittedBy) {
        query = { submittedBy: req.query.submittedBy };
      }
      const cursor = submittedAssignmentCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //give marks
    app.get("/submittedAssignments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await submittedAssignmentCollection.findOne(query);
      res.send(result);
    });


    app.put("/submittedAssignments/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const data = req.body;
    //   console.log(data);
      const updateDetails = {
        $set: {
          obtainedMarks: data.obtainedMarks,
          feedback: data.feedback,
          status: data.status
        },
      };
    //   console.log(updateDetails);
      const result = await submittedAssignmentCollection.updateOne(
        filter,
        updateDetails,
        options
      );
      res.send(result);
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//
app.get("/", (req, res) => {
  res.send("Learnify server is running");
});

app.listen(port, () => {
  console.log(`Learnify server is running on port:${port}`);
});