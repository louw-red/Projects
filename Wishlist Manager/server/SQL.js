//const pgp = require('pg-promise')();
//const db = pgp('postgres://postgres:password@localhost:5432/auth_database'); // Replace with your connection details

const bcrypt = require('bcrypt');
//const db2 = pgp('postgres://postgres:password@localhost:5432/auth_database'); // Replace with your connection details

const jwt = require('jsonwebtoken');
const jwtSecret = 'your-secret-keyz'; // Replace with your own secret key
//const decodeToken = require('./decodeTokenMiddleware'); // Import the middleware

async function insertWishlistItem(db, userId, productName, price, imageUrl, url, wishlistName, website) {
    console.log("wshlist name in SQL FUNCTION :", wishlistName)
    console.log("website name in SQL FUNCTION :", website)
    try {
        await db.none('INSERT INTO wishlist(user_id, product_name, price, image_url,url,wishlist_name,website) VALUES($1, $2, $3, $4,$5,$6,$7)', [userId, productName, price, imageUrl, url, wishlistName, website]);
        console.log('Item added to wishlist');

    } catch (error) {
        console.error('Error adding item to wishlist:', error);
    }
}

async function removeWishlistItem(db, userId, itemId) {
    try {
        await db.none('DELETE FROM wishlist WHERE user_id = $1 AND id = $2', [userId, itemId]);
        console.log('Item removed from wishlist');
    } catch (error) {
        console.error('Error removing item from wishlist:', error);
    }
}

async function registerUser(db, username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);
        console.log('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
    }
}

async function loginUser(db, username, password) {
    try {
        const user = await db.one('SELECT * FROM users WHERE username = $1', [username]);
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            const token = jwt.sign({ userId: user.id, wishlistName: '' }, jwtSecret, { expiresIn: '1h' }); // Create a token with user's ID
            console.log('User logged in successfully');
            return token; // Return the generated token

        } else {
            console.log('Invalid password');
            return null; // Return null for invalid login
        }
    } catch (error) {
        console.error('Error logging in:', error);
        return null; // Return null for any error
    }
}

async function getUserWishlistItems(db, userId, wishlistName) {
    try {
        const wishlistItems = await db.any('SELECT * FROM wishlist WHERE user_id = $1 AND wishlist_name = $2 ', [userId, wishlistName]);
        return wishlistItems;
    } catch (error) {
        console.error('Error retrieving wishlist items:', error);
        throw error;
    }
}

// Function to create a new wishlist
async function createWishlist(db, userId, wishlistName) {
    try {
        const result = await db.one('INSERT INTO wishlists(user_id, name) VALUES($1, $2) RETURNING id', [userId, wishlistName]);
        console.log('Wishlist created successfully');
        return { id: result.id };
    } catch (error) {
        console.error('Error creating wishlist:', error);
        throw error;
    }
}

// Function to retrieve user's wishlists
async function getUserWishlists(db, userId) {
    try {
        const wishlists = await db.any('SELECT * FROM wishlists WHERE user_id = $1', userId);
        return wishlists;
    } catch (error) {
        console.error('Error retrieving wishlists:', error);
        throw error;
    }
}





//NB Very dangerous function!! Used to delete the entire User Database! ONLY INTENDED FOR TESTING
async function clearUserDatabase(db) {
    try {
        // Delete all data from the "users" table
        await db.none('DELETE FROM users');
        console.log('User accounts cleared');

    } catch (error) {
        console.error('Error clearing database:', error);
    }
}

//NB Very dangerous function!! Used to delete the entire Wishlist Database! ONLY INTENDED FOR TESTING
async function clearWishlistDatabase(db) {
    try {
        // Delete all data from the "wishlist" table
        await db.none('DELETE FROM wishlist');
        console.log('Wishlist data cleared');

    } catch (error) {
        console.error('Error clearing database:', error);
    }
}

async function removeWishlist(db, userId, wishlistId) {
    try {
        await db.none('DELETE FROM wishlists WHERE user_id = $1 AND id = $2', [userId, wishlistId]);
        console.log('Wishlist removed successfully');
    } catch (error) {
        console.error('Error removing wishlist:', error);
    }
}



module.exports = {
    insertWishlistItem,
    loginUser,
    registerUser,
    getUserWishlistItems,
    removeWishlistItem,
    createWishlist,
    getUserWishlists,
    removeWishlist,
};
