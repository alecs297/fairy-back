import { Schema } from "mongoose";

export default new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    transactions: [{
        type: Schema.Types.ObjectId,
        ref: "Transaction"
    }]
});