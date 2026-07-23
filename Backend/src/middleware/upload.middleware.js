import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logosDir = path.join(__dirname, '../../uploads/logos');
const cvsDir = path.join(__dirname, '../../uploads/cvs');

fs.mkdirSync(logosDir, { recursive: true });
fs.mkdirSync(cvsDir, { recursive: true });

const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const ALLOWED_CV_TYPES = ['application/pdf'];

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, logosDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `logo-${Date.now()}${ext}`);
  },
});

const cvStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, cvsDir),
  filename: (_req, file, cb) => {
    const safe = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const base = safe.toLowerCase().endsWith('.pdf') ? safe : `${safe}.pdf`;
    cb(null, `cv-${Date.now()}-${base}`);
  },
});

export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_LOGO_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format non autorisé. Utilisez PNG, JPG ou SVG.'));
    }
  },
});

export const uploadCv = multer({
  storage: cvStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_CV_TYPES.includes(file.mimetype) || file.originalname.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Le CV doit être un fichier PDF (max 5 Mo).'));
    }
  },
});

/** Vérifie que le fichier uploadé commence bien par %PDF- (évite CSV renommé .pdf). */
export function validateUploadedPdf(req, res, next) {
  if (!req.file?.path) return next();

  try {
    const fd = fs.openSync(req.file.path, 'r');
    const buf = Buffer.alloc(5);
    fs.readSync(fd, buf, 0, 5, 0);
    fs.closeSync(fd);

    if (buf.toString('utf8') !== '%PDF-') {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: 'Le fichier n\'est pas un PDF valide. Ouvrez votre CV et exportez-le en PDF avant de le joindre.',
      });
    }

    return next();
  } catch {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ error: 'Impossible de lire le fichier CV.' });
  }
}

/** Retourne true si le chemin pointe vers un PDF réel. */
export function isPdfFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return false;
    const fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(5);
    fs.readSync(fd, buf, 0, 5, 0);
    fs.closeSync(fd);
    return buf.toString('utf8') === '%PDF-';
  } catch {
    return false;
  }
}

/** Gère les erreurs Multer (taille, format...) */
export function handleUploadError(err, _req, res, next) {
  if (!err) return next();

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Le fichier est trop volumineux (logo max 2 Mo, CV max 5 Mo).' });
  }

  return res.status(400).json({ error: err.message || 'Erreur lors du téléversement.' });
}
