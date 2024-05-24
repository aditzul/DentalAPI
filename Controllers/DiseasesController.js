var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')
const HelperFunctions = require ('../Others/HelperFunctions')

async function getAllDiseases(){
    try{
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM DentalDiseases');
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(result.recordsets[0]), null)

    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function addDisease(body) {
    try {
        let pool = await sql.connect(config);
        let addQuery = `
            INSERT INTO DentalDiseases (DISEASE_NAME)
            VALUES (@DATA)
        `;
        let result = await pool.request()
            .input('data', sql.NVarChar, body.data)
            .query(addQuery);
        return ResponseHandler(200, 'Afecțiunea a fost adăugată cu succes.', null, null)
    } catch (error) {
        if (error.message.includes("Violation of UNIQUE KEY")) {
            return ResponseHandler(400, 'Eroare la adăugare: ', null, "Valoarea '" + body.data + "' exista deja în baza de date.")
        } else {
            return ResponseHandler(500, 'Eroare server: ', null, error.message)
        }
    }
}

async function deleteDisease(ID) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("DELETE FROM DentalDiseases WHERE ID = @input_parameter");
        return ResponseHandler(200, 'Afecțiunea a fost ștearsă cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    getAllDiseases : getAllDiseases,
    addDisease : addDisease,
    deleteDisease : deleteDisease,
}
