import { model, Schema } from "mongoose";


export default model("split", new Schema({
    name: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    users: [{
        type: String,
        required: true
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    transactions: [{
        name: {
            type: String
        },
        payer: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            default: 0,
            min: 0
        }
    }]
}));