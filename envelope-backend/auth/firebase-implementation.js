import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!saPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set. Set it to your service account JSON path.');
}

const serviceAccount = JSON.parse(fs.readFileSync(path.resolve(saPath), 'utf8'));

const app = initializeApp({
  credential: cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID
});

// Express middleware to protect routes with Firebase ID tokens
export function firebaseAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
  if (!token) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }
  getAuth(app)
    .verifyIdToken(token)
    .then(decoded => {
      req.user = decoded;
      next();
    })
    .catch(err => {
      console.error('Invalid Firebase token', err);
      res.status(401).json({ message: 'Invalid token' });
    });
}
