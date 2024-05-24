var config = require('../dbConfig');
const sql = require('mssql')
const ResponseHandler = require ('../Others/ResponseHandler')
const HelperFunctions = require ('../Others/HelperFunctions')

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configurare Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../Uploads')); // Temp folder until we move the file
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage }).single('fileInfo');

async function addDocumentToDB(document) {
    try {

        let pool = await sql.connect(config);
        let addDocumentToDBQuery = `
            INSERT INTO PatientsDocuments (PATIENT_ID, DOCUMENT_PATH, DOCUMENT_TYPE)
            VALUES (@PATIENT_ID, @DOCUMENT_PATH, @DOCUMENT_TYPE)
        `;
        let result = await pool.request()
            .input('patient_id', sql.Int, document.patient_id)
            .input('document_path', sql.NVarChar, document.document_path)
            .input('document_type', sql.NVarChar, document.document_type)
            .query(addDocumentToDBQuery);
        return ResponseHandler(200, 'Comentariul a fost adăugat cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

// Functie pentru upload document
async function uploadDocument(req, res) {
    return new Promise((resolve, reject) => {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                reject({ status: 500, message: 'Multer error', error: err });
            } else if (err) {
                reject({ status: 500, message: 'Server error', error: err });
            }

            try {
                // Extrage informațiile pacientului din body
                const patientInfo = req.body.patientInfo;
                if (!patientInfo || !req.file) {
                    resolve({ status: 400, message: 'Missing file or patient information' });
                }
                // Setează calea directorului pentru pacient
                const patientFolder = JSON.parse(patientInfo).patient_folder;
                const fileType = JSON.parse(patientInfo).fileType;
                const uploadPath = path.join(__dirname, '..', 'Uploads', patientFolder, fileType);
                
                // Crează directorul dacă nu există
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                
                // Mută fișierul în directorul pacientului
                const filePath = path.join(uploadPath, req.file.originalname);

                fs.renameSync(req.file.path, filePath);

                resolve({
                    status: 200,
                    message: 'File uploaded successfully',
                    file: {
                        originalname: req.file.originalname,
                        filename: req.file.filename,
                        path: filePath,
                        size: req.file.size
                    },
                    patient: patientInfo
                });
            } catch (error) {
                reject({ status: 500, message: 'Server error', error: error.message });
            }
        });
    })
    .catch(error => {
        console.error('Unhandled promise rejection:', error);
        throw error; // Aruncăm eroarea pentru a fi prinsă mai sus
    });
}

module.exports = {
    uploadDocument
};