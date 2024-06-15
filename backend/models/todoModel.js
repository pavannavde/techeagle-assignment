const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const todoSchema = new Schema({
    todo :{
        type : String,
        require : true,
    },
    username :{
        type : String,
        require : true,
    },
    duration :{
        type : Number,
        default : 0
    },
    status :{
        type : String,
        default : "Pending"
    }
})

module.exports = mongoose.model('todo',todoSchema);