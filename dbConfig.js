const config = {
    user: 'apiUser',
    password: 'parola123',
    server: 'localhost',
    database: 'DentalDb',
    options: {
        trustedconnection: true,
        enableArithAort: true,
        instancename: 'SQLEXPRESS',
        trustServerCertificate: true
    },
    port: 54471
}

module.exports = config;