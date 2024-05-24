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
    port: 55360 //SELECT * FROM [sys].[dm_tcp_listener_states]
}

module.exports = config;