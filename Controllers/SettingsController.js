var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')

async function getSMSOSettings(){
    try{
        let pool = await sql.connect(config);
        let smsoSettings = await pool.request().query('SELECT SMSO_SENDER_ID, SMSO_API_KEY FROM AppSettings');
        return ResponseHandler(200, null, smsoSettings.recordsets, null)

    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function getSMSSettings(){
    try{
        let pool = await sql.connect(config);
        let smsoSettings = await pool.request().query('SELECT SMS_SEND_SMS, SMS_SEND_HOUR, SMS_SEND_DAYS, SMS_TEMPLATE FROM AppSettings');
        return ResponseHandler(200, null, smsoSettings.recordsets, null)

    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}


async function getCompanySettings(){
    try{
        let pool = await sql.connect(config);
        let companySettings = await pool.request().query('SELECT COMPANY_NAME, COMPANY_VAT, COMPANY_TAX_NUMBER, COMPANY_ADDRESS FROM AppSettings');
        return ResponseHandler(200, null, companySettings.recordsets, null)

    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function updateSettings(updates) {
    try {
        let updateQuery = 'UPDATE AppSettings SET ';
        let queryParams = [];
        Object.keys(updates).forEach((key, index) => {
            updateQuery += `${key} = @param${index}`;
            let valueType = typeof updates[key] === 'number' ? sql.Int : sql.NVarChar;
            queryParams.push({ name: `param${index}`, type: valueType, value: updates[key] });

            if (index < Object.keys(updates).length - 1) {
                updateQuery += ', ';
            }
        });

        updateQuery += ' WHERE ID = 1';

        let pool = await sql.connect(config);
        let request = pool.request();
        queryParams.forEach(param => {
            request.input(param.name, param.type, param.value);
        });
        let result = await request.query(updateQuery);
        return ResponseHandler(200, 'Setările au fost actualizate cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    getSMSOSettings : getSMSOSettings,
    getSMSSettings : getSMSSettings,
    getCompanySettings : getCompanySettings,
    updateSettings : updateSettings,
}
