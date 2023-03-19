import express from "express";
import http from "http";
import https from "https";
import { readFileSync } from "fs";
import cors from "cors";
import dotenv from "dotenv";
import { connect } from "mongoose";

import v1 from "./api/v1.js";

dotenv.config();

const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;
const SSL = {
    enabled: process.env.USE_SSL === "true",
    key: process.env.SSL_KEY,
    cert: process.env.SSL_CERT
};

await connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

console.info("Connected to MongoDB");

const app = express();
const server = SSL.enabled ? https.createServer({
    key: readFileSync(SSL.key),
    cert: readFileSync(SSL.cert),
}, app) : http.createServer(app);


app.use(express.urlencoded({extended: false}));
app.use(express.json({extended: true}));
app.use(cors({origin: [process.env.CLIENT_URL]}));

app.use("/api/v1", v1);
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

server.listen(PORT, HOST, () => {
    console.info(`Listening on ${SSL.enabled ? "https" : "http"}//${HOST}:${PORT}`);
});