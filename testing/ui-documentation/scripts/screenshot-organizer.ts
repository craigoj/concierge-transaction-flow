#!/usr/bin/env ts-node

import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';

interface ScreenshotMetadata {
  filename: string;
  category: string;
  subcategory?: string;
  device: 'desktop' | 'mobile' | 'tablet';
  timestamp: string;
  description: string;
  flow?: string;
  viewport: {
    width: number;
    height: number;
  };
}

class ScreenshotOrganizer {
  private readonly screenshotsDir = './screenshots';
  private readonly outputDir = './organized-screenshots';
  private readonly metadataFile = './screenshot-metadata.json';

  async organize() {
    console.log('📸 Starting screenshot organization...');
    
    await this.createDirectoryStructure();
    const screenshots = await this.getScreenshots();
    const metadata = this.categorizeScreenshots(screenshots);
    
    await this.copyAndResizeScreenshots(metadata);
    await this.generateMetadataFile(metadata);
    await this.generateIndexPage(metadata);
    
    console.log('✅ Screenshot organization completed!');
  }

  private async createDirectoryStructure() {
    const categories = [
      'landing-pages',
      'authentication',
      'dashboard',
      'transactions',
      'clients',
      'agents',
      'workflows',
      'automation',
      'settings',
      'mobile-views',
      'components',
      'states',
      'flows',
      'errors'
    ];

    await fs.ensureDir(this.outputDir);
    
    for (const category of categories) {
      await fs.ensureDir(path.join(this.outputDir, category));
      await fs.ensureDir(path.join(this.outputDir, category, 'desktop'));
      await fs.ensureDir(path.join(this.outputDir, category, 'mobile'));
      await fs.ensureDir(path.join(this.outputDir, category, 'tablet'));
    }
  }

  private async getScreenshots(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.screenshotsDir);
      return files.filter(file => file.endsWith('.png'));
    } catch (error) {
      console.log('Screenshots directory not found, skipping...');
      return [];
    }
  }

  private categorizeScreenshots(screenshots: string[]): ScreenshotMetadata[] {
    return screenshots.map(filename => {
      const metadata: ScreenshotMetadata = {
        filename,
        category: this.determineCategory(filename),
        device: this.determineDevice(filename),
        timestamp: new Date().toISOString(),
        description: this.generateDescription(filename),
        viewport: { width: 1920, height: 1080 } // Default, will be updated after reading image
      };

      // Add subcategory and flow if applicable
      if (filename.includes('flow-')) {
        metadata.flow = this.extractFlow(filename);
      }
      
      metadata.subcategory = this.determineSubcategory(filename);
      
      return metadata;
    });
  }

  private determineCategory(filename: string): string {
    if (filename.includes('landing')) return 'landing-pages';
    if (filename.includes('auth')) return 'authentication';
    if (filename.includes('dashboard')) return 'dashboard';
    if (filename.includes('transaction')) return 'transactions';
    if (filename.includes('client')) return 'clients';
    if (filename.includes('agent')) return 'agents';
    if (filename.includes('workflow')) return 'workflows';
    if (filename.includes('automation')) return 'automation';
    if (filename.includes('settings') || filename.includes('profile')) return 'settings';
    if (filename.includes('mobile')) return 'mobile-views';
    if (filename.includes('form') || filename.includes('loading') || filename.includes('error')) return 'states';
    if (filename.includes('flow-')) return 'flows';
    return 'components';
  }

  private determineDevice(filename: string): 'desktop' | 'mobile' | 'tablet' {
    if (filename.includes('mobile')) return 'mobile';
    if (filename.includes('tablet')) return 'tablet';
    return 'desktop';
  }

  private determineSubcategory(filename: string): string | undefined {
    // Extract more specific categorization
    if (filename.includes('stats')) return 'statistics';
    if (filename.includes('tabs')) return 'navigation';
    if (filename.includes('form')) return 'forms';
    if (filename.includes('modal')) return 'modals';
    if (filename.includes('header')) return 'headers';
    if (filename.includes('hero')) return 'hero-sections';
    return undefined;
  }

  private extractFlow(filename: string): string {
    const match = filename.match(/flow-([^-]+)/);
    return match ? match[1] : 'unknown';
  }

  private generateDescription(filename: string): string {
    // Generate human-readable description from filename
    return filename
      .replace(/\.png$/, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/([A-Z])/g, ' $1')
      .trim();
  }

  private async copyAndResizeScreenshots(metadata: ScreenshotMetadata[]) {
    console.log('🖼️  Processing and copying screenshots...');
    
    for (const meta of metadata) {
      const sourcePath = path.join(this.screenshotsDir, meta.filename);
      const targetDir = path.join(this.outputDir, meta.category, meta.device);
      const targetPath = path.join(targetDir, meta.filename);
      
      try {
        // Get actual image dimensions
        const imageInfo = await sharp(sourcePath).metadata();
        meta.viewport.width = imageInfo.width || 1920;
        meta.viewport.height = imageInfo.height || 1080;
        
        // Copy original
        await fs.copy(sourcePath, targetPath);
        
        // Create thumbnail
        const thumbnailPath = path.join(targetDir, `thumb_${meta.filename}`);
        await sharp(sourcePath)
          .resize(400, 300, { fit: 'cover' })
          .png()
          .toFile(thumbnailPath);
          
      } catch (error) {
        console.error(`Error processing ${meta.filename}:`, error);
      }
    }
  }

  private async generateMetadataFile(metadata: ScreenshotMetadata[]) {
    await fs.writeJson(this.metadataFile, {
      generated: new Date().toISOString(),
      total_screenshots: metadata.length,
      categories: this.groupByCategory(metadata),
      screenshots: metadata
    }, { spaces: 2 });
  }

  private groupByCategory(metadata: ScreenshotMetadata[]) {
    const grouped: Record<string, number> = {};
    metadata.forEach(meta => {
      grouped[meta.category] = (grouped[meta.category] || 0) + 1;
    });
    return grouped;
  }

  private async generateIndexPage(metadata: ScreenshotMetadata[]) {
    const html = this.generateHTMLIndex(metadata);
    await fs.writeFile(path.join(this.outputDir, 'index.html'), html);
  }

  private generateHTMLIndex(metadata: ScreenshotMetadata[]): string {
    const categorizedScreenshots = this.groupScreenshotsByCategory(metadata);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Concierge Transaction Flow - UI Documentation</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .header { 
            background: #3C3C3C; 
            color: white; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 30px; 
        }
        .category { 
            background: white; 
            margin: 20px 0; 
            border-radius: 8px; 
            box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
        }
        .category-header { 
            background: #D1C7BC; 
            padding: 15px 20px; 
            font-weight: bold; 
            border-radius: 8px 8px 0 0; 
        }
        .screenshot-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
            gap: 20px; 
            padding: 20px; 
        }
        .screenshot-card { 
            border: 1px solid #ddd; 
            border-radius: 8px; 
            overflow: hidden; 
        }
        .screenshot-image { 
            width: 100%; 
            height: 200px; 
            object-fit: cover; 
        }
        .screenshot-info { 
            padding: 15px; 
        }
        .screenshot-title { 
            font-weight: bold; 
            margin-bottom: 5px; 
        }
        .screenshot-meta { 
            font-size: 12px; 
            color: #666; 
        }
        .device-badge { 
            display: inline-block; 
            padding: 2px 8px; 
            border-radius: 12px; 
            font-size: 10px; 
            font-weight: bold; 
            text-transform: uppercase; 
        }
        .desktop { background: #e3f2fd; color: #1976d2; }
        .mobile { background: #f3e5f5; color: #7b1fa2; }
        .tablet { background: #e8f5e8; color: #388e3c; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏠 Concierge Transaction Flow - UI Documentation</h1>
        <p>Comprehensive visual documentation generated on ${new Date().toLocaleDateString()}</p>
        <p><strong>Total Screenshots:</strong> ${metadata.length}</p>
    </div>

    ${Object.entries(categorizedScreenshots).map(([category, screenshots]) => `
        <div class="category">
            <div class="category-header">
                📁 ${category.replace('-', ' ').toUpperCase()} (${screenshots.length} screenshots)
            </div>
            <div class="screenshot-grid">
                ${screenshots.map(screenshot => `
                    <div class="screenshot-card">
                        <img src="${category}/${screenshot.device}/thumb_${screenshot.filename}" 
                             alt="${screenshot.description}" 
                             class="screenshot-image"
                             onclick="window.open('${category}/${screenshot.device}/${screenshot.filename}', '_blank')">
                        <div class="screenshot-info">
                            <div class="screenshot-title">${screenshot.description}</div>
                            <div class="screenshot-meta">
                                <span class="device-badge ${screenshot.device}">${screenshot.device}</span>
                                ${screenshot.viewport.width}×${screenshot.viewport.height}
                                ${screenshot.flow ? `• Flow: ${screenshot.flow}` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('')}

    <script>
        console.log('📸 UI Documentation loaded with ${metadata.length} screenshots');
    </script>
</body>
</html>`;
  }

  private groupScreenshotsByCategory(metadata: ScreenshotMetadata[]): Record<string, ScreenshotMetadata[]> {
    const grouped: Record<string, ScreenshotMetadata[]> = {};
    metadata.forEach(meta => {
      if (!grouped[meta.category]) {
        grouped[meta.category] = [];
      }
      grouped[meta.category].push(meta);
    });
    return grouped;
  }
}

// Run the organizer
if (require.main === module) {
  const organizer = new ScreenshotOrganizer();
  organizer.organize().catch(console.error);
}

export { ScreenshotOrganizer };