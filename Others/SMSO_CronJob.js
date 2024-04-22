const cron = require('node-cron');
const sql = require('mssql');
const config = require('../dbConfig');
const SettingsController = require('../Controllers/SettingsController');

// Funcție pentru a obține informațiile pacientului folosind PATIENT_ID
async function getPatientInfo(patientID) {
  try {
    let pool = await sql.connect(config);
    let result = await pool.request()
      .input('patientID', sql.Int, patientID)
      .query('SELECT PHONE, LAST_NAME, FIRST_NAME FROM Patients WHERE ID = @patientID');

    if (result.recordset.length === 0) {
      throw new Error(`Pacientul cu ID-ul ${patientID} nu a fost găsit.`);
    }

    const { PHONE, LAST_NAME, FIRST_NAME } = result.recordset[0];
    return {
      PHONE,
      FULL_NAME: `${LAST_NAME} ${FIRST_NAME}`
    };
  } catch (error) {
    throw new Error(`Eroare la obținerea informațiilor pentru pacientul cu ID-ul ${patientID}: ${error.message}`);
  }
}

// Definirea cron job-ului pentru a rula la fiecare 10 secunde
cron.schedule('*/10 * * * * *', async () => {
  try {
    const smsSettings = await SettingsController.getSMSSettings();
    const sendDays = smsSettings.data[0][0].SMS_SEND_DAYS;

    if (typeof sendDays !== 'number' || isNaN(sendDays)) {
      throw new Error('SMS_SEND_DAYS nu este un număr valid.');
    }

    const currentDate = new Date();
    const futureDate = new Date(currentDate);
    futureDate.setDate(currentDate.getDate() + sendDays);

    let pool = await sql.connect(config);

    let result = await pool.request().query(`
      SELECT *
      FROM appointments
      WHERE SMS_SENT = 0 AND CAST(START_TIME AS DATE) = CAST('${futureDate.toISOString()}' AS DATE);
    `);

    // Parcurgere rezultatele și afișare informațiilor pentru fiecare programare viitoare
    for (const appointment of result.recordsets[0]) {
      const { PATIENT_ID, START_TIME, SMS_SENT } = appointment;
      const patientInfo = await getPatientInfo(PATIENT_ID);
      console.log('Informații programare:', {
        PHONE: patientInfo.PHONE,
        FULL_NAME: patientInfo.FULL_NAME,
        START_TIME,
        SMS_SENT
      });
    }
  } catch (error) {
    console.error('Eroare la obținerea și prelucrarea programărilor viitoare:', error);
  }
});

module.exports = cron;
