var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')
const HelperFunctions = require ('../Others/HelperFunctions');

async function getAllAppointmentsByPatientID(ID){
    try{
        let pool = await sql.connect(config);
        let appointments = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("SELECT * FROM Appointments WHERE PATIENT_ID = @input_parameter");
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(appointments.recordsets), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getAllAppointmentsByMedicID(ID){
    try{
        let pool = await sql.connect(config);
        let appointments = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("SELECT * FROM Appointments WHERE MEDIC_ID = @input_parameter");
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(appointments.recordsets), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getAllAppointments(){
    try{
        let pool = await sql.connect(config);
        let appointments = await pool.request().query('SELECT * FROM Appointments');
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(appointments.recordsets), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function addAppointment(appointment) {
    try {
        let currentDate = new Date().toISOString();
        currentDate = new Date(new Date(currentDate).getTime() + 3 * 60 * 60 * 1000).toISOString();

        let pool = await sql.connect(config);
        let addAppointmentQuery = `
            INSERT INTO Appointments (PATIENT_ID, MEDIC_ID, [START], [END], TITLE, META, CREATED_AT)
            VALUES (@PATIENT_ID, @MEDIC_ID, @START, @END, @TITLE, @META, @CREATED_AT)
        `;
        let result = await pool.request()
            .input('patient_id', sql.Int, appointment.patient_id)
            .input('medic_id', sql.Int, appointment.medic_id)
            .input('start', sql.DateTime, appointment.start)
            .input('end', sql.DateTime, appointment.end)
            .input('title', sql.NVarChar, appointment.title)
            .input('meta', sql.NVarChar, appointment.meta)
            .input('created_at', sql.DateTime, currentDate)
            .query(addAppointmentQuery);
        return ResponseHandler(200, 'Programarea a fost adăugată cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function updateAppointment(ID, updates) {
    try {
        let updateQuery = 'UPDATE Appointments SET ';
        let queryParams = [];
        Object.keys(updates).forEach((key, index) => {
            // Verificăm dacă cheia este 'start' sau 'end' și o tratăm corespunzător
            if (key === 'start' || key === 'end') {
                // Folosim paranteze pătrate pentru a delimita numele coloanei
                updateQuery += `[${key}] = @param${index}`;
            } else {
                updateQuery += `${key} = @param${index}`;
            }
            
            // Verificăm tipul de date al valorii și alegem tipul de parametru SQL corespunzător
            let valueType = typeof updates[key] === 'number' ? sql.DateTime : sql.NVarChar;
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
        return ResponseHandler(200, 'Programarea a fost actualizată cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function deleteAppointment(ID) {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("DELETE FROM Appointments WHERE ID = @input_parameter");
        return ResponseHandler(200, 'Programarea a fost ștearsă cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getLastAppointmentID() {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query("SELECT MAX(ID) AS LastAppointmentID FROM Appointments");
        
        if (result.recordset.length > 0) {
            return ResponseHandler(200, null, result.recordset[0].LastAppointmentID, null)
        } else {
            return ResponseHandler(404, 'Eroare: ', null, 'Nu există nici o programare în baza de date.')
        }
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    getAllAppointmentsByPatientID : getAllAppointmentsByPatientID,
    getAllAppointmentsByMedicID : getAllAppointmentsByMedicID,
    getAllAppointments : getAllAppointments,
    addAppointment : addAppointment,
    updateAppointment : updateAppointment,
    deleteAppointment : deleteAppointment,
    getLastAppointmentID : getLastAppointmentID,
}