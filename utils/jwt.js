import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';

export default class {
    constructor(certPath, keyPath, expiresIn = '1Om') {
        this.cert = readFileSync(certPath);
        this.key = readFileSync(keyPath);
        this.expiresIn = expiresIn;
    }

    verify(token) {
        return jwt.verify(token, this.cert, { algorithms: ['RS256'] })
    }

    sign(payload) {
        return jwt.sign(payload, this.key, {
            algorithm: 'RS256',
            expiresIn: this.expiresIn
        });
    }

    validateToken = (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        try {
            const payload = this.verify(token);
            req.user = payload;
            next();
        } catch (err) {
            console.error(err);
            return res.status(403).json({ message: 'Forbidden' });
        }
    }

}