const mongoose = require('mongoose');

// Define the Data schema
const DataSchema = new mongoose.Schema({
  name: String,
  date: Date,
  // Add other fields as per your CSV structure
});

// Create the Data model
const DataModel = mongoose.model('Data', DataSchema);

module.exports = DataModel;
