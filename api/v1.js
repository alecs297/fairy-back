import { Router } from "express";

import dotenv from "dotenv";

import jwt from "../utils/jwt.js";
import { login, register, changePassword } from "../utils/auth.js";
import Split from "../models/split.js";
import User from "../models/user.js";

dotenv.config();
const tokenGenerator = new jwt(process.env.JWT_CERT, process.env.JWT_KEY, process.env.JWT_DURATION);

const router =  Router()
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await login(username, password)
        const token = tokenGenerator.sign({
            username: user.username,
            name: user.name,
            id: user._id
        });
        res.json({ token });
    } catch (error) {
        res.json({status: 401, message: error.message });
    }
})

router.post("/register", async (req, res) => {
    try {
        const { username, password, name } = req.body;
        const user = await register(username, password, name);
        const token = tokenGenerator.sign({
            username: user.username,
            name: user.name,
            id: user._id
        });
        res.json({ token });
    } catch (error) {
        res.json({status: 401, message: error.message });
    }
})

router.post("/password", tokenGenerator.validateToken, async (req, res) => {
    try {
        await changePassword(req.user.id, req.body.password, req.body.newPassword);
        res.json({});
    } catch (error) {
        res.json({status: 401, message: error.message });
    }
})

router.get("/splits/:id", async (req, res) => {
    try {
        const split = await Split.findById(req.params.id);
        res.json(split);
    } catch (error) {
        res.json({status: 500, message: "Internal server error"});
    }
    
})

router.put("/splits/:id", tokenGenerator.validateToken, async (req, res) => {
    try {
        const split = await Split.findOne({
            _id: req.params.id,
            owner: req.user.id
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
    
            await split.save();
            res.json(split);
        } else {
            res.json({status: 404, message: "Not found"});
        }
    } catch (error) {
        res.json({status: 500, message: "Internal server error"});
    }
})

router.delete("/splits/:id", tokenGenerator.validateToken, async (req, res) => {
    try {
        const split = await Split.findOne({
            _id: req.params.id,
            owner: req.user.id
        });
        if (split) {
            await split.deleteOne();
            res.json({});
        } else {
            res.json({status: 404, message: "Not found"});
        }
    } catch (error) {
        res.json({status: 500, message: "Internal server error"});
    }
})

router.get("/splits", tokenGenerator.validateToken, async (req, res) => {
    try {
        const splits = await Split.find({ owner: req.user.id });
        res.json(splits);
    } catch (error) {
        res.json({status: 500, message: "Internal server error"});
    }
    
})

router.post("/splits", tokenGenerator.validateToken, async (req, res) => {
    try {
        const split = new Split();
        split.name = "New Split";
        split.date = new Date();
        split.users = [req.user.username];
        split.owner = await User.findById(req.user.id)
        await split.save();
        res.json(split);
    } catch (error) {
        res.json({status: 500, message: "Internal server error"});
    }
})
export default router;