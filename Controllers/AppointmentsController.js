var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')

async function getAllAppointmentsByPatientID(ID){
    try{
        let pool = await sql.connect(config);
        let appointments = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("SELECT * FROM Appointments WHERE PATIENT_ID = @input_parameter");
        return ResponseHandler(200, null, appointments.recordsets, null)
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
        return ResponseHandler(200, null, appointments.recordsets, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getAllAppointments(){
    try{
        let pool = await sql.connect(config);
        let appointments = await pool.request().query('SELECT * FROM Appointments');
        return ResponseHandler(200, null, appointments.recordsets, null)
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
            INSERT INTO Appointments (PATIENT_ID, MEDIC_ID, START_TIME, END_TIME, TITLE, META, CREATED_AT)
            VALUES (@PATIENT_ID, @MEDIC_ID, @START_TIME, @END_TIME, @TITLE, @META, @CREATED_AT)
        `;
        let result = await pool.request()
            .input('PATIENT_ID', sql.Int, appointment.PATIENT_ID)
            .input('MEDIC_ID', sql.Int, appointment.MEDIC_ID)
            .input('START_TIME', sql.DateTime, appointment.START_TIME)
            .input('END_TIME', sql.DateTime, appointment.END_TIME)
            .input('TITLE', sql.NVarChar, appointment.TITLE)
            .input('META', sql.NVarChar, appointment.META)
            .input('CREATED_AT', sql.DateTime, currentDate)
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

module.exports = {
    getAllAppointmentsByPatientID : getAllAppointmentsByPatientID,
    getAllAppointmentsByMedicID : getAllAppointmentsByMedicID,
    getAllAppointments : getAllAppointments,
    addAppointment : addAppointment,
    updateAppointment : updateAppointment,
    deleteAppointment : deleteAppointment,
}