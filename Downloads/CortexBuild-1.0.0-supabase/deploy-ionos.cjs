/* eslint-env node */
/* global process, console */

const ftp = require('ftp');
const fs = require('fs');
const path = require('path');

const client = new ftp();

// IONOS FTP Configuration
const config = {
  host: process.env.IONOS_FTP_HOST || 'your-ftp-host.ionos.com',
  port: 21,
  user: process.env.IONOS_FTP_USER || 'your-username',
  password: process.env.IONOS_FTP_PASSWORD || 'your-password',
  secure: false
};

const remotePath = process.env.IONOS_REMOTE_PATH || '/';
const localPath = './dist';

function uploadDirectory(client, localDir, remoteDir) {
  return new Promise((resolve, reject) => {
    fs.readdir(localDir, (err, files) => {
      if (err) {
        reject(err);
        return;
      }

      let uploadPromises = [];

      files.forEach(file => {
        const localFilePath = path.join(localDir, file);
        const remoteFilePath = path.join(remoteDir, file).replace(/\\/g, '/');

        const stat = fs.statSync(localFilePath);

        if (stat.isDirectory()) {
          // Create remote directory and recurse
          client.mkdir(remoteFilePath, true, (err) => {
            if (err && err.code !== 550) { // 550 = directory already exists
              console.error(`Error creating directory ${remoteFilePath}:`, err);
              return;
            }
            uploadPromises.push(uploadDirectory(client, localFilePath, remoteFilePath));
          });
        } else {
          // Upload file
          uploadPromises.push(new Promise((resolveFile, rejectFile) => {
            client.put(localFilePath, remoteFilePath, (err) => {
              if (err) {
                console.error(`Error uploading ${localFilePath} to ${remoteFilePath}:`, err);
                rejectFile(err);
              } else {
                console.log(`Uploaded: ${localFilePath} -> ${remoteFilePath}`);
                resolveFile();
              }
            });
          }));
        }
      });

      Promise.all(uploadPromises).then(resolve).catch(reject);
    });
  });
}

client.on('ready', () => {
  console.log('Connected to IONOS FTP server');

  // First, try to remove all files in the remote directory
  client.list(remotePath, (err, list) => {
    if (err) {
      console.error('Error listing remote directory:', err);
      client.end();
      return;
    }

    // Delete existing files
    const deletePromises = list.map(item => {
      return new Promise((resolve) => {
        const itemPath = path.join(remotePath, item.name).replace(/\\/g, '/');
        if (item.type === 'd' && item.name !== '.' && item.name !== '..') {
          // Delete directory recursively
          client.rmdir(itemPath, true, (err) => {
            if (err) console.error(`Error deleting directory ${itemPath}:`, err);
            resolve();
          });
        } else if (item.type === '-') {
          // Delete file
          client.delete(itemPath, (err) => {
            if (err) console.error(`Error deleting file ${itemPath}:`, err);
            resolve();
          });
        } else {
          resolve();
        }
      });
    });

    Promise.all(deletePromises).then(() => {
      console.log('Cleaned remote directory');

      // Now upload the new files
      uploadDirectory(client, localPath, remotePath).then(() => {
        console.log('Deployment completed successfully!');
        client.end();
      }).catch((err) => {
        console.error('Upload failed:', err);
        client.end();
      });
    });
  });
});

client.on('error', (err) => {
  console.error('FTP connection error:', err);
});

console.log('Connecting to IONOS FTP...');
client.connect(config);