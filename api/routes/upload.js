import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Upload multiple images
router.post('/images', [authMiddleware, upload.array('images', 6)], async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const processedFiles = [];

    for (const file of req.files) {
      const originalPath = file.path;
      const filename = file.filename;
      const ext = path.extname(filename);
      const baseName = path.basename(filename, ext);

      // Create different sizes
      const sizes = [
        { name: 'original', width: null, height: null },
        { name: 'large', width: 1200, height: null },
        { name: 'medium', width: 800, height: null },
        { name: 'thumb', width: 300, height: 300 }
      ];

      const fileData = {
        original: filename,
        sizes: {}
      };

      for (const size of sizes) {
        let outputPath = originalPath;
        let outputFilename = filename;

        if (size.name !== 'original') {
          outputFilename = `${baseName}-${size.name}${ext}`;
          outputPath = path.join(path.dirname(originalPath), outputFilename);
        }

        // Process image with sharp
        await sharp(originalPath)
          .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
          .toFile(outputPath);

        fileData.sizes[size.name] = outputFilename;
      }

      processedFiles.push(fileData);
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully',
      files: processedFiles
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload files',
      error: error.message
    });
  }
});

// Upload single image
router.post('/image', [authMiddleware, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);

    // Create different sizes
    const sizes = [
      { name: 'original', width: null, height: null },
      { name: 'large', width: 1200, height: null },
      { name: 'medium', width: 800, height: null },
      { name: 'thumb', width: 300, height: 300 }
    ];

    const fileData = {
      original: filename,
      sizes: {}
    };

    for (const size of sizes) {
      let outputPath = originalPath;
      let outputFilename = filename;

      if (size.name !== 'original') {
        outputFilename = `${baseName}-${size.name}${ext}`;
        outputPath = path.join(path.dirname(originalPath), outputFilename);
      }

      // Process image with sharp
      await sharp(originalPath)
        .resize(size.width, size.height, { fit: 'inside', withoutEnlargement: true })
        .toFile(outputPath);

      fileData.sizes[size.name] = outputFilename;
    }

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileData
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

export default router;
