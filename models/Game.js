const mongoose = require('mongoose');


const GameSchema = new mongoose.Schema({
    players: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }, {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Guest'
    }],
    number: {
        type: Number,
        default: 0
    },
    scoreA: {
        type: Number,
        default: 0
    },
    scoreB: {
        type: Number,
        default: 0
    },
    board: [{
        position: {
            y: {
                type: Number
            },
            x: {
                type: Number
            }
        },
        player: {
            type: String,
            default: null
        },
        type: {
            type: String,
            default: null
        },
        color: {
            type: String,
            default: '#fff'
        }
    }],
    started: {
        type: Boolean,
        default: false
    },
    finished: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});
module.exports = Game = mongoose.model('Game', GameSchema);