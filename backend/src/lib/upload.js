import multer from 'multer';

// Use in-memory buffer so we can stream directly to AWS S3
const storage = multer.memoryStorage();

// Max file size: 25 MB
const limits = {
  fileSize: 25 * 1024 * 1024,
};

// Accept documents, PDFs, images, text, presentations, code files
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

export const upload = multer({
  storage,
  limits,
  fileFilter,
});

export default upload;
