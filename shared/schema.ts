import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // mobile, desktop, tablet
  ipAddress: text("ip_address").notNull(),
  isConnected: boolean("is_connected").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
});

export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  uploadedBy: integer("uploaded_by").references(() => devices.id),
});

export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  fileId: integer("file_id").references(() => files.id),
  fromDevice: integer("from_device").references(() => devices.id),
  toDevice: integer("to_device").references(() => devices.id),
  status: text("status").notNull().default("pending"), // pending, active, completed, failed
  progress: integer("progress").default(0),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  fromDevice: integer("from_device").references(() => devices.id),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  lastSeen: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  uploadedAt: true,
});

export const insertTransferSchema = createInsertSchema(transfers).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  sentAt: true,
});

export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type File = typeof files.$inferSelect;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
