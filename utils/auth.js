import {hash, verify} from 'argon2';
import User from '../models/user.js';

function hashPassword(password) {
    return hash(password);
}

async function checkPassword(password, hash) {
    return await verify(hash, password);
}

function isValidName(name) {
    // regex match lowercase, uppercase, spaces, minimum 2 characters
    return name.match(/^[a-zA-Z ]{2,}$/);
}

function isValidUsername(username) {
    // regex match lowercase or numbers, minimum 3 characters
    return username.match(/^[a-z0-9]{3,}$/)
}

function isValidPassword(password) {
    // regex match lowercase, uppercase, number, special character, minimum 8 characters
    return password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,}$/);
}

export async function login(username, password) {
    let user = await User.findOne({username: username});
    if (user) {
        if (await checkPassword(password, user.password)) {
            return user;
        }
    }
    throw new Error('Invalid username or password');
}

export async function register(username, password, name) {
    let existing = await User.findOne({username: username});
    if (existing) throw new Error('Username already exists');
    if (!isValidUsername(username)) throw new Error('Username is invalid');
    if (!isValidPassword(password)) throw new Error('Password is invalid');
    if (!isValidName(name)) throw new Error('Name is invalid');
    let hash = await hashPassword(password);
    let user = new User({
        username: username,
        password: hash,
        name: name
    });
    await user.save();
    return user;
}

export async function changePassword(id, password, newPassword) {
    let user = await User.findById(id);
    if (!user) throw new Error('User not found');
    if (!(await checkPassword(password, user.password))) throw new Error('Invalid password');
    if (!isValidPassword(newPassword)) throw new Error('New Password is invalid');
    let hash = await hashPassword(newPassword);
    user.password = hash;
    await user.save();
    return user;
}