import express from 'express';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.JWT_SECRET || 'super-secret-vtm-key-change-me';
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Инициализация БД
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    invite_code TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS invite_codes (
    code TEXT PRIMARY KEY,
    used_by INTEGER DEFAULT NULL
  );
  CREATE TABLE IF NOT EXISTS characters (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    data TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Генерация инвайт-кодов при первом запуске
const generateInviteCodes = () => {
  const insert = db.prepare('INSERT OR IGNORE INTO invite_codes (code) VALUES (?)');
  const codes = ['VTM-ALPHA-1', 'VTM-ALPHA-2', 'VTM-ALPHA-3'];
  for (const code of codes) insert.run(code);
};
generateInviteCodes();

// --- ЭНДПОИНТЫ ---

// 1. Регистрация
app.post('/api/register', (req, res) => {
  const { username, password, inviteCode } = req.body;

  if (!username || !password || !inviteCode) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const codeData = db.prepare('SELECT * FROM invite_codes WHERE code = ? AND used_by IS NULL').get(inviteCode);
  if (!codeData) {
    return res.status(400).json({ error: 'Неверный или уже использованный инвайт-код' });
  }

  const hash = bcrypt.hashSync(password, 10);

  try {
    const insertUser = db.prepare('INSERT INTO users (username, password, invite_code) VALUES (?, ?, ?)');
    const info = insertUser.run(username, hash, inviteCode);

    db.prepare('UPDATE invite_codes SET used_by = ? WHERE code = ?').run(info.lastInsertRowid, inviteCode);

    const token = jwt.sign({ id: info.lastInsertRowid, username }, SECRET_KEY, { expiresIn: '7d' });
    res.json({ token, username });
  } catch (err) {
    res.status(400).json({ error: 'Пользователь уже существует' });
  }
});

// 2. Вход
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ error: 'Неверный логин или пароль' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '7d' });
  res.json({ token, username });
});

// 3. Получить персонажей (защищено токеном)
app.get('/api/characters', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Нет токена' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);

    const chars = db.prepare('SELECT data FROM characters WHERE user_id = ?').all(decoded.id);
    const parsed = chars.map(c => JSON.parse(c.data));
    res.json(parsed);
  } catch (err) {
    res.status(401).json({ error: 'Недействительный токен' });
  }
});

// 4. Сохранить/Обновить персонажей
app.post('/api/characters', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Нет токена' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    const characters = req.body;

    if (!Array.isArray(characters)) {
      return res.status(400).json({ error: 'Ожидался массив персонажей' });
    }

    const deleteStmt = db.prepare('DELETE FROM characters WHERE user_id = ?');
    deleteStmt.run(decoded.id);

    const insertStmt = db.prepare('INSERT INTO characters (id, user_id, data, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)');

    const insertMany = db.transaction((chars) => {
      for (const char of chars) {
        insertStmt.run(char.id, decoded.id, JSON.stringify(char));
      }
    });
    insertMany(characters);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сохранения' });
  }
});

// 5. Выход (опционально, для очистки токена на клиенте)
app.post('/api/logout', (req, res) => {
  res.json({ success: true });
});

// 6. Проверка кода доступа к листу мастера (серверная валидация)
const MASTER_ACCESS_CODE = '245';
app.post('/api/verify-code', (req, res) => {
  const { code } = req.body;
  if (!code || code !== MASTER_ACCESS_CODE) {
    return res.status(403).json({ valid: false });
  }
  res.json({ valid: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));
