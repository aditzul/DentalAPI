var config = require('../dbConfig');
const sql = require('mssql')
const bcrypt = require('bcrypt');
const Users = require('../Models/UsersModel');
const ResponseHandler = require ('../Others/ResponseHandler')
const HelperFunctions = require ('../Others/HelperFunctions')

async function getAllUsers(){
    try{
        let pool = await sql.connect(config);
        let users = await pool.request().query('SELECT * FROM Users');
        
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(users.recordsets[0]), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getAllMedics(){
    try{
        let pool = await sql.connect(config);
        let medics = await pool.request().query('SELECT * FROM Users WHERE Role = 1');
        
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(medics.recordsets[0]), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getUser(ID) {
    try {
        let pool = await sql.connect(config);
        let user = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("SELECT * FROM Users WHERE ID = @input_parameter");
        
        if (!user.recordsets || !user.recordsets[0][0]?.ID) {
            return ResponseHandler(404, 'Eroare: ', null, 'Utilizatorul nu a fost găsit.')
        }
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(user.recordsets[0]), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function addUser(user) {
    try {
        let currentDate = new Date().toISOString();
        currentDate = new Date(new Date(currentDate).getTime() + 3 * 60 * 60 * 1000).toISOString();
    
        const hashedPassword = await bcrypt.hash(user.password, 10); // Numărul de rotații pentru hashing

        let pool = await sql.connect(config);
        let addUserQuery = `
            INSERT INTO Users (USERNAME, PASSWORD, FIRST_NAME, LAST_NAME, PHONE, ROLE, CREATED_AT)
            VALUES (@USERNAME, @PASSWORD, @FIRST_NAME, @LAST_NAME, @PHONE, @ROLE, @CREATED_AT)
        `;
        let result = await pool.request()
            .input('username', sql.NVarChar, user.username)
            .input('password', sql.NVarChar, hashedPassword)
            .input('first_name', sql.NVarChar, user.first_name)
            .input('last_name', sql.NVarChar, user.last_name)
            .input('phone', sql.NVarChar, user.phone)
            .input('role', sql.Int, user.role)
            .input('created_at', sql.DateTime, currentDate)
            .query(addUserQuery);
        return ResponseHandler(200, 'Utilizatorul a fost adăugat cu succes.', null, null)
    } catch (error) {
        if (error.message.includes("Violation of UNIQUE KEY constraint 'unique_username'")) {
            return ResponseHandler(400, 'Eroare la adăugarea utilizatorului: ', null, "Numele de utilizator '" + user.username + "' este deja folosit. Te rog alege un altul.")
        } else {
            return ResponseHandler(500, 'Eroare server: ', null, error.message)
        }
    }
}

async function deleteUser(ID) {
    try {
        // Verificăm dacă utilizatorul există folosind funcția getUser
        const user = await getUser(ID);
        if (!user || user.status === 404) {
            return ResponseHandler(404, 'Eroare: ', null, 'Utilizatorul nu a există.')
        }

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("DELETE FROM Users WHERE ID = @input_parameter");
        return ResponseHandler(200, 'Utilizatorul a fost șters cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function updateUser(ID, updates) {
    try {
        let updateQuery = 'UPDATE Users SET ';
        let queryParams = [];
        Object.keys(updates).forEach((key, index) => {
            if (key === 'id') {
                return; // Exclude ID from updates
            }
            if (key === 'password') {
                // Dacă se actualizează parola, criptează noua parolă
                updateQuery += `${key} = @password`;
                queryParams.push({ name: 'password', type: sql.NVarChar, value: bcrypt.hashSync(updates[key], 10) });
            } else {
                updateQuery += `${key} = @param${index}`;
                // Verificăm tipul de date al valorii și alegem tipul de parametru SQL corespunzător
                let valueType = typeof updates[key] === 'number' ? sql.Int : sql.NVarChar;
                queryParams.push({ name: `param${index}`, type: valueType, value: updates[key] });
            }

            if (index < Object.keys(updates).length - 1) {
                updateQuery += ', ';
            }
        });

        updateQuery += ' WHERE ID = @ID';
        queryParams.push({ name: 'ID', type: sql.Int, value: ID });

        let pool = await sql.connect(config);
        let request = pool.request();
        queryParams.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        let result = await request.query(updateQuery);
        return ResponseHandler(200, 'Utilizatorul a fost actualizat cu succes.', null, null)
    } catch (error) {
        if (error.message.includes("Violation of UNIQUE KEY constraint 'unique_username'")) {
            return ResponseHandler(400, 'Eroare la actualizarea utilizatorului: ', null, "Numele de utilizator '" + updates.username + "' este deja folosit. Te rog alege un altul.")
        } else {
            return ResponseHandler(500, 'Eroare server: ', null, error.message)
        }
    }
}

async function getLastUserID() {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query("SELECT MAX(ID) AS LastUserID FROM Users");
        
        if (result.recordset.length > 0) {
            return ResponseHandler(200, null, result.recordset[0].LastUserID, null)
        } else {
            return ResponseHandler(404, 'Eroare: ', null, 'Nu există nici un utilizator în baza de date.')
        }
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function Login(username, password) {
    try {
        const user = await Users.findOne(username);
        if (!user || !bcrypt.compareSync(password, user.PASSWORD)) {
            return ResponseHandler(400, 'Nume de utilizator sau parolă incorectă.', null, null);
        }

        const result = {
            status: 200,
            id: user.ID,
            username: user.USERNAME,
            role: user.ROLE,
            first_name: user.FIRST_NAME,
            last_name: user.LAST_NAME,  
            phone: user.PHONE
        };
        return ResponseHandler(200, 'Autentificat cu succes.', HelperFunctions.transformKeysToLowercase(result), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message) 
    }
}

module.exports = {
    getAllUsers : getAllUsers,
    getUser : getUser,
    getAllMedics : getAllMedics,
    addUser : addUser,
    deleteUser : deleteUser,
    updateUser : updateUser,
    getLastUserID : getLastUserID,
    Login : Login
    
}