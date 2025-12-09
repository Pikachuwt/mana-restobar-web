const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear carpetas si no existen
const uploadsDir = path.join(__dirname, '../uploads');
const pdfDir = path.join(uploadsDir, 'pdf');
const imagesDir = path.join(uploadsDir, 'images');

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);

// Configuración para PDF
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pdfDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `menu-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const pdfUpload = multer({
  storage: pdfStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'), false);
    }
  }
});

// Configuración para imágenes
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, imagesDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `galeria-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'), false);
    }
  }
});

module.exports = { pdfUpload, imageUpload };