import { Router } from "express";

import dotenv from "dotenv";

import jwt from "../utils/jwt.js";
import { login, register } from "../utils/auth.js";
import Split from "../models/split.js";

dotenv.config();
const tokenGenerator = new jwt(process.env.JWT_CERT, process.env.JWT_KEY, process.env.JWT_DURATION);

const router =  Router()
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await login(username, password)
        const token = tokenGenerator.sign({
            username: user.username,
            name: user.name
        });
        res.json({ token });
    } catch (error) {
        res.json({status: 401, message: error.message });
    }
})

router.post("/register", async (req, res) => {
    const { username, password, name } = req.body;
    try {
        let user = await register(username, password, name);
        const token = tokenGenerator.sign({
            username: user.username,
            name: user.name
        });
        res.setHeader("Authorization", token);
    } catch (error) {
        res.json({status: 401, message: error.message });
    }
})

router.get("/splits/:id", async (req, res) => {
    const split = await Split.findById(req.params.id);
    res.json(split);
})

router.put("/splits/:id", tokenGenerator.validateToken, async (req, res) => {
    const split = await Split.findOne({
        _id: req.params.id,
        users: req.user.username
    });
    if (split) {
        let hasUniqueMembers = req.body.users.reduce((acc, member) => {
            if (!member || acc.map(e => e?.trim?.()).includes(member.trim())) {
                return false;
            }
            return [...acc, member];
        }, []).length === req.body.users.length;

        if (!hasUniqueMembers) throw new Error("Members must be unique");

        let splitsHaveMembers = req.body.transactions.filter(transaction => !req.body.users.includes(transaction.payer)).length === 0;

        if (!splitsHaveMembers) throw new Error("All transactions must have a payer that is a member of the split");

        split.name = req.body.name;
        split.users = req.body.users;
        split.transactions = req.body.transactions;

        try {
            await split.save();
            res.json(split);
        } catch (error) {
            res.json({status: 500, message: "Internal server error"});
        }
    }
})

router.get("/splits", tokenGenerator.validateToken, async (req, res) => {
    const splits = await Split.find({ users: req.user.username });
    res.json(splits);
})

router.post("/splits", tokenGenerator.validateToken, async (req, res) => {
    const split = new Split();
    split.name = "New Split";
    split.date = new Date();
    split.users = [req.user.username];
    await split.save();
    res.json(split);
})

export default router;