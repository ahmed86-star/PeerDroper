import { devices, files, transfers, messages, type Device, type File, type Transfer, type Message, type InsertDevice, type InsertFile, type InsertTransfer, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Device operations
  getDevices(): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDeviceConnection(id: number, isConnected: boolean): Promise<void>;
  
  // File operations
  getFiles(): Promise<File[]>;
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  
  // Transfer operations
  getTransfers(): Promise<Transfer[]>;
  getActiveTransfers(): Promise<Transfer[]>;
  createTransfer(transfer: InsertTransfer): Promise<Transfer>;
  updateTransferProgress(id: number, progress: number): Promise<void>;
  updateTransferStatus(id: number, status: string): Promise<void>;
  
  // Message operations
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getDevices(): Promise<Device[]> {
    return await db.select().from(devices);
  }

  async getDevice(id: number): Promise<Device | undefined> {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device || undefined;
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const [device] = await db
      .insert(devices)
      .values(insertDevice)
      .returning();
    return device;
  }

  async updateDeviceConnection(id: number, isConnected: boolean): Promise<void> {
    await db
      .update(devices)
      .set({ isConnected, lastSeen: new Date() })
      .where(eq(devices.id, id));
  }

  async getFiles(): Promise<File[]> {
    return await db.select().from(files).orderBy(files.uploadedAt);
  }

  async getFile(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file || undefined;
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }

  async getTransfers(): Promise<Transfer[]> {
    return await db.select().from(transfers).orderBy(transfers.startedAt);
  }

  async getActiveTransfers(): Promise<Transfer[]> {
    return await db
      .select()
      .from(transfers)
      .where(eq(transfers.status, "active"));
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const [transfer] = await db
      .insert(transfers)
      .values(insertTransfer)
      .returning();
    return transfer;
  }

  async updateTransferProgress(id: number, progress: number): Promise<void> {
    const updateData: any = { progress };
    if (progress === 100) {
      updateData.status = "completed";
      updateData.completedAt = new Date();
    }
    await db
      .update(transfers)
      .set(updateData)
      .where(eq(transfers.id, id));
  }

  async updateTransferStatus(id: number, status: string): Promise<void> {
    const updateData: any = { status };
    if (status === "completed") {
      updateData.completedAt = new Date();
    }
    await db
      .update(transfers)
      .set(updateData)
      .where(eq(transfers.id, id));
  }

  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(messages.sentAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }
}

export class MemStorage implements IStorage {
  private devices: Map<number, Device>;
  private files: Map<number, File>;
  private transfers: Map<number, Transfer>;
  private messages: Map<number, Message>;
  private currentDeviceId: number;
  private currentFileId: number;
  private currentTransferId: number;
  private currentMessageId: number;

  constructor() {
    this.devices = new Map();
    this.files = new Map();
    this.transfers = new Map();
    this.messages = new Map();
    this.currentDeviceId = 1;
    this.currentFileId = 1;
    this.currentTransferId = 1;
    this.currentMessageId = 1;
    
    // Add default devices for demo
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Add current device
    const currentDevice: Device = {
      id: this.currentDeviceId++,
      name: "MacBook Pro",
      type: "desktop",
      ipAddress: "192.168.1.100",
      isConnected: true,
      lastSeen: new Date(),
    };
    this.devices.set(currentDevice.id, currentDevice);
  }

  async getDevices(): Promise<Device[]> {
    return Array.from(this.devices.values());
  }

  async getDevice(id: number): Promise<Device | undefined> {
    return this.devices.get(id);
  }

  async createDevice(insertDevice: InsertDevice): Promise<Device> {
    const device: Device = {
      ...insertDevice,
      id: this.currentDeviceId++,
      lastSeen: new Date(),
      isConnected: insertDevice.isConnected || false,
    };
    this.devices.set(device.id, device);
    return device;
  }

  async updateDeviceConnection(id: number, isConnected: boolean): Promise<void> {
    const device = this.devices.get(id);
    if (device) {
      device.isConnected = isConnected;
      device.lastSeen = new Date();
      this.devices.set(id, device);
    }
  }

  async getFiles(): Promise<File[]> {
    return Array.from(this.files.values()).sort((a, b) => 
      new Date(b.uploadedAt!).getTime() - new Date(a.uploadedAt!).getTime()
    );
  }

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const file: File = {
      ...insertFile,
      id: this.currentFileId++,
      uploadedAt: new Date(),
      uploadedBy: insertFile.uploadedBy || null,
    };
    this.files.set(file.id, file);
    return file;
  }

  async getTransfers(): Promise<Transfer[]> {
    return Array.from(this.transfers.values()).sort((a, b) => 
      new Date(b.startedAt!).getTime() - new Date(a.startedAt!).getTime()
    );
  }

  async getActiveTransfers(): Promise<Transfer[]> {
    return Array.from(this.transfers.values()).filter(
      transfer => transfer.status === "active" || transfer.status === "pending"
    );
  }

  async createTransfer(insertTransfer: InsertTransfer): Promise<Transfer> {
    const transfer: Transfer = {
      ...insertTransfer,
      id: this.currentTransferId++,
      startedAt: new Date(),
      completedAt: null,
    };
    this.transfers.set(transfer.id, transfer);
    return transfer;
  }

  async updateTransferProgress(id: number, progress: number): Promise<void> {
    const transfer = this.transfers.get(id);
    if (transfer) {
      transfer.progress = progress;
      if (progress === 100) {
        transfer.status = "completed";
        transfer.completedAt = new Date();
      }
      this.transfers.set(id, transfer);
    }
  }

  async updateTransferStatus(id: number, status: string): Promise<void> {
    const transfer = this.transfers.get(id);
    if (transfer) {
      transfer.status = status;
      if (status === "completed") {
        transfer.completedAt = new Date();
      }
      this.transfers.set(id, transfer);
    }
  }

  async getMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort((a, b) => 
      new Date(a.sentAt!).getTime() - new Date(b.sentAt!).getTime()
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      ...insertMessage,
      id: this.currentMessageId++,
      sentAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }
}

export const storage = new DatabaseStorage();
