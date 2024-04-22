var config = require('../dbConfig');
const sql = require('mssql')

class Users {
    constructor(ID, USERNAME, PASSWORD, FIRST_NAME, LAST_NAME, PHONE, ROLE, CREATED_AT){
        this.ID = ID;
        this.USERNAME = USERNAME;
        this.PASSWORD = PASSWORD;
        this.FIRST_NAME = FIRST_NAME;
        this.LAST_NAME = LAST_NAME;
        this.PHONE = PHONE;
        this.ROLE = ROLE;
        this.CREATED_AT = CREATED_AT;
    }

    static async findOne(username) {
        try {
            let pool = await sql.connect(config);
            let result = await pool.request()
                .input('username', sql.NVarChar(255), username)
                .query("SELECT TOP 1 * FROM Users WHERE USERNAME = @username");
            if (result.recordset.length > 0) {
                return result.recordset[0]; // Returnează primul utilizator găsit
            } else {
                return null; // Returnează null dacă nu există niciun utilizator cu acel nume de utilizator
            }
        } catch (error) {
            throw error;
        }
    }
    
    
}

module.exports = Users;