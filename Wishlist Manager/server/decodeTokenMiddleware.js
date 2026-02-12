const jwt = require('jsonwebtoken');
const jwtSecret = 'your-secret-keyz'; // Replace with your own secret key

function decodeToken(req, res, next) {
    const token = req.headers.authorization.split(' ')[1]; // Assuming the token is sent in the 'Authorization' header
    if (!token) {
        return res.status(401).json({ message: 'Authentication failed: No token provided' });
    }

    try {
        const decodedToken = jwt.verify(token, jwtSecret); // Replace with your actual secret key
        req.wishlistName = decodedToken.wishlistName; // Store the wishlistName in the request object
        req.userid = decodedToken.userId;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }
}

module.exports = decodeToken;