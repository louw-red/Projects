const express = require('express');

//For debugging
const moment = require('moment');

const decodeToken = require('./decodeTokenMiddleware'); // Import the middleware

const scrapeWebsite = require('./Webscrape');
const cors = require('cors'); // Import the cors middleware
const { insertWishlistItem, registerUser, removeWishlist,
    loginUser, getUserWishlistItems, removeWishlistItem, createWishlist, getUserWishlists, } = require('./SQL');
const jwt = require('jsonwebtoken');

const app = express();

// Create a connection to the database
const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:password@localhost:5432/auth_database');

// Use the cors middleware to allow cross-origin requests
app.use(cors());

const jwtSecret = 'your-secret-keyz'; // Replace with your own secret key

// Define a route for web scraping
app.get('/scrape', async (req, res) => {
    const productUrl = req.query.productUrl;
    try {
        const productInfo = await scrapeWebsite(productUrl);
        res.json(productInfo);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred during web scraping.' });
    }
});


app.use(express.json()); // Parse JSON requests

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const token = await loginUser(db, username, password);
        if (token) {
            res.status(200).json({ token }); // Return the token in the response
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'An error occurred while logging in' });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        await registerUser(db, username, password);
        res.status(200).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'An error occurred while registering the user' });
    }
});

app.post('/addItem', async (req, res) => {
    const { productName, price, imageUrl, link, wishlistName, website } = req.body;
    console.log("req_body: wishlistName", wishlistName);
    console.log("req_body: website", website);
    try {
        const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

        const decodedToken = jwt.verify(token, jwtSecret); // Decode the token
        const userId = decodedToken.userId; // Get the user ID from the decoded token
        //const wishlistName = decodedToken.wishlistName
        // Insert the item into the database
        await insertWishlistItem(db, userId, productName, price, imageUrl, link, wishlistName, website);

        // Respond with success
        res.status(200).json({ message: 'Item added to wishlist' });
    } catch (error) {
        console.error('Error adding item to wishlist:', error);
        res.status(500).json({ error: 'An error occurred while adding the item to wishlist' });
    }
});

// Example route for refreshing an item
app.post('/refreshItem/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    console.log("what this? ", itemId)
    // Perform item refresh logic (e.g., web scraping or updating information)
    // ...

    res.status(200).json({ message: 'Item refreshed successfully' });
});



app.delete('/removeItem/:itemId', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header
    const decodedToken = jwt.verify(token, jwtSecret); // Decode the token
    const userId = decodedToken.userId; // Get the user ID from the decoded token
    const itemId = req.params.itemId; // Get the item ID from the request parameter

    try {
        // Remove the item from the database
        await removeWishlistItem(db, userId, itemId);
        res.status(200).json({ message: 'Item removed from wishlist' });
    } catch (error) {
        console.error('Error removing item:', error);
        res.status(500).json({ error: 'An error occurred while removing the item from wishlist' });
    }
});

app.get('/wishlist', decodeToken, async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header
    const wishlistId = req.query.wishlistId;
    const decodedToken = jwt.verify(token, jwtSecret); // Decode the token
    const userId = decodedToken.userId; // Get the user ID from the decoded token
    const wishlistName = wishlistId;
    try {
        // Retrieve the user's wishlist items from the database
        const wishlistItems = await getUserWishlistItems(db, userId, wishlistName);
        res.status(200).json({ wishlistName, wishlistItems });
    } catch (error) {
        console.error('Error retrieving wishlist items:', error);
        res.status(500).json({ error: 'An error occurred while retrieving wishlist items' });
    }
});

app.post('/createWishlist', async (req, res) => {
    const { wishlistName } = req.body;
    //  console.log("body: ", req.body);
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header
    const decodedToken = jwt.verify(token, jwtSecret); // Decode the token
    const userId = decodedToken.userId; // Get the user ID from the decoded token
    //  console.log(decodedToken)

    try {
        const createdWishlist = await createWishlist(db, userId, wishlistName);
        res.status(200).json({ message: "Wishlist create", id: createdWishlist.id });
    } catch (error) {
        console.error('Error creating wishlist:', error);
        res.status(500).json({ error: 'An error occurred while creating the wishlist' });
    }
});

app.get('/wishlists', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header
    //const currentDate = moment().format('YYYY-MM-DD');
    const decodedToken = jwt.verify(token, jwtSecret); // Decode the token
    const userId = decodedToken.userId; // Get the user ID from the decoded token

    try {
        // Retrieve the user's wishlists from the database
        const wishlists = await getUserWishlists(db, userId);
        res.status(200).json({ wishlists });
    } catch (error) {
        console.error('Error retrieving wishlists:', error);
        res.status(500).json({ error: 'An error occurred while retrieving wishlists' });
    }
});

app.delete('/removeWishlist/:wishlistId', async (req, res) => {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header
    const decodedToken = jwt.verify(token, jwtSecret); // Decode the token
    const userId = decodedToken.userId; // Get the user ID from the decoded token
    const wishlistId = req.params.wishlistId; // Get the wishlist ID from the request parameter

    try {
        // Remove the wishlist from the database
        await removeWishlist(db, userId, wishlistId);
        res.status(200).json({ message: 'Wishlist removed' });
    } catch (error) {
        console.error('Error removing wishlist:', error);
        res.status(500).json({ error: 'An error occurred while removing the wishlist' });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});