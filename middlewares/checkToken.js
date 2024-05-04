import jwt from 'jsonwebtoken';

const checkToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).send('Access token is missing or invalid');
    }
    else {
        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.userId = decoded;
            next();
        } catch (error) {
            res.status(403).send('Invalid token');
        }
    }
}

export default checkToken;