var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')
const HelperFunctions = require ('../Others/HelperFunctions')

async function getAllPatients(){
    try{
        let pool = await sql.connect(config);
        let patients = await pool.request().query('SELECT * FROM Patients');
        return ResponseHandler(200, null, HelperFunctions.transformKeysToLowercase(patients.recordsets[0]), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getAllPatientsByMedicID(ID){
    try{
        let pool = await sql.connect(config);
        let patients = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("SELECT * FROM Patients WHERE MEDIC_ID = @input_parameter");
            if (!patients.recordsets || !patients.recordsets[0][0]?.ID) {
                return ResponseHandler(404, 'Eroare: ', null, "Medicul cu ID '" + ID + "' nu există sau nu are nici un pacient asociat.")
            }
        return ResponseHandler(200, null,  HelperFunctions.transformKeysToLowercase(patients.recordsets[0]), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getPatient(ID) {
    try {
        let pool = await sql.connect(config);
        let patient = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("SELECT * FROM Patients WHERE ID = @input_parameter");
        if (!patient.recordsets || !patient.recordsets[0][0]?.ID) {
            return ResponseHandler(404, 'Eroare: ', null, 'Pacientul nu a fost găsit.')
        }
        return ResponseHandler(200, null,  HelperFunctions.transformKeysToLowercase(patient.recordsets[0]), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function addPatient(patient) {
    try {
        let currentDate = new Date().toISOString();
        currentDate = new Date(new Date(currentDate).getTime() + 3 * 60 * 60 * 1000).toISOString();

        // Calculăm vârsta pacientului folosind data curentă și data de naștere
        const birthDate = new Date(patient.birth_date);
        const currentDateObj = new Date();
        const age = currentDateObj.getFullYear() - birthDate.getFullYear();

        let pool = await sql.connect(config);
        let addPatientQuery = `
            INSERT INTO Patients (FIRST_NAME, LAST_NAME, CNP, AGE, BIRTH_DATE, SEX, COUNTRY, STATE, CITY, ADDRESS, PHONE, EMAIL, PHISICAL_FILE, SECONDARY_CONTACT_NAME, SECONDARY_CONTACT_PHONE, MEDIC_ID, CREATED_AT)
            VALUES (@FIRST_NAME, @LAST_NAME, @CNP, @AGE, @BIRTH_DATE, @SEX, @COUNTRY, @STATE, @CITY, @ADDRESS, @PHONE, @EMAIL, @PHISICAL_FILE, @SECONDARY_CONTACT_NAME, @SECONDARY_CONTACT_PHONE, @MEDIC_ID, @CREATED_AT)
        `;
        let result = await pool.request()
            .input('first_name', sql.NVarChar, patient.first_name)
            .input('last_name', sql.NVarChar, patient.last_name)
            .input('cnp', sql.VarChar(20), patient.cnp)
            .input('age', sql.Int, age)
            .input('birth_date', sql.DateTime, patient.birth_date)
            .input('sex', sql.NVarChar, patient.sex)
            .input('country', sql.NVarChar, patient.country)
            .input('state', sql.NVarChar, patient.state)
            .input('city', sql.NVarChar, patient.city)
            .input('address', sql.NVarChar, patient.address)
            .input('phone', sql.NVarChar, patient.phone)
            .input('email', sql.NVarChar, patient.email)
            .input('phisical_file', sql.NVarChar, patient.phisical_file)
            .input('secondary_contact_name', sql.NVarChar, patient.secondary_contact_name)
            .input('secondary_contact_phone', sql.NVarChar, patient.secondary_contact_phone)
            .input('medic_id', sql.Int, patient.medic_id)
            .input('created_at', sql.DateTime, currentDate)
            .query(addPatientQuery);
        return ResponseHandler(200, 'Pacientul a fost adăugat cu succes.', null, null)
    } catch (error) {
        if (error.message.includes("Violation of UNIQUE KEY constraint 'unique_CNP'")) {
            return ResponseHandler(400, 'Eroare la adăugarea pacientului: ', null, "CNP-ul '" + patient.cnp + "' exista deja în baza de date. Te rog alege un altul.")
        } else {
            return ResponseHandler(500, 'Eroare server: ', null, error.message)
        }
    }
}

async function updatePatient(ID, updates) {
    try {
        let updateQuery = 'UPDATE Patients SET ';
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

        return ResponseHandler(200, 'Pacientul a fost actualizat cu succes.', null, null)
    } catch (error) {
        if (error.message.includes("Violation of UNIQUE KEY constraint 'unique_CNP'")) {
            return ResponseHandler(400, 'Eroare la adăugarea pacientului: ', null, "CNP-ul '" + patient.cnp + "' exista deja în baza de date. Te rog alege un altul.")
        } else {
            return ResponseHandler(500, 'Eroare server: ', null, error.message)
        }
    }
}

async function deletePatient(ID) {
    try {
        // Verificăm dacă utilizatorul există folosind funcția getPatient
        const patient = await getPatient(ID);
        if (!patient || patient.status === 404) {
            return ResponseHandler(404, 'Eroare: ', null, 'Pacientul nu a fost găsit.')
        }

        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('input_parameter', sql.Int, ID)
            .query("DELETE FROM Patients WHERE ID = @input_parameter");
        return ResponseHandler(200, 'Pacientul a fost șters cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    getAllPatients : getAllPatients,
    getPatient : getPatient,
    getAllPatientsByMedicID : getAllPatientsByMedicID,
    addPatient : addPatient,
    updatePatient : updatePatient,
    deletePatient : deletePatient,
}