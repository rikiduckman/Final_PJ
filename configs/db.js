const mongoose = require('mongoose');

module.exports = () => {
    return mongoose.connect('mongodb+srv://chanakit:Ausry11043123@cluster0.ex9po.mongodb.net/login')
    .then(() => {
        console.log('Connected to MongoDB Cloud');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB Cloud:', error);
        process.exit(1); // Exit process with failure
    });
};
