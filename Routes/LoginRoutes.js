const express = require('express');
const router = express.Router();

const Users = require('../Models/UsersModel');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await Users.findOne(username);
        if (!user || !bcrypt.compareSync(password, user.PASSWORD)) {
            return res.status(400).json({ message: 'Nume de utilizator sau parolă incorectă.' });
        }

        res.json({
            id: user.ID,
            username: user.USERNAME,
            role: user.ROLE,
        });
    } catch (error) {
        console.error('Eroare la autentificare:', error);
        res.status(500).json({ message: 'Eroare la autentificare. Vă rugăm să încercați din nou mai târziu.' });
    }
});

module.exports = router;
