import { pgTable, serial, varchar, text, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  is_on_boarded: boolean('is_on_boarded').notNull().default(false),
});

export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 50 }).notNull().default('#3b82f6'),
  icon: varchar('icon', { length: 50 }).notNull().default('📚'),
  targetHours: integer('target_hours').default(10),
  notes: text('notes'),
  progress: integer('progress').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const folders = pgTable('folders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  subjectId: integer('subject_id')
    .references(() => subjects.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  color: varchar('color', { length: 50 }).notNull().default('#3b82f6'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const chapters = pgTable('chapters', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  subjectId: integer('subject_id')
    .references(() => subjects.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  subjectId: integer('subject_id')
    .references(() => subjects.id, { onDelete: 'cascade' })
    .notNull(),
  folderId: integer('folder_id')
    .references(() => folders.id, { onDelete: 'cascade' }),
  chapterId: integer('chapter_id')
    .references(() => chapters.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  fileUrl: text('file_url'), // S3 URL to uploaded file
  s3Key: varchar('s3_key', { length: 512 }), // S3 Key/path
  fileName: varchar('file_name', { length: 255 }),
  fileType: varchar('file_type', { length: 100 }), // e.g. application/pdf, image/png
  fileSize: integer('file_size'),
  content: text('content'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  subjectId: integer('subject_id')
    .references(() => subjects.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  subject: varchar('subject', { length: 100 }).notNull().default('Computer Science'),
  due: varchar('due', { length: 100 }).notNull().default(''),
  priority: varchar('priority', { length: 50 }).notNull().default('medium'),
  done: boolean('done').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const study_sessions = pgTable('study_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  subject: varchar('subject', { length: 100 }).notNull().default('Computer Science'),
  goal: varchar('goal', { length: 255 }),
  duration: integer('duration').notNull().default(25), // in minutes
  phase: varchar('phase', { length: 50 }).notNull().default('study'), // 'study' | 'break'
  completed: boolean('completed').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
