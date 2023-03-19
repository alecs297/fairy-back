import { Router } from "express";

import dotenv from "dotenv";

import jwt from "../utils/jwt.js";
import { login } from "../utils/auth.js";
import Split from "../models/split.js";

dotenv.config();
const token = new jwt(process.env.JWT_CERT, process.env.JWT_KEY);

export default Router()
    .post("/login", async (req, res) => {
        const { username, password } = req.body;
        try {
            let user = login(username, password)
            const token = token.sign({
                username: user.username,
                name: user.name
            });
            res.json({ token });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    })
    .post("/register", async (req, res) => {
        const { username, password, name } = req.body;
        try {
            let user = register(username, password, name);
            const token = token.sign({
                username: user.username,
                name: user.name
            });
            res.json({ token });
        } catch (error) {
            res.status(401).json({ message: error.message });
        }
    })
    .get("/splits/:id", async (req, res) => {
        const split = await Split.findById(req.params.id);
        res.json(split);
    })
    .get("/splits", token.validateToken, async (req, res) => {
        const splits = await Split.find({ users: req.user.username });
        res.json(splits);
    })
    .post("/splits", token.validateToken, async (req, res) => {
        const split = new Split();
        split.name = "New Split";
        split.date = new Date();
        split.users = [req.user.username];
        await split.save();
        res.json(split);
    })
