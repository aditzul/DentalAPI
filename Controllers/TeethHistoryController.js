var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')
const HelperFunctions = require ('../Others/HelperFunctions')

async function getTeethHistory(patient_id, tooth_id) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('patient_id', sql.Int, patient_id)
            .input('tooth_id', sql.Int, tooth_id)
            .query("SELECT PDW.*, DW.WORK_NAME FROM PatientsDentalWorks AS PDW JOIN DentalWorks AS DW ON PDW.DENTAL_WORK_ID = DW.ID WHERE PDW.PATIENT_ID = @patient_id AND PDW.TOOTH_ID = @tooth_id");

        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(result.recordset), null);
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message);
    }
}

async function getTeethHistoryByPatientID(patient_id) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('patient_id', sql.Int, patient_id)
            .query("SELECT PDW.*, DW.WORK_NAME FROM PatientsDentalWorks AS PDW JOIN DentalWorks AS DW ON PDW.DENTAL_WORK_ID = DW.ID WHERE PDW.PATIENT_ID = @patient_id");
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(result.recordset), null);
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message);
    }
}

async function addTeethHistory(body) {
    try {
        let currentDate = new Date().toISOString();
        console.log(body)
        let pool = await sql.connect(config);
        let addQuery = `
            INSERT INTO PatientsDentalWorks (PATIENT_ID, TOOTH_ID, DENTAL_WORK_ID, EXTRACTED, COMMENT, [DATE])
            VALUES (@PATIENT_ID, @TOOTH_ID, @DENTAL_WORK_ID, @EXTRACTED, @COMMENT, @DATE)
        `;
        let result = await pool.request()
            .input('PATIENT_ID', sql.Int, body.patient_id)
            .input('TOOTH_ID', sql.Int, body.tooth_id)
            .input('DENTAL_WORK_ID', sql.Int, body.dental_work_id)
            .input('EXTRACTED', sql.Int, body.extracted)
            .input('COMMENT', sql.NVarChar, body.comment)
            .input('DATE', sql.DateTime, currentDate)
            .query(addQuery);
        return ResponseHandler(200, 'Lucrarea a fost adăugată cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function updateTeethHistory(ID, updates) {
    try {
        let updateQuery = 'UPDATE PatientsDentalWorks SET ';
        let queryParams = [];
        Object.keys(updates).forEach((key, index) => {
            if (key === 'id') {
                return; // Exclude ID from updates
            }
            updateQuery += `${key} = @param${index}`;
            // Verificăm tipul de date al valorii și alegem tipul de parametru SQL corespunzător
            let valueType = typeof updates[key] === 'number' ? sql.Int : sql.NVarChar;
            queryParams.push({ name: `param${index}`, type: valueType, value: updates[key] });

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
        return ResponseHandler(200, 'Lucrarea a fost actualizată cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function deleteTeethHistory(ID) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("DELETE FROM PatientsDentalWorks WHERE ID = @input_parameter");
        return ResponseHandler(200, 'Lucrarea a fost ștearsă cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    getTeethHistory : getTeethHistory,
    getTeethHistoryByPatientID : getTeethHistoryByPatientID,
    addTeethHistory : addTeethHistory,
    updateTeethHistory : updateTeethHistory,
    deleteTeethHistory : deleteTeethHistory,
}
