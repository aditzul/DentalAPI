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
      .query('SELECT PHONE, LAST_NAME, FIRST_NAME, SEND_SMS FROM Patients WHERE ID = @patientID');

    if (result.recordset.length === 0) {
      throw new Error(`Pacientul cu ID-ul ${patientID} nu a fost găsit.`);
    }

    const { PHONE, LAST_NAME, FIRST_NAME, SEND_SMS } = result.recordset[0];
    return {
      PHONE,
      FULL_NAME: `${LAST_NAME} ${FIRST_NAME}`,
      SEND_SMS
    };
  } catch (error) {
    throw new Error(`Eroare la obținerea informațiilor pentru pacientul cu ID-ul ${patientID}: ${error.message}`);
  }
}

// Definirea cron job-ului pentru a rula la fiecare 10 secunde
cron.schedule('*/10 * * * * *', async () => {
  try {
    const smsSettings = await SettingsController.getSMSSettings();
    const sendSMS = smsSettings.data[0][0].SMS_SEND_SMS;
    const sendDays = smsSettings.data[0][0].SMS_SEND_DAYS;
    const sendHour = smsSettings.data[0][0].SMS_SEND_HOUR;

    if (typeof sendDays !== 'number' || isNaN(sendDays)) {
      throw new Error('SMS_SEND_DAYS nu este un număr valid.');
    }

    if (sendSMS) {
      console.log('Serviciul SMS este ACTIV')
      const currentDate = new Date();
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + sendDays);
      let pool = await sql.connect(config);
  
      let result = await pool.request().query(`
        SELECT *
        FROM appointments
        WHERE SMS_SENT IS NULL AND CAST(START AS DATE) = CAST('${futureDate.toISOString()}' AS DATE);
      `);
      if (result.recordsets[0].length > 0) {
        for (const appointment of result.recordsets[0]) {
          const { PATIENT_ID, START, SMS_SENT } = appointment;
          const patientInfo = await getPatientInfo(PATIENT_ID);
          let futureAppointments = {
            PHONE: patientInfo.PHONE,
            FULL_NAME: patientInfo.FULL_NAME,
            START: new Date(START.setHours(START.getHours() + 3)).toISOString(),
            SEND_SMS: patientInfo.SEND_SMS,
            SMS_SENT
          }
          console.log(futureAppointments);
        }
      } else {
        console.log('Nu sunt programări peste', sendDays, 'zile.')
      }
    } else {
      console.log('Serviciul SMS este INACTIV')
    }

  } catch (error) {
    console.error('Eroare la obținerea și prelucrarea programărilor viitoare:', error);
  }
});

module.exports = cron;
