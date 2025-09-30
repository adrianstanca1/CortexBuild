# File Upload System Documentation

## Overview

The ASAgents Construction Management Platform includes a comprehensive file upload system designed specifically for construction project document management. The system supports uploading, processing, and managing various file types including documents, images, drawings, and other construction-related files.

## Architecture

### Backend Components

#### 1. Upload Middleware (`/backend/src/middleware/upload.ts`)
- **Purpose**: Handles file upload processing with Multer
- **Features**:
  - Multi-file upload support
  - File type validation and filtering
  - Secure file storage with UUID naming
  - Size limits and validation
  - MIME type verification

#### 2. Upload Routes (`/backend/src/routes/uploads.ts`)
- **Purpose**: REST API endpoints for file operations
- **Endpoints**:
  - `POST /api/uploads/single` - Upload single file
  - `POST /api/uploads/multiple` - Upload multiple files
  - `GET /api/uploads/file/:id` - Serve uploaded files
  - `GET /api/uploads/metadata/:id` - Get file metadata
  - `GET /api/uploads/list` - List files with filtering
  - `DELETE /api/uploads/:id` - Delete file

#### 3. File Security Middleware (`/backend/src/middleware/fileSecurity.ts`)
- **Purpose**: Advanced security validation for uploaded files
- **Features**:
  - File signature validation (magic numbers)
  - Basic malware pattern detection
  - Rate limiting (20 uploads per hour per user)
  - Filename sanitization
  - Automatic cleanup of temporary files

### Frontend Components

#### 1. FileUpload Component (`/components/ui/FileUpload.tsx`)
- **Purpose**: Drag-and-drop file upload interface
- **Features**:
  - Drag and drop functionality
  - Progress tracking with real-time updates
  - File type validation
  - Multiple file selection
  - Upload preview and management
  - Error handling and user feedback

#### 2. FileManager Component (`/components/ui/FileManager.tsx`)
- **Purpose**: File browsing and management interface
- **Features**:
  - Grid and list view modes
  - File filtering and search
  - Pagination for large file lists
  - File actions (download, view, delete)
  - Sorting and organization

#### 3. DocumentViewer Component (`/components/ui/DocumentViewer.tsx`)
- **Purpose**: In-browser file viewing capabilities
- **Features**:
  - Image viewing with zoom and rotation
  - PDF preview with navigation
  - Text file display
  - Fullscreen mode
  - Download functionality

### Services

#### 1. Upload Service (`/services/uploadService.ts`)
- **Purpose**: Core service for file upload operations
- **Methods**:
  - `uploadSingle()` - Upload individual file
  - `uploadMultiple()` - Upload multiple files
  - `listFiles()` - Retrieve file listings
  - `deleteFile()` - Remove files
  - `getFileMetadata()` - Get file information
  - `validateFile()` - Client-side validation

#### 2. File Processing Service (`/services/fileProcessingService.ts`)
- **Purpose**: AI-powered file processing and analysis
- **Features**:
  - Text extraction from documents (OCR)
  - Construction image analysis
  - Project insight generation
  - Content search across files
  - Multimodal processing integration

## Supported File Types

### Documents
- **PDF**: Contracts, reports, specifications
- **Microsoft Office**: Word, Excel, PowerPoint files
- **Text Files**: Plain text, CSV, markdown

### Images
- **Formats**: JPEG, PNG, GIF, BMP, TIFF
- **Use Cases**: Progress photos, inspection images, site documentation

### Drawings
- **CAD Files**: DWG, DXF formats
- **Vector Graphics**: SVG files
- **Technical Drawings**: Blueprints, schematics

### Archives
- **Compressed Files**: ZIP, RAR formats
- **Size Limit**: Up to 100MB per file

## Security Features

### File Validation
- **Magic Number Checking**: Validates file signatures to prevent malicious uploads
- **MIME Type Verification**: Ensures uploaded files match their claimed types
- **Size Restrictions**: Configurable limits per file type
- **Filename Sanitization**: Removes dangerous characters and paths

### Access Control
- **Authentication Required**: All operations require valid user authentication
- **Tenant Isolation**: Files are isolated by company/tenant
- **Permission Checks**: Role-based access control for file operations

### Rate Limiting
- **Upload Limits**: Maximum 20 files per hour per user
- **Abuse Prevention**: Protects against spam and DoS attacks
- **Cleanup Tasks**: Automatic removal of failed/temporary uploads

## Database Schema

### Documents Table
```sql
CREATE TABLE documents (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(36),
  company_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50),
  file_url VARCHAR(500) NOT NULL,
  file_size INT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  uploaded_by VARCHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_project_id (project_id),
  INDEX idx_company_id (company_id),
  INDEX idx_uploaded_by (uploaded_by)
);
```

## API Usage Examples

### Upload Single File
```typescript
const file = document.getElementById('fileInput').files[0];
const options = {
  projectId: 'project-123',
  companyId: 'company-456',
  userId: 'user-789',
  type: 'contract'
};

const result = await uploadService.uploadSingle(file, options);
console.log('Uploaded:', result);
```

### List Files
```typescript
const filters = {
  projectId: 'project-123',
  companyId: 'company-456',
  type: 'contract',
  search: 'foundation',
  page: 1,
  limit: 20
};

const { files, meta } = await uploadService.listFiles(filters);
console.log(`Found ${files.length} files`);
```

### Process Files with AI
```typescript
const files = await uploadService.listFiles({ projectId: 'project-123' });
const insights = await fileProcessingService.generateProjectInsights(files.files);

console.log('Project Summary:', insights.summary);
console.log('Recommendations:', insights.recommendations);
console.log('Risks:', insights.risks);
```

## Component Usage

### Basic File Upload
```tsx
import FileUpload from './components/ui/FileUpload';

function ProjectDocuments() {
  const handleUploadComplete = (files) => {
    console.log('Uploaded files:', files);
  };

  return (
    <FileUpload
      projectId="project-123"
      type="contract"
      onUploadComplete={handleUploadComplete}
      multiple={true}
      maxFiles={10}
    />
  );
}
```

### File Manager
```tsx
import FileManager from './components/ui/FileManager';

function DocumentLibrary() {
  const handleFileSelect = (file) => {
    console.log('Selected file:', file);
  };

  return (
    <FileManager
      projectId="project-123"
      onFileSelect={handleFileSelect}
      selectionMode="single"
    />
  );
}
```

### Integrated Solution
```tsx
import ProjectDocuments from './components/projects/ProjectDocuments';

function ProjectPage() {
  return (
    <ProjectDocuments
      projectId="project-123"
      canUpload={true}
      canDelete={true}
    />
  );
}
```

## Configuration

### Environment Variables
```env
# Backend Configuration
UPLOAD_DIR=/var/uploads
MAX_FILE_SIZE=104857600
RATE_LIMIT_UPLOADS=20

# Frontend Configuration
REACT_APP_API_URL=http://localhost:5001/api
REACT_APP_JAVA_API_URL=http://localhost:8080/api
```

### File Storage Structure
```
uploads/
├── documents/          # PDF, Word, Excel files
├── images/            # Photos, screenshots
├── drawings/          # CAD files, blueprints
└── temp/             # Temporary upload processing
```

## Error Handling

### Common Error Scenarios
1. **File Too Large**: Returns 413 with size limit information
2. **Unsupported File Type**: Returns 400 with supported types list
3. **Rate Limit Exceeded**: Returns 429 with retry information
4. **Invalid File Signature**: Returns 400 with security warning
5. **Storage Full**: Returns 507 with cleanup recommendations

### Error Response Format
```json
{
  "success": false,
  "error": "FILE_TOO_LARGE",
  "message": "File exceeds maximum size limit of 100MB",
  "details": {
    "maxSize": 104857600,
    "fileSize": 157286400,
    "supportedTypes": ["pdf", "doc", "docx"]
  }
}
```

## Testing

### Unit Tests
- File validation logic
- Upload service methods
- Security middleware functions
- Component rendering and interactions

### Integration Tests
- End-to-end upload workflow
- File processing pipeline
- Multi-tenant data isolation
- Error handling scenarios

### Run Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
npm test -- --testPathPattern=upload

# Specific test file
npm test tests/upload.test.ts
```

## Performance Considerations

### Upload Optimization
- **Chunked Uploads**: Large files uploaded in segments
- **Parallel Processing**: Multiple files processed concurrently
- **Progress Tracking**: Real-time upload status updates
- **Retry Logic**: Automatic retry for failed uploads

### Storage Management
- **File Cleanup**: Automatic removal of orphaned files
- **Compression**: Image optimization and document compression
- **CDN Integration**: Static file serving through CDN
- **Backup Strategy**: Regular backup of uploaded files

## Security Best Practices

1. **Validate All Inputs**: Never trust client-side validation alone
2. **Scan File Contents**: Check for malware and malicious content
3. **Limit File Types**: Only allow necessary file formats
4. **Rate Limiting**: Prevent abuse and DoS attacks
5. **Secure Storage**: Files stored outside web root
6. **Access Logging**: Track all file operations for audit
7. **Encryption**: Encrypt sensitive documents at rest

## Future Enhancements

### Planned Features
- **Version Control**: File versioning and revision history
- **Collaboration**: Real-time collaborative editing
- **Advanced AI**: Enhanced document analysis and insights
- **Mobile Upload**: Native mobile app integration
- **Cloud Storage**: Integration with AWS S3, Azure Blob, Google Cloud
- **Workflow Integration**: Automated processing based on file types

### Scalability Improvements
- **Microservices**: Split upload service into separate microservice
- **Queue System**: Background processing with Redis/RabbitMQ
- **Load Balancing**: Distribute upload load across servers
- **Database Sharding**: Partition file metadata by tenant
- **Caching Layer**: Redis cache for file metadata and thumbnails

## Support and Maintenance

### Monitoring
- **Upload Success Rate**: Track successful vs failed uploads
- **Processing Time**: Monitor file processing performance
- **Storage Usage**: Track disk space and growth trends
- **Error Rates**: Alert on high error rates or security issues

### Maintenance Tasks
- **Regular Cleanup**: Remove orphaned and temporary files
- **Security Updates**: Keep dependencies and libraries updated
- **Performance Tuning**: Optimize database queries and file serving
- **Backup Verification**: Ensure backup systems are working correctly

For additional support or questions, please refer to the main project documentation or contact the development team.