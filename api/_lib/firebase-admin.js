import admin from 'firebase-admin';

let app;

export function getAdminApp() {
  if (app) return app;
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (!projectId || !clientEmail || !privateKey) {
    const error = new Error('Server authentication is not configured. Add Firebase Admin credentials in Vercel.');
    error.statusCode = 503;
    throw error;
  }
  app = admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
  return app;
}

export async function requireUser(req) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) { const error = new Error('Authentication required.'); error.statusCode = 401; throw error; }
  return getAdminApp().auth().verifyIdToken(token);
}
