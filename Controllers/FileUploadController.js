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
            INSERT INTO PatientsDocuments (PATIENT_ID, FILE_NAME, FILE_NICE_NAME, FILE_PATH, FILE_TYPE, FILE_CATEGORY)
            VALUES (@PATIENT_ID, @FILE_NAME, @FILE_NICE_NAME, @FILE_PATH, @FILE_TYPE, @FILE_CATEGORY)
        `;

        let result = await pool.request()
            .input('patient_id', sql.Int, document.patient_id)
            .input('file_name', sql.NVarChar, document.file_name)
            .input('file_nice_name', sql.NVarChar, document.file_nice_name)
            .input('file_path', sql.NVarChar, document.file_path)
            .input('file_type', sql.NVarChar, document.file_type)
            .input('file_category', sql.NVarChar, document.file_category)
            .query(addDocumentToDBQuery);

        return ResponseHandler(200, 'Fișier încărcat cu succes.', null, null);
    } catch (error) {
        throw new Error('Eroare server: ' + error.message);
    }
}

async function uploadDocument(req, res) {
    return new Promise((resolve, reject) => {
        // Funcția de încărcare folosind Multer
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                reject({ status: 500, message: 'Multer error', error: err });
                return;
            } else if (err) {
                reject({ status: 500, message: 'Server error', error: err });
                return;
            }

            try {
                // Extrage informațiile pacientului din corpul cererii
                const patientInfoString = req.body.patientInfo;
                const patientInfo = JSON.parse(patientInfoString);

                // Verifică dacă există datele pacientului și fișierul
                if (!patientInfo || !patientInfo.patient_id || !patientInfo.file_category) {
                    reject({ status: 400, message: 'Missing file or patient information' });
                    return;
                }

                // Setează calea directorului pentru pacient
                const patientFolder = patientInfo.patient_id.toString(); // Asigură-te că patient_id este string
                const fileCategory = patientInfo.file_category.toString(); // Asigură-te că document_type este string
                const uploadPath = path.join(__dirname, '..', 'Uploads', patientFolder, fileCategory);

                // Crează directorul dacă nu există
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }

                // Extrage numele original al fișierului și extensia
                const originalFileName = req.file.originalname;
                const fileExtension = path.extname(originalFileName);

                // Construiește noul nume de fișier cu prefixul dorit și extensia originală
                const newFileName = `${patientInfo.file_selected}_${Date.now()}${fileExtension}`;
                const filePath = path.join(uploadPath, newFileName);
                const openPath = path.join(patientInfo.patient_id.toString(), fileCategory, newFileName)

                // Mută fișierul în directorul pacientului cu noul nume
                fs.renameSync(req.file.path, filePath);

                const documentInfo = {
                    patient_id: patientInfo.patient_id,
                    file_name: newFileName,
                    file_nice_name: patientInfo.file_selected,
                    file_path: openPath,
                    file_type: patientInfo.file_type,
                    file_category: patientInfo.file_category,
                };

                // Adaugă datele fișierului în baza de date
                await addDocumentToDB(documentInfo);

                resolve(ResponseHandler(200, 'Fișier încărcat cu succes.', null, null));

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

async function getFilesList(req, res) {
    try {
        const patientID = req.params.ID
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('input_parameter', sql.Int, patientID)
            .query("SELECT * FROM PatientsDocuments WHERE PATIENT_ID = @input_parameter");
        if (!result.recordsets || !result.recordsets[0][0]?.ID) {
            return ResponseHandler(404, 'Eroare: ', null, 'Pacientul nu a fost găsit.')
        }

        // Obiecte pentru a stoca rezultatele
        let documents = {
            Imagistică: [],
            Documente: []
        };

        // Împarte documentele în funcție de FILE_CATEGORY
        result.recordset.forEach(doc => {
            if (doc.FILE_CATEGORY === 'Imagistică') {
                documents.Imagistică.push({
                    file_id: doc.ID,
                    file_name: doc.FILE_NAME,
                    file_nice_name: doc.FILE_NICE_NAME,
                    file_path: doc.FILE_PATH,
                    file_type: doc.FILE_TYPE,
                    created_at: doc.CREATED_AT
                });
            } else if (doc.FILE_CATEGORY === 'Documente') {
                documents.Documente.push({
                    file_id: doc.ID,
                    file_name: doc.FILE_NAME,
                    file_nice_name: doc.FILE_NICE_NAME,
                    file_path: doc.FILE_PATH,
                    file_type: doc.FILE_TYPE,
                    created_at: doc.CREATED_AT
                });
            }
            // Alte categorii pot fi adăugate aici dacă este cazul
        });

        res.json(documents); // Trimite răspunsul cu documentele împărțite în Imagistică și Documente

        //return ResponseHandler(200, null,  HelperFunctions.transformKeysToLowercase(result.recordsets[0]), null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

async function deleteDocument(document) {
    const { file_id, file_path } = document.body;
    try {
        console.log(document.body)
        let pool = await sql.connect(config);
        let result = await pool.request()
            .input('file_id', sql.Int, file_id)
            .query("DELETE FROM PatientsDocuments WHERE ID = @file_id");

        const parentDir = path.resolve(__dirname, '../');
        const filePathToDelete = path.join(parentDir, 'Uploads', file_path);
        fs.unlinkSync(filePathToDelete);

        return ResponseHandler(200, 'Documentul a fost șters cu succes.', null, null)
    } catch (error) {
        return ResponseHandler(500, 'Eroare server: ', null, error.message)
    }
}

module.exports = {
    uploadDocument : uploadDocument,
    getFilesList : getFilesList,
    deleteDocument : deleteDocument,
};