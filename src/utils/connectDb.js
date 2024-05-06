const { MongoClient } = require("mongodb");

const db = {};
const MONGODB_URL = "mongodb://127.0.0.1:27017";
const DATABASE = "my-blog";

async function connectDb() {
  console.log("Connect to database successfully!!");
  const client = new MongoClient(MONGODB_URL);
  await client.connect();
  const database = client.db(DATABASE);

  db.posts = database.collection("posts");
  db.users = database.collection("users");
  db.comments = database.collection("comments");
  db.reactions = database.collection("reactions");
  db.companies = database.collection("companies");
  db.overviews = database.collection("overviews");
  db.experiences = database.collection("experiences");
  db.educations = database.collection("educations");
  db.messages = database.collection("messages");
  db.jobstatus = database.collection("jobstatus");
}

module.exports = { connectDb, db };