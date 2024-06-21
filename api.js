const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Modulul 'path' este necesar pentru a manipula căile de fișiere
const app = express();
const usersRoutes = require('./Routes/UsersRoutes');
const patientsRoutes = require('./Routes/PatientsRoutes');
const loginRoutes = require('./Routes/LoginRoutes');
const commentsRoutes = require('./Routes/CommentsRoutes');
const appointmentsRoutes = require('./Routes/AppointmentsRoutes');
const settingsRoutes = require('./Routes/SettingsRouters');
const smsoRoutes = require('./Routes/SMSORoutes');
const worksRoutes = require('./Routes/WorksRoutes');
const diseasesRoutes = require('./Routes/DiseasesRoutes');
const issuesRoutes = require('./Routes/MedicalIssuesRoutes');
const teethHistoryRoutes = require('./Routes/TeethHistoryRoutes')
const fileUploadRoutes = require('./Routes/FileUploadRoutes');

TZ = 'Europe/Bucharest';

// Middleware pentru verificarea parolei
const checkPassword = (request, response, next) => {
    const password = request.headers['x-api-password'];

    if (password === 'parola123') {
        next();
    } else {
        response.status(401).json({ error: 'Acces neautorizat.' });
    }
};

// Aplică middleware-ul pe toate rutele
// app.use(checkPassword); // Dacă doriți să aplicați verificarea parolei pe toate rutele
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Middleware pentru a servi fișiere statice din directorul 'Uploads'
const uploadsPath = path.join(__dirname, 'Uploads');
app.use('/Uploads', express.static(uploadsPath));

// Definirea rutelor pentru API-uri
app.use('/api/Users', usersRoutes);
app.use('/api/Patients', patientsRoutes);
app.use('/api/Comments', commentsRoutes);
app.use('/api/Appointments', appointmentsRoutes);
app.use('/api/Settings', settingsRoutes);
app.use('/api/SMSO', smsoRoutes);
app.use('/api/Works', worksRoutes);
app.use('/api/Diseases', diseasesRoutes);
app.use('/api/MedicalIssues', issuesRoutes);
app.use('/api/TeethHistory', teethHistoryRoutes);
app.use('/api', fileUploadRoutes); // Verificați dacă această rută este corect configurată pentru încărcarea fișierelor
app.use('/api', loginRoutes);

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`API is running at http://localhost:${port}`);
});
