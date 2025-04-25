const express = require('express');
const multer = require('multer');
const firebaseAdmin = require('firebase-admin');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios'); // To fetch files from GitHub

const app = express();
const port = 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-credentials.json');  // Correct path to your Firebase credentials file // Adjust path to credentials
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  storageBucket: 'your-project-id.appspot.com',
});

const bucket = firebaseAdmin.storage().bucket();

// Set up multer to handle file uploads
const storage = multer.memoryStorage();  // Store files temporarily in memory
const upload = multer({ storage: storage });

// Route to upload file to Firebase Storage
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  const file = req.file;
  const filename = uuidv4() + path.extname(file.originalname); // Generate unique filename

  try {
    const fileUpload = bucket.file(filename);
    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on('error', (err) => {
      res.status(500).send('Error uploading file: ' + err);
    });

    stream.on('finish', () => {
      res.send(`File uploaded successfully: ${filename}`);
    });

    stream.end(file.buffer);
  } catch (error) {
    res.status(500).send('Error uploading file: ' + error.message);
  }
});

// Route to download file from Firebase Storage
app.get('/download/firebase/:filename', async (req, res) => {
  const filename = req.params.filename;
  const file = bucket.file(filename);

  try {
    const fileExists = await file.exists();
    if (!fileExists[0]) {
      return res.status(404).send('File not found');
    }

    res.set('Content-Type', 'application/octet-stream');
    file.createReadStream().pipe(res);
  } catch (error) {
    res.status(500).send('Error downloading file: ' + error.message);
  }
});

// Route to serve files from GitHub (static files)
app.get('/download/github/:filename', async (req, res) => {
  const filename = req.params.filename;
  const githubRepoUrl = 'https://raw.githubusercontent.com/your-username/your-repo/master/vhdx-data/'; // GitHub repo raw URL

  try {
    const fileUrl = `${githubRepoUrl}${filename}`;
    const fileResponse = await axios.get(fileUrl, { responseType: 'stream' });

    res.set('Content-Type', 'application/octet-stream');
    fileResponse.data.pipe(res);
  } catch (error) {
    res.status(404).send('File not found on GitHub: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
