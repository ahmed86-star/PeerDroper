import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertDeviceSchema, insertMessageSchema, insertFileSchema, insertTransferSchema } from "@shared/schema";

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Ensure uploads directory exists
  if (!fs.existsSync('uploads')) {
    console.log('Creating uploads directory...');
    fs.mkdirSync('uploads', { recursive: true });
    console.log('Uploads directory created');
  } else {
    console.log('Uploads directory already exists');
  }

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  const connectedClients = new Map<WebSocket, any>();

  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'device_connect':
            const device = await storage.createDevice(message.data);
            connectedClients.set(ws, device);
            broadcast({ type: 'device_connected', data: device });
            break;
            
          case 'send_message':
            const newMessage = await storage.createMessage(message.data);
            broadcast({ type: 'new_message', data: newMessage });
            break;
            
          case 'transfer_progress':
            await storage.updateTransferProgress(message.data.transferId, message.data.progress);
            broadcast({ type: 'transfer_updated', data: message.data });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', async () => {
      const device = connectedClients.get(ws);
      if (device) {
        await storage.updateDeviceConnection(device.id, false);
        broadcast({ type: 'device_disconnected', data: device });
        connectedClients.delete(ws);
      }
    });

    // Send initial data
    ws.send(JSON.stringify({ type: 'connected' }));
  });

  function broadcast(message: any) {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // API Routes
  
  // Get all devices
  app.get('/api/devices', async (req, res) => {
    try {
      const devices = await storage.getDevices();
      res.json(devices);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch devices' });
    }
  });

  // Add new device
  app.post('/api/devices', async (req, res) => {
    try {
      const deviceData = insertDeviceSchema.parse(req.body);
      const device = await storage.createDevice(deviceData);
      res.json(device);
    } catch (error) {
      res.status(400).json({ error: 'Invalid device data' });
    }
  });

  // File upload
  app.post('/api/files/upload', upload.single('file'), async (req, res) => {
    try {
      console.log('File upload attempt:', req.file ? 'File received' : 'No file');
      
      if (!req.file) {
        console.error('No file in request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('Uploading file:', req.file.originalname, 'Size:', req.file.size);

      const fileData = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.body.deviceId ? parseInt(req.body.deviceId) : null,
      };

      const file = await storage.createFile(fileData);
      console.log('File saved to database:', file.id);
      res.json(file);
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ error: 'Failed to upload file', details: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Get all files
  app.get('/api/files', async (req, res) => {
    try {
      const files = await storage.getFiles();
      res.json(files);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  // Delete file
  app.delete('/api/files/:id', async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Delete from database
      await storage.deleteFile(fileId);
      
      // Delete from filesystem
      const filePath = path.join('uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete file' });
    }
  });

  // Download file
  app.get('/api/files/:id/download', async (req, res) => {
    try {
      const fileId = parseInt(req.params.id);
      const file = await storage.getFile(fileId);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }

      const filePath = path.join('uploads', file.filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found on disk' });
      }

      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      res.status(500).json({ error: 'Failed to download file' });
    }
  });

  // Create transfer
  app.post('/api/transfers', async (req, res) => {
    try {
      const transferData = insertTransferSchema.parse(req.body);
      const transfer = await storage.createTransfer(transferData);
      res.json(transfer);
    } catch (error) {
      res.status(400).json({ error: 'Invalid transfer data' });
    }
  });

  // Get all transfers
  app.get('/api/transfers', async (req, res) => {
    try {
      const transfers = await storage.getTransfers();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch transfers' });
    }
  });

  // Get active transfers
  app.get('/api/transfers/active', async (req, res) => {
    try {
      const transfers = await storage.getActiveTransfers();
      res.json(transfers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch active transfers' });
    }
  });

  // Get all messages
  app.get('/api/messages', async (req, res) => {
    try {
      const messages = await storage.getMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  // Send message
  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: 'Invalid message data' });
    }
  });

  return httpServer;
}
