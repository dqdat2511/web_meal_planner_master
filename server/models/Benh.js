const mongoose = require('mongoose');


const benhSchema = new mongoose.Schema({
    name: {
        type: String
    }
});
module.exports = mongoose.model('Benh',benhSchema);