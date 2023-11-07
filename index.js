const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5001;

//middleware
app.use(cors());
app.use(express.json());

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
    
    const submittedAssignmentCollection = client.db('Learnify').collection('submittedAssignment')

    //receive data from client side
    app.post("/assignments", async (req, res) => {
      const newAssignment = req.body;
      console.log("data received from client", newAssignment);
      const result = await assignmentCollection.insertOne(newAssignment);
      // console.log(result);
      res.send(result);
    });

    //get data
    app.get("/assignments", async (req, res) => {
      const cursor = assignmentCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //delete assignments
    app.delete("/assignments/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await assignmentCollection.deleteOne(query);
      console.log(result);
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
      console.log(data);
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


    //submitted Assignment
        //receive data from client side
        app.post("/submittedAssignments", async (req, res) => {
            const submittedAssignment = req.body;
            console.log("data received from client", submittedAssignment);
            const result = await submittedAssignmentCollection.insertOne(submittedAssignment);
            // console.log(result);
            res.send(result);
          });
      
          //get data
          app.get("/submittedAssignments", async (req, res) => {
            console.log(req.query.submittedBy);
            let query = {};
            if (req.query?.submittedBy) {
                query ={submittedBy :req.query.submittedBy}
            }
            const cursor = submittedAssignmentCollection.find(query);
            const result = await cursor.toArray();
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
