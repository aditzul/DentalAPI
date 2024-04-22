const Users = require('../Models/UsersModel');
const bcrypt = require('bcrypt');
const ResponseHandler = require ('../Others/ResponseHandler')

async function Login() {
    const loginUser = async (username, password) => {
        try {
            const user = await Users.findOne(username);
            if (!user || !bcrypt.compareSync(password, user.PASSWORD)) {
                throw new Error('Nume de utilizator sau parolă incorectă.');
            }
    
            return {
                id: user.ID,
                username: user.USERNAME,
                role: user.ROLE,
                first_name: user.FIRST_NAME,
                last_name: user.LAST_NAME,  
                phone: user.PHONE
            };
        } catch (error) {
            console.error('Eroare la autentificare:', error);
            throw new Error('Eroare la autentificare. Vă rugăm să încercați din nou mai târziu.');
        }
    };    
}

module.exports = Login