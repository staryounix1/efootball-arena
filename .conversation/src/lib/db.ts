// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), 'data', 'efootball.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let dbInstance: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    initSchema(dbInstance);
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      efootball_id TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      balance REAL NOT NULL DEFAULT 0.0,
      role TEXT NOT NULL DEFAULT 'USER',
      avatar TEXT,
      wins INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS recharge_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      notes TEXT,
      admin_notes TEXT,
      created_at TEXT NOT NULL,
      processed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS withdrawal_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      destination_info TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING',
      created_at TEXT NOT NULL,
      processed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      game TEXT NOT NULL DEFAULT 'eFootball',
      platform TEXT NOT NULL DEFAULT 'Mobile',
      stake REAL NOT NULL,
      prize REAL NOT NULL,
      creator_id TEXT NOT NULL,
      opponent_id TEXT,
      status TEXT NOT NULL DEFAULT 'OPEN',
      room_code TEXT,
      creator_score INTEGER,
      opponent_score INTEGER,
      creator_proof TEXT,
      opponent_proof TEXT,
      creator_claimed_winner TEXT,
      opponent_claimed_winner TEXT,
      winner_id TEXT,
      dispute_reason TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (creator_id) REFERENCES users(id),
      FOREIGN KEY (opponent_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS match_messages (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      username TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (match_id) REFERENCES matches(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      banner TEXT,
      entry_fee REAL NOT NULL,
      prize_pool REAL NOT NULL,
      max_players INTEGER NOT NULL DEFAULT 16,
      status TEXT NOT NULL DEFAULT 'REGISTRATION',
      start_date TEXT NOT NULL,
      rules TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tournament_participants (
      id TEXT PRIMARY KEY,
      tournament_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      joined_at TEXT NOT NULL,
      UNIQUE(tournament_id, user_id),
      FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      balance_after REAL NOT NULL,
      description TEXT NOT NULL,
      reference_id TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Seed default settings if not exists
  const checkSettings = db.prepare('SELECT COUNT(*) as count FROM platform_settings').get() as { count: number };
  if (checkSettings.count === 0) {
    const insertSetting = db.prepare('INSERT INTO platform_settings (key, value) VALUES (?, ?)');
    insertSetting.run('admin_whatsapp', '+212600000000');
    insertSetting.run('cih_rib', '230 780 0000000000000000 00');
    insertSetting.run('cih_name', 'MOHAMMED ADMIN');
    insertSetting.run('cashplus_name', 'MOHAMMED ADMIN');
    insertSetting.run('cashplus_cin', 'AB123456');
    insertSetting.run('commission_rate', '0.10');
  }

  // Seed default admin if not exists
  const checkAdmin = db.prepare("SELECT * FROM users WHERE role = 'ADMIN'").get();
  if (!checkAdmin) {
    const adminId = 'admin_super_1';
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    const insertAdmin = db.prepare(`
      INSERT INTO users (id, username, email, password_hash, efootball_id, whatsapp, balance, role, wins, losses, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertAdmin.run(
      adminId,
      'admin',
      'admin@efootball-arena.ma',
      hash,
      'KONAMI-ADMIN',
      '+212600000000',
      1000.0,
      'ADMIN',
      10,
      0,
      new Date().toISOString()
    );

    // Seed demo players
    const player1Id = 'user_demo_1';
    const player2Id = 'user_demo_2';
    const playerHash = bcrypt.hashSync('player123', salt);

    insertAdmin.run(
      player1Id,
      'Yassine_Pro',
      'yassine@demo.com',
      playerHash,
      'EF-998241',
      '+212611223344',
      150.0,
      'USER',
      14,
      3,
      new Date().toISOString()
    );

    insertAdmin.run(
      player2Id,
      'Amine_PES',
      'amine@demo.com',
      playerHash,
      'EF-774411',
      '+212655667788',
      80.0,
      'USER',
      8,
      5,
      new Date().toISOString()
    );

    // Seed tournaments
    const insertTournament = db.prepare(`
      INSERT INTO tournaments (id, title, banner, entry_fee, prize_pool, max_players, status, start_date, rules, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertTournament.run(
      'tourn_1',
      '🏆 Ramadan eFootball Championship 2026',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=60',
      20.0,
      300.0,
      16,
      'REGISTRATION',
      'Dimanche 21:00 GMT+1',
      'Match standard 10 min, extra time + penalties en cas d égalité.',
      new Date().toISOString()
    );

    insertTournament.run(
      'tourn_2',
      '⚡ Weekly Fast Cup 50 DH',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60',
      50.0,
      750.0,
      16,
      'REGISTRATION',
      'Vendredi 22:00 GMT+1',
      'Mobile eFootball direct knockout.',
      new Date().toISOString()
    );

    // Seed open challenge
    const insertMatch = db.prepare(`
      INSERT INTO matches (id, title, game, platform, stake, prize, creator_id, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insertMatch.run(
      'match_demo_1',
      'Challenge 1v1 - Match Rapide',
      'eFootball',
      'Mobile',
      20.0,
      36.0,
      player1Id,
      'OPEN',
      new Date().toISOString(),
      new Date().toISOString()
    );
  }
}
