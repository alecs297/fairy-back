import { Schema } from "mongoose";
import randomBytes from "crypto";


export default new Schema({
    _id: {
        type: String,
        required: true,
        unique: true,
        default: () => randomBytes(32).toString('hex')
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    users: [{
        type: String,
        required: true,
        unique: true
    }],
    transactions: [{
        name: {
            type: String,
            required: true
        },
        payer: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        }
    }]
});