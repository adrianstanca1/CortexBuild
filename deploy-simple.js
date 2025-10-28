#!/usr/bin/env node

const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');

const config = {
  host: 'access-5018479682.webspace-host.com',
  port: 22,
  username: 'a1064628',
  password: 'Cumparavinde1',
  readyTimeout: 30000,
  retries: 3,
  algorithms: {
    kex: [
      'diffie-hellman-group-exchange-sha256',
      'diffie-hellman-group14-sha256',
      'diffie-hellman-group14-sha1',
      'ecdh-sha2-nistp256',
      'ecdh-sha2-nistp384',
      'ecdh-sha2-nistp521'
    ],
    cipher: [
      'aes128-ctr',
      'aes192-ctr',
      'aes256-ctr',
      'aes128-gcm@openssh.com',
      'aes256-gcm@openssh.com'
    ],
    serverHostKey: [
      'ssh-ed25519',
      'ssh-rsa',
      'rsa-sha2-256',
      'rsa-sha2-512',
      'ecdsa-sha2-nistp256',
      'ecdsa-sha2-nistp384',
      'ecdsa-sha2-nistp521'
    ],
    hmac: [
      'hmac-sha2-256',
      'hmac-sha2-512',
      'hmac-sha1'
    ]
  },
  debug: (msg) => console.log('DEBUG:', msg)
};

const localPath = path.join(__dirname, 'deployment');
const remotePath = '/';

async function deploy() {
  const sftp = new SftpClient();
  
  console.log('🚀 Starting deployment to IONOS...');
  console.log(`📁 Local: ${localPath}`);
  console.log(`🌐 Remote: ${config.host}${remotePath}`);
  
  try {
    // Connect
    console.log('🔌 Connecting...');
    await sftp.connect(config);
    console.log('✅ Connected successfully');
    
    // Check local directory
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local directory not found: ${localPath}`);
    }
    
    // List current files
    console.log('📋 Current remote files:');
    const currentFiles = await sftp.list(remotePath);
    currentFiles.forEach(file => console.log(`  - ${file.name}`));
    
    // Clean old files
    console.log('🧹 Cleaning old deployment files...');
    for (const file of currentFiles) {
      if (file.type === '-' && (
        file.name.endsWith('.html') ||
        file.name.endsWith('.js') ||
        file.name.endsWith('.css') ||
        file.name === 'favicon.ico'
      )) {
        try {
          await sftp.delete(`${remotePath}${file.name}`);
          console.log(`  ✓ Deleted: ${file.name}`);
        } catch (err) {
          console.log(`  ⚠️  Could not delete: ${file.name}`);
        }
      } else if (file.type === 'd' && file.name === 'assets') {
        try {
          await sftp.rmdir(`${remotePath}${file.name}`, true);
          console.log(`  ✓ Deleted directory: ${file.name}`);
        } catch (err) {
          console.log(`  ⚠️  Could not delete directory: ${file.name}`);
        }
      }
    }
    
    // Upload new files
    console.log('📤 Uploading new files...');
    const files = fs.readdirSync(localPath);
    
    for (const file of files) {
      const localFile = path.join(localPath, file);
      const remoteFile = path.posix.join(remotePath, file);
      const stat = fs.statSync(localFile);
      
      if (stat.isFile()) {
        await sftp.put(localFile, remoteFile);
        console.log(`  ✓ Uploaded: ${file}`);
      } else if (stat.isDirectory()) {
        await sftp.uploadDir(localFile, remoteFile);
        console.log(`  ✓ Uploaded directory: ${file}`);
      }
    }
    
    // Verify
    console.log('🔍 Verifying deployment...');
    const newFiles = await sftp.list(remotePath);
    const hasIndex = newFiles.some(f => f.name === 'index.html');
    const hasAssets = newFiles.some(f => f.name === 'assets' && f.type === 'd');
    
    if (hasIndex && hasAssets) {
      console.log('✅ Deployment successful!');
      console.log('🌐 Your site is live at: https://asagents.co.uk');
      console.log('🌐 Or: https://access-5018479682.webspace-host.com');
    } else {
      console.log('⚠️  Deployment may be incomplete:');
      console.log(`  - index.html: ${hasIndex ? '✓' : '✗'}`);
      console.log(`  - assets/: ${hasAssets ? '✓' : '✗'}`);
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    throw error;
  } finally {
    await sftp.end();
    console.log('🔌 Connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  deploy()
    .then(() => {
      console.log('✨ Deployment complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Deployment failed:', error);
      process.exit(1);
    });
}

module.exports = { deploy };

