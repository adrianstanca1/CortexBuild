#!/usr/bin/env node

import { Client } from 'ssh2';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IONOS SFTP Configuration
const config = {
  host: 'access-5018479682.webspace-host.com',
  port: 22,
  username: 'a1064628',
  privateKey: fs.readFileSync(path.join(os.homedir(), '.ssh', 'ionos_deploy_key')),
  passphrase: '',
  tryKeyboard: true,
  algorithms: {
    kex: [
      'diffie-hellman-group-exchange-sha256',
      'diffie-hellman-group14-sha256',
      'diffie-hellman-group14-sha1',
      'diffie-hellman-group-exchange-sha1',
      'diffie-hellman-group1-sha1'
    ],
    cipher: [
      'aes128-ctr',
      'aes192-ctr',
      'aes256-ctr',
      'aes128-cbc',
      '3des-cbc'
    ],
    serverHostKey: [
      'ssh-rsa',
      'ssh-dss',
      'ecdsa-sha2-nistp256',
      'ecdsa-sha2-nistp384',
      'ecdsa-sha2-nistp521'
    ],
    hmac: [
      'hmac-sha2-256',
      'hmac-sha2-512',
      'hmac-sha1'
    ]
  }
};

const localDistPath = path.join(__dirname, 'deployment');
const remoteBasePath = '/'; // Root directory

class IONOSDeployer {
  constructor() {
    this.client = new Client();
    this.sftp = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        console.log('✅ Connected to IONOS server');
        this.client.sftp((err, sftp) => {
          if (err) {
            reject(err);
            return;
          }
          this.sftp = sftp;
          resolve();
        });
      });

      this.client.on('error', (err) => {
        console.error('❌ Connection error:', err);
        reject(err);
      });

      this.client.connect(config);
    });
  }

  async listRemoteFiles(remotePath = '/') {
    return new Promise((resolve, reject) => {
      this.sftp.readdir(remotePath, (err, list) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(list);
      });
    });
  }

  async deleteRemoteFile(remotePath) {
    return new Promise((resolve, reject) => {
      this.sftp.unlink(remotePath, (err) => {
        if (err) {
          console.warn(`⚠️  Could not delete ${remotePath}:`, err.message);
        } else {
          console.log(`🗑️  Deleted: ${remotePath}`);
        }
        resolve();
      });
    });
  }

  async uploadFile(localPath, remotePath) {
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(localPath);
      const writeStream = this.sftp.createWriteStream(remotePath);

      writeStream.on('close', () => {
        console.log(`📤 Uploaded: ${localPath} → ${remotePath}`);
        resolve();
      });

      writeStream.on('error', (err) => {
        console.error(`❌ Upload failed for ${localPath}:`, err);
        reject(err);
      });

      readStream.pipe(writeStream);
    });
  }

  async cleanWebspace() {
    try {
      console.log('🧹 Cleaning webspace...');
      const files = await this.listRemoteFiles('/');
      
      // Common files to clean (excluding system files)
      const filesToDelete = files.filter(file => 
        file.filename.endsWith('.html') ||
        file.filename.endsWith('.js') ||
        file.filename.endsWith('.css') ||
        file.filename.endsWith('.json') ||
        file.filename.endsWith('.txt') ||
        file.filename === 'favicon.ico'
      );

      for (const file of filesToDelete) {
        await this.deleteRemoteFile(`/${file.filename}`);
      }

      console.log(`✅ Cleaned ${filesToDelete.length} files from webspace`);
    } catch (error) {
      console.error('❌ Error cleaning webspace:', error);
      throw error;
    }
  }

  async uploadDirectory(localDir, remoteDir = '/') {
    try {
      if (!fs.existsSync(localDir)) {
        throw new Error(`Local directory does not exist: ${localDir}`);
      }

      const files = fs.readdirSync(localDir);
      
      for (const file of files) {
        const localFilePath = path.join(localDir, file);
        const remoteFilePath = path.posix.join(remoteDir, file);
        
        const stat = fs.statSync(localFilePath);
        
        if (stat.isFile()) {
          await this.uploadFile(localFilePath, remoteFilePath);
        } else if (stat.isDirectory()) {
          // For simplicity, we're not creating subdirectories in this demo
          console.log(`⏭️  Skipping directory: ${file}`);
        }
      }
    } catch (error) {
      console.error('❌ Error uploading directory:', error);
      throw error;
    }
  }

  async deploy() {
    try {
      console.log('🚀 Starting deployment to IONOS...');
      
      // Clean webspace first
      await this.cleanWebspace();
      
      // Upload new files
      console.log('📤 Uploading files...');
      await this.uploadDirectory(localDistPath);
      
      console.log('✅ Deployment completed successfully!');
      console.log('🌐 Your site should be available at: https://asagents.co.uk');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.end();
      console.log('👋 Disconnected from IONOS server');
    }
  }
}

async function main() {
  const action = process.argv[2] || 'deploy';
  const deployer = new IONOSDeployer();

  try {
    await deployer.connect();
    
    switch (action) {
      case 'clean':
        await deployer.cleanWebspace();
        break;
      case 'upload':
        await deployer.uploadDirectory(localDistPath);
        break;
      case 'deploy':
      default:
        await deployer.deploy();
        break;
    }
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  } finally {
    deployer.disconnect();
  }
}

// Handle script execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { IONOSDeployer };