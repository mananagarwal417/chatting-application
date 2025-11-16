const mongoose = require('mongoose');

async function connectToDatabase(url) {
  await mongoose.connect(url)
  .then(()=>{
    console.log("Connected to mongoDB!");
  })
  .catch((err)=>{
    console.log("Error connecting to mongoDB:", err);
  })
}
module.exports = connectToDatabase;