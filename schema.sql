CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  role TEXT,
  color TEXT
);

CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TEXT NOT NULL,
  reminder TEXT,
  notes TEXT
);

CREATE TABLE shopping_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  purchased BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE meals (
  id TEXT PRIMARY KEY,
  meal_date DATE NOT NULL,
  title TEXT NOT NULL,
  ingredients TEXT
);

CREATE TABLE family_notes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT,
  pinned BOOLEAN DEFAULT FALSE
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'normal',
  done BOOLEAN DEFAULT FALSE
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT
);
