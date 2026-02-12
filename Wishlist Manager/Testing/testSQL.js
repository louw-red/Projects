const pgp = require('pg-promise')();
const db = pgp('postgres://postgres:password@localhost:5432/auth_database'); // Replace with your connection details

const bcrypt = require('bcrypt');

async function registerUser(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        await db.none('INSERT INTO users(username, password) VALUES($1, $2)', [username, hashedPassword]);
        console.log('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
    }
}

registerUser('user123', 'securepassword');