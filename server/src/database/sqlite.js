import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ========================================
// ESM __dirname
// ========================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// Database Directory
// ========================================

const databaseDirectory = path.join(
  __dirname,
  "../../data"
);

if (!fs.existsSync(databaseDirectory)) {
  fs.mkdirSync(databaseDirectory, {
    recursive: true
  });
}

// ========================================
// Database
// ========================================

const databasePath = path.join(
  databaseDirectory,
  "app.sqlite"
);

const db = new Database(databasePath);

// ========================================
// SQLite Configuration
// ========================================

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ========================================
// Create Files Table
// ========================================

db.exec(`
  CREATE TABLE IF NOT EXISTS files (
    file_id TEXT PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_content_hash TEXT NOT NULL UNIQUE
  );
`);

// ========================================
// Prepared Statements
// ========================================

const insertFileStatement = db.prepare(`
  INSERT INTO files (
    file_id,
    file_name,
    file_content_hash
  )
  VALUES (
    @file_id,
    @file_name,
    @file_content_hash
  )
`);

const getFileByIdStatement = db.prepare(`
  SELECT
    file_id,
    file_name,
    file_content_hash
  FROM files
  WHERE file_id = ?
`);

const getFileByHashStatement = db.prepare(`
  SELECT
    file_id,
    file_name,
    file_content_hash
  FROM files
  WHERE file_content_hash = ?
`);

const getAllFilesStatement = db.prepare(`
  SELECT
    file_id,
    file_name,
    file_content_hash
  FROM files
  ORDER BY rowid DESC
`);

const updateFileStatement = db.prepare(`
  UPDATE files
  SET
    file_name = @file_name,
    file_content_hash = @file_content_hash
  WHERE file_id = @file_id
`);

const deleteFileStatement = db.prepare(`
  DELETE FROM files
  WHERE file_id = ?
`);

// ========================================
// Create File
// ========================================

export function createFile({
  file_id,
  file_name,
  file_content_hash
}) {
  return insertFileStatement.run({
    file_id,
    file_name,
    file_content_hash
  });
}

// ========================================
// Get File By ID
// ========================================

export function getFileById(file_id) {
  return getFileByIdStatement.get(file_id);
}

// ========================================
// Get File By Hash
// ========================================

export function getFileByHash(file_content_hash) {
  return getFileByHashStatement.get(
    file_content_hash
  );
}

// ========================================
// Get All Files
// ========================================

export function getAllFiles() {
  return getAllFilesStatement.all();
}

// ========================================
// Update File
// ========================================

export function updateFile({
  file_id,
  file_name,
  file_content_hash
}) {
  return updateFileStatement.run({
    file_id,
    file_name,
    file_content_hash
  });
}

// ========================================
// Delete File
// ========================================

export function deleteFile(file_id) {
  return deleteFileStatement.run(file_id);
}

// ========================================
// Close Database
// ========================================

export function closeDatabase() {
  if (db.open) {
    db.close();
  }
}

// ========================================
// Export Database Instance
// ========================================

export { db };