var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')
const HelperFunctions = require ('../Others/HelperFunctions')

async function getAllIssues(){
    try{
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM MedicalIssues');
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(result.recordsets[0]), null)

    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function addIssue(body) {
    try {

        let pool = await sql.connect(config);
        let addQuery = `
            INSERT INTO MedicalIssues (ID, MEDICAL_ISSUE_NAME)
            VALUES (@ID, @MEDICAL_ISSUE_NAME)
        `;
        let result = await pool.request()
            .input('id', sql.Int, body.id)
            .input('medical_issue_name', sql.Int, body.medical_issue_name)
            .query(addQuery);
        return ResponseHandler(200, 'Afecțiunea a fost adăugată cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function deleteIssue(ID) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("DELETE FROM MedicalIssues WHERE ID = @input_parameter");
        return ResponseHandler(200, 'Afecțiunea a fost ștearsă cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    getAllIssues : getAllIssues,
    addIssue : addIssue,
    deleteIssue : deleteIssue,
}
