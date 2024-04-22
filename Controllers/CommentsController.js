var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')

async function getComment(ID) {
    try {
        let pool = await sql.connect(config);
        let comment = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("SELECT * FROM Comments WHERE ID = @input_parameter");
        if (!comment.recordsets || !comment.recordsets[0][0]?.ID) {
            return ResponseHandler(404, 'Eroare: ', null, 'Comentariul nu a fost găsit.')
        }
        return ResponseHandler(200, null, comment.recordsets, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getAllCommentsByPatientID(ID){
    try{
        let pool = await sql.connect(config);
        let comments = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("SELECT * FROM Comments WHERE PATIENT_ID = @input_parameter");
        return ResponseHandler(200, null, comments.recordsets, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function addComment(comment) {
    try {
        let currentDate = new Date().toISOString();
        currentDate = new Date(new Date(currentDate).getTime() + 3 * 60 * 60 * 1000).toISOString();

        let pool = await sql.connect(config);
        let addCommentQuery = `
            INSERT INTO Comments (PATIENT_ID, COMMENT, CREATED_AT)
            VALUES (@PATIENT_ID, @COMMENT, @CREATED_AT)
        `;
        let result = await pool.request()
            .input('PATIENT_ID', sql.Int, comment.PATIENT_ID)
            .input('COMMENT', sql.NVarChar, comment.COMMENT)
            .input('CREATED_AT', sql.DateTime, currentDate)
            .query(addCommentQuery);
        return ResponseHandler(200, 'Comentariul a fost adăugat cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function deleteComment(ID) {
    try {
        const comment = await getComment(ID);
        if (!comment || comment.status === 404) {
            return ResponseHandler(404, 'Eroare: ', null, 'Comentariul nu a fost găsit.')
        }

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("DELETE FROM Comments WHERE ID = @input_parameter");
        return ResponseHandler(200, 'Comentariul a fost șters cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    getAllCommentsByPatientID : getAllCommentsByPatientID,
    addComment : addComment,
    deleteComment : deleteComment,
}