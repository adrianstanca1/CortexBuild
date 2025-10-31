/**
 * IONOS Webspace Deployment Script
 * Optimized for IONOS hosting environment
 * Account: 32bf87ff-20e2-429c-8c29-7dd4d1ff51a5
 */

const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fs = require('fs');

// IONOS-specific deployment configuration
const config = {
  // IONOS Account Information
  accountId: '32bf87ff-20e2-429c-8c29-7dd4d1ff51a5',
  webspaceExplorer: 'https://my.ionos.co.uk/webhosting/32bf87ff-20e2-429c-8c29-7dd4d1ff51a5/webspace-explorer',
  
  // Connection Details
  server: 'access-5018479682.webspace-host.com',
  port: 22,
  username: 'a1064628',
  password: 'Cumparavinde1',
  
  // IONOS Directory Structure
  remotePath: '/html',
  backupPath: '/backups',
  logPath: '/logs',
  uploadPath: '/uploads',
  
  // Local Configuration
  localPath: './deployment',
  
  // IONOS-specific settings
  ionosSettings: {
    phpVersion: '8.2',
    sslEnabled: true,
    compressionEnabled: true,
    backupRetention: 30
  }
};

class IONOSDeployer {
  constructor() {
    this.sftp = new SftpClient();
    this.deploymentId = `ionos_deploy_${Date.now()}`;
  }

  async connect() {
    console.log(`🔌 Connecting to IONOS server ${config.server}...`);
    console.log(`📋 Account ID: ${config.accountId}`);
    
    try {
      await this.sftp.connect({
        host: config.server,
        port: config.port,
        username: config.username,
        password: config.password,
        readyTimeout: 20000,
        retries: 3,
        algorithms: {
          kex: ['diffie-hellman-group-exchange-sha256'],
          cipher: ['aes128-ctr', 'aes192-ctr', 'aes256-ctr'],
          serverHostKey: ['ssh-rsa', 'ssh-dss'],
          hmac: ['hmac-sha2-256', 'hmac-sha2-512', 'hmac-sha1']
        }
      });
      console.log('✅ Connected to IONOS webspace successfully');
    } catch (error) {
      console.error('❌ IONOS connection failed:', error.message);
      throw error;
    }
  }

  async checkIONOSEnvironment() {
    console.log('🔍 Checking IONOS environment...');
    
    try {
      // Check directory structure
      const rootDirs = await this.sftp.list('/');
      const expectedDirs = ['html', 'logs', 'backups'];
      
      for (const dir of expectedDirs) {
        const exists = rootDirs.some(item => item.name === dir && item.type === 'd');
        console.log(`${exists ? '✅' : '⚠️'} /${dir} directory ${exists ? 'found' : 'missing'}`);
      }
      
      // Check current deployment
      try {
        const htmlContents = await this.sftp.list(config.remotePath);
        console.log(`📁 Current deployment has ${htmlContents.length} items`);
      } catch (error) {
        console.log('📁 /html directory is empty or inaccessible');
      }
      
      console.log('✅ IONOS environment check completed');
    } catch (error) {
      console.warn('⚠️ Environment check failed:', error.message);
    }
  }

  async createIONOSBackup() {
    console.log('💾 Creating IONOS backup...');
    
    try {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const backupName = `backup_${timestamp}`;
      const backupDir = `${config.backupPath}/${backupName}`;
      
      // Ensure backup directory exists
      await this.sftp.mkdir(config.backupPath, true);
      await this.sftp.mkdir(backupDir, true);
      
      // Copy current deployment to backup
      const currentFiles = await this.sftp.list(config.remotePath);
      
      for (const file of currentFiles) {
        if (file.type === '-') { // Regular file
          try {
            await this.sftp.fastGet(
              `${config.remotePath}/${file.name}`,
              `${backupDir}/${file.name}`
            );
          } catch (error) {
            console.warn(`⚠️ Could not backup ${file.name}:`, error.message);
          }
        }
      }
      
      console.log(`✅ IONOS backup created: ${backupName}`);
      
      // Cleanup old backups (keep last 5)
      await this.cleanupOldBackups();
      
      return backupName;
    } catch (error) {
      console.warn('⚠️ IONOS backup creation failed:', error.message);
      return null;
    }
  }

  async cleanupOldBackups() {
    try {
      const backups = await this.sftp.list(config.backupPath);
      const backupDirs = backups
        .filter(item => item.type === 'd' && item.name.startsWith('backup_'))
        .sort((a, b) => b.modifyTime - a.modifyTime);
      
      // Keep only the latest 5 backups
      const backupsToDelete = backupDirs.slice(5);
      
      for (const backup of backupsToDelete) {
        try {
          await this.sftp.rmdir(`${config.backupPath}/${backup.name}`, true);
          console.log(`🗑️ Cleaned up old backup: ${backup.name}`);
        } catch (error) {
          console.warn(`⚠️ Could not delete backup ${backup.name}:`, error.message);
        }
      }
    } catch (error) {
      console.warn('⚠️ Backup cleanup failed:', error.message);
    }
  }

  async deployToIONOS() {
    console.log('🚀 Deploying to IONOS webspace...');
    
    if (!fs.existsSync(config.localPath)) {
      throw new Error(`Build directory not found: ${config.localPath}. Run 'npm run build' first.`);
    }

    try {
      // Upload files with IONOS-optimized settings
      await this.sftp.uploadDir(config.localPath, config.remotePath, {
        filter: (itemPath) => {
          const name = path.basename(itemPath);
          // Skip hidden files and development files
          return !name.startsWith('.') && 
                 !['node_modules', '.git', 'src', 'tests'].includes(name) &&
                 !name.endsWith('.map'); // Skip source maps for production
        },
        useFastPut: true // Use faster upload method
      });
      
      console.log('✅ Files uploaded to IONOS successfully');
    } catch (error) {
      console.error('❌ IONOS upload failed:', error.message);
      throw error;
    }
  }

  async setIONOSPermissions() {
    console.log('🔒 Setting IONOS-compatible permissions...');
    
    try {
      // IONOS recommends specific permissions
      await this.sftp.exec(`find ${config.remotePath} -type f -exec chmod 644 {} \\;`);
      await this.sftp.exec(`find ${config.remotePath} -type d -exec chmod 755 {} \\;`);
      
      // Special permissions for specific files
      const executableFiles = ['*.cgi', '*.pl', '*.sh'];
      for (const pattern of executableFiles) {
        await this.sftp.exec(`find ${config.remotePath} -name "${pattern}" -exec chmod 755 {} \\; 2>/dev/null || true`);
      }
      
      console.log('✅ IONOS permissions set correctly');
    } catch (error) {
      console.warn('⚠️ Permission setting failed:', error.message);
    }
  }

  async verifyIONOSDeployment() {
    console.log('🔍 Verifying IONOS deployment...');
    
    try {
      const files = await this.sftp.list(config.remotePath);
      const hasIndexHtml = files.some(file => file.name === 'index.html');
      const hasAssets = files.some(file => file.name === 'assets' && file.type === 'd');
      
      if (hasIndexHtml) {
        console.log('✅ index.html found - deployment verified');
        if (hasAssets) {
          console.log('✅ Assets directory found');
        }
        
        console.log(`🌐 Site available at: https://${config.server}`);
        console.log(`🔧 Manage via: ${config.webspaceExplorer}`);
        
        return true;
      } else {
        console.error('❌ index.html not found - deployment may have failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Deployment verification failed:', error.message);
      return false;
    }
  }

  async deploy() {
    try {
      console.log(`🚀 Starting IONOS deployment ${this.deploymentId}...`);
      console.log(`📍 Target: ${config.server}${config.remotePath}`);
      console.log(`🏢 IONOS Account: ${config.accountId}`);
      
      await this.connect();
      await this.checkIONOSEnvironment();
      
      const backupName = await this.createIONOSBackup();
      
      await this.deployToIONOS();
      await this.setIONOSPermissions();
      
      const isVerified = await this.verifyIONOSDeployment();
      
      if (isVerified) {
        console.log('🎉 IONOS deployment completed successfully!');
        console.log(`🌐 Visit: https://${config.server}`);
        console.log(`🔧 Manage: ${config.webspaceExplorer}`);
        
        if (backupName) {
          console.log(`💾 Backup: ${backupName}`);
        }
      } else {
        throw new Error('IONOS deployment verification failed');
      }
      
    } catch (error) {
      console.error('💥 IONOS deployment failed:', error.message);
      console.log('🔧 Troubleshooting:');
      console.log('- Check IONOS control panel for any issues');
      console.log('- Verify SFTP credentials are correct');
      console.log('- Ensure build directory exists and contains files');
      console.log(`- Visit webspace explorer: ${config.webspaceExplorer}`);
      throw error;
    } finally {
      await this.sftp.end();
      console.log('🔌 IONOS connection closed');
    }
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new IONOSDeployer();
  
  deployer.deploy()
    .then(() => {
      console.log('✨ IONOS deployment process completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 IONOS deployment process failed:', error);
      process.exit(1);
    });
}

module.exports = IONOSDeployer;