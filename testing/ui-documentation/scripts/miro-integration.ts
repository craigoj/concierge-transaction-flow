#!/usr/bin/env ts-node

import fs from 'fs-extra';
import path from 'path';

interface MiroCard {
  id: string;
  type: 'image' | 'text' | 'sticky_note';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  metadata: {
    screenshot_path?: string;
    category: string;
    device: string;
    description: string;
    flow?: string;
    page_url?: string;
    timestamp: string;
  };
}

interface MiroBoardLayout {
  title: string;
  description: string;
  cards: MiroCard[];
  sections: {
    name: string;
    position: { x: number; y: number };
    width: number;
    height: number;
    cards: string[]; // Card IDs
  }[];
}

class MiroBoardGenerator {
  private readonly screenshotsDir = './organized-screenshots';
  private readonly metadataFile = './screenshot-metadata.json';
  private readonly outputFile = './miro-board-data.json';
  
  // Layout configuration
  private readonly CARD_WIDTH = 400;
  private readonly CARD_HEIGHT = 300;
  private readonly CARD_SPACING = 50;
  private readonly SECTION_MARGIN = 100;
  
  async generateMiroBoard(): Promise<void> {
    console.log('🎨 Generating MIRO board layout for UI documentation...');
    
    const metadata = await this.loadMetadata();
    const layout = await this.createBoardLayout(metadata);
    
    await this.generateMiroJSON(layout);
    await this.generateMiroInstructions();
    await this.generateMiroHTML(layout);
    
    console.log('✅ MIRO board data generated successfully!');
    console.log('📁 Files created:');
    console.log('   - miro-board-data.json (Board structure)');
    console.log('   - miro-instructions.md (Setup guide)');
    console.log('   - miro-preview.html (Visual preview)');
  }

  private async loadMetadata(): Promise<any> {
    try {
      return await fs.readJson(this.metadataFile);
    } catch (error) {
      console.error('❌ Could not load screenshot metadata');
      throw error;
    }
  }

  private async createBoardLayout(metadata: any): Promise<MiroBoardLayout> {
    const screenshots = metadata.screenshots || [];
    const categorizedScreenshots = this.groupScreenshotsByCategory(screenshots);
    
    const layout: MiroBoardLayout = {
      title: 'Concierge Transaction Flow - UI Documentation',
      description: `Comprehensive UI/UX documentation generated on ${new Date().toLocaleDateString()}`,
      cards: [],
      sections: []
    };

    let currentY = 0;
    const sectionWidth = 1400;

    // Create title section
    layout.cards.push({
      id: 'title-card',
      type: 'text',
      content: '🏠 Concierge Transaction Flow\\n\\nUI/UX Documentation\\n\\nGenerated: ' + new Date().toLocaleDateString(),
      position: { x: 0, y: currentY },
      size: { width: sectionWidth, height: 150 },
      metadata: {
        category: 'title',
        device: 'all',
        description: 'Main title card',
        timestamp: new Date().toISOString()
      }
    });

    currentY += 200;

    // Create sections for each category
    for (const [category, categoryScreenshots] of Object.entries(categorizedScreenshots)) {
      const section = await this.createCategorySection(
        category, 
        categoryScreenshots as any[], 
        { x: 0, y: currentY },
        sectionWidth
      );
      
      layout.sections.push(section);
      layout.cards.push(...section.cards.map(cardId => 
        layout.cards.find(card => card.id === cardId) || this.createCategoryCard(cardId, categoryScreenshots as any[], { x: 0, y: currentY })
      ).filter(Boolean) as MiroCard[]);
      
      currentY += section.height + this.SECTION_MARGIN;
    }

    return layout;
  }

  private groupScreenshotsByCategory(screenshots: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    screenshots.forEach(screenshot => {
      const category = screenshot.category || 'uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(screenshot);
    });
    return grouped;
  }

  private async createCategorySection(
    category: string, 
    screenshots: any[], 
    startPosition: { x: number; y: number },
    sectionWidth: number
  ) {
    const sectionHeight = Math.ceil(screenshots.length / 3) * (this.CARD_HEIGHT + this.CARD_SPACING) + 100;
    
    const section = {
      name: category.replace('-', ' ').toUpperCase(),
      position: startPosition,
      width: sectionWidth,
      height: sectionHeight,
      cards: []
    };

    // Create section header
    const headerCard: MiroCard = {
      id: `${category}-header`,
      type: 'sticky_note',
      content: `📁 ${section.name}\\n\\n${screenshots.length} screenshots`,
      position: { x: startPosition.x, y: startPosition.y },
      size: { width: sectionWidth, height: 80 },
      metadata: {
        category,
        device: 'all',
        description: `Section header for ${category}`,
        timestamp: new Date().toISOString()
      }
    };

    section.cards.push(headerCard.id);

    // Create cards for screenshots
    let cardX = startPosition.x;
    let cardY = startPosition.y + 100;
    let cardsInRow = 0;
    const maxCardsPerRow = 3;

    for (const screenshot of screenshots) {
      const card: MiroCard = {
        id: `${category}-${screenshot.filename}`,
        type: 'image',
        content: `${screenshot.description}\\n\\nDevice: ${screenshot.device}\\nViewport: ${screenshot.viewport.width}×${screenshot.viewport.height}`,
        position: { x: cardX, y: cardY },
        size: { width: this.CARD_WIDTH, height: this.CARD_HEIGHT },
        metadata: {
          screenshot_path: `${category}/${screenshot.device}/${screenshot.filename}`,
          category: screenshot.category,
          device: screenshot.device,
          description: screenshot.description,
          flow: screenshot.flow,
          page_url: this.inferPageURL(screenshot),
          timestamp: screenshot.timestamp
        }
      };

      section.cards.push(card.id);

      // Move to next position
      cardsInRow++;
      if (cardsInRow >= maxCardsPerRow) {
        cardX = startPosition.x;
        cardY += this.CARD_HEIGHT + this.CARD_SPACING;
        cardsInRow = 0;
      } else {
        cardX += this.CARD_WIDTH + this.CARD_SPACING;
      }
    }

    return section;
  }

  private createCategoryCard(cardId: string, screenshots: any[], position: { x: number; y: number }): MiroCard {
    const screenshot = screenshots.find(s => `${s.category}-${s.filename}` === cardId);
    if (!screenshot) {
      return {
        id: cardId,
        type: 'text',
        content: 'Screenshot not found',
        position,
        metadata: {
          category: 'unknown',
          device: 'unknown',
          description: 'Missing screenshot',
          timestamp: new Date().toISOString()
        }
      };
    }

    return {
      id: cardId,
      type: 'image',
      content: screenshot.description,
      position,
      size: { width: this.CARD_WIDTH, height: this.CARD_HEIGHT },
      metadata: {
        screenshot_path: `${screenshot.category}/${screenshot.device}/${screenshot.filename}`,
        category: screenshot.category,
        device: screenshot.device,
        description: screenshot.description,
        flow: screenshot.flow,
        page_url: this.inferPageURL(screenshot),
        timestamp: screenshot.timestamp
      }
    };
  }

  private inferPageURL(screenshot: any): string {
    const filename = screenshot.filename.toLowerCase();
    
    if (filename.includes('landing')) return '/landing';
    if (filename.includes('auth')) return '/auth';
    if (filename.includes('dashboard')) return '/dashboard';
    if (filename.includes('transaction')) return '/transactions';
    if (filename.includes('client')) return '/clients';
    if (filename.includes('agent')) return '/agent/dashboard';
    if (filename.includes('workflow')) return '/workflows';
    if (filename.includes('automation')) return '/automation';
    if (filename.includes('settings')) return '/settings';
    if (filename.includes('profile')) return '/profile';
    
    return '/';
  }

  private async generateMiroJSON(layout: MiroBoardLayout): Promise<void> {
    const miroData = {
      board: {
        title: layout.title,
        description: layout.description,
        created_at: new Date().toISOString(),
        widgets: layout.cards.map(card => ({
          id: card.id,
          type: card.type,
          x: card.position.x,
          y: card.position.y,
          width: card.size?.width || this.CARD_WIDTH,
          height: card.size?.height || this.CARD_HEIGHT,
          text: card.content,
          metadata: card.metadata
        })),
        sections: layout.sections,
        total_screenshots: layout.cards.filter(card => card.type === 'image').length
      },
      instructions: {
        upload_process: [
          '1. Export screenshots from organized-screenshots/ folder',
          '2. Create new Miro board',
          '3. Upload images in batches by category',
          '4. Use provided coordinates for positioning',
          '5. Add annotations and connections as needed'
        ],
        recommended_board_size: '1400x8000px',
        collaboration_features: [
          'Add comments to highlight issues',
          'Use colored frames for different review stages',
          'Create voting sessions for design decisions',
          'Link to GitHub issues for identified problems'
        ]
      }
    };

    await fs.writeJson(this.outputFile, miroData, { spaces: 2 });
  }

  private async generateMiroInstructions(): Promise<void> {
    const instructions = `# 🎨 MIRO Board Setup Instructions

## Overview
This guide helps you create a comprehensive MIRO board for the Concierge Transaction Flow UI documentation.

## Prerequisites
1. MIRO account with board creation permissions
2. Generated screenshots from the testing suite
3. Organized screenshots folder structure

## Step-by-Step Setup

### 1. Create New MIRO Board
- Title: "Concierge Transaction Flow - UI Documentation"
- Template: "Blank Board"
- Size: Large (recommended 1400×8000px)

### 2. Upload Screenshots

#### Batch Upload Process
1. Navigate to \`organized-screenshots/\` folder
2. Upload by category for better organization:
   - Landing Pages
   - Authentication
   - Dashboard Views
   - Transaction Management
   - Client Management
   - Agent Portal
   - Workflows & Automation
   - Mobile Views

#### Upload Tips
- Use drag-and-drop for multiple files
- Upload thumbnails first for layout planning
- Replace with full-size images after positioning
- Keep original filenames for reference

### 3. Layout Organization

#### Section Structure
Each category gets its own section with:
- **Header**: Category name and screenshot count
- **Grid Layout**: 3 columns for optimal viewing
- **Device Grouping**: Desktop, mobile, tablet sub-sections

#### Positioning Guide
Use the coordinates from \`miro-board-data.json\`:
- X: Horizontal position from left edge
- Y: Vertical position from top edge
- Spacing: 50px between cards, 100px between sections

### 4. Add Annotations

#### Screenshot Annotations
For each screenshot, add:
- **Page URL**: Direct link to the feature
- **Device Type**: Desktop/Mobile/Tablet badge
- **Viewport Size**: Dimensions for reference
- **Flow Context**: If part of a user journey
- **Date Captured**: For version tracking

#### Issue Tracking
Use colored sticky notes:
- 🔴 **Red**: Critical issues or bugs
- 🟡 **Yellow**: Improvement opportunities
- 🟢 **Green**: Successful implementations
- 🔵 **Blue**: Questions or clarifications needed

### 5. Interactive Features

#### User Flow Mapping
- Connect related screenshots with arrows
- Show progression through multi-step processes
- Highlight decision points and branches
- Map error and success scenarios

#### Collaborative Review
- Add comment threads for specific elements
- Use voting stickers for prioritization
- Create frames for different review stages
- Link to GitHub issues for technical details

## Automation Integration

### Webhook Setup (Optional)
Configure MIRO webhooks to automatically:
- Notify team of new screenshots
- Update board status when issues are resolved
- Sync with GitHub issue updates

### API Integration (Advanced)
Use MIRO REST API to:
- Automatically upload new screenshots
- Update annotations with test results
- Generate progress reports

## Board Maintenance

### Regular Updates
- Weekly screenshot refreshes during active development
- Monthly comprehensive reviews
- Version tagging for major releases
- Archive old versions for historical reference

### Quality Assurance
- Verify all screenshots are current
- Check for broken links or missing annotations
- Ensure consistent naming conventions
- Validate flow connections and logic

## Collaboration Guidelines

### Team Roles
- **Reviewers**: Add comments and suggestions
- **Implementers**: Update status and close issues
- **Stakeholders**: Provide feedback and priorities
- **QA Team**: Validate fixes and improvements

### Review Process
1. Initial screenshot upload
2. Team review and annotation
3. Issue identification and prioritization
4. Implementation tracking
5. Validation and closure

## Export and Sharing

### Board Sharing
- **View Access**: For stakeholders and external reviewers
- **Edit Access**: For team members and implementers
- **Admin Access**: For project leads and maintainers

### Export Options
- **PDF Export**: For documentation and presentations
- **Image Export**: For GitHub README and wikis
- **CSV Export**: For issue tracking and reporting

## Tips and Best Practices

### Visual Organization
- Use consistent color coding
- Group related elements with frames
- Maintain clear visual hierarchy
- Leave white space for annotations

### Collaboration Efficiency
- Use @mentions for specific feedback
- Set up notification preferences
- Create template comments for common issues
- Establish review timelines and deadlines

### Integration Benefits
- Connect to development workflows
- Link design decisions to implementation
- Track progress visually
- Facilitate remote team collaboration

## Troubleshooting

### Common Issues
- **Large file uploads**: Compress images if needed
- **Layout alignment**: Use MIRO's grid and alignment tools
- **Missing screenshots**: Check file paths and organization
- **Performance**: Consider breaking into multiple boards for large projects

### Support Resources
- MIRO Help Center: [help.miro.com](https://help.miro.com)
- Community Templates
- API Documentation
- Video Tutorials

---

📱 **Pro Tip**: Use MIRO mobile app for quick reviews and annotations on the go!

🔗 **Integration**: Connect with Slack, Jira, and GitHub for seamless workflow integration.`;

    await fs.writeFile('./miro-instructions.md', instructions);
  }

  private async generateMiroHTML(layout: MiroBoardLayout): Promise<void> {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MIRO Board Preview - Concierge Transaction Flow</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
        }
        .board-container { 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
            overflow: hidden;
            max-width: 1200px;
            margin: 0 auto;
        }
        .board-header { 
            background: linear-gradient(135deg, #3C3C3C, #D1C7BC); 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .board-title { 
            font-size: 2.5em; 
            font-weight: bold; 
            margin-bottom: 10px; 
        }
        .board-stats { 
            display: flex; 
            justify-content: center; 
            gap: 30px; 
            margin-top: 20px; 
        }
        .stat { 
            text-align: center; 
        }
        .stat-number { 
            font-size: 2em; 
            font-weight: bold; 
        }
        .stat-label { 
            font-size: 0.9em; 
            opacity: 0.9; 
        }
        .sections-overview { 
            padding: 30px; 
        }
        .section-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-top: 20px; 
        }
        .section-card { 
            border: 2px solid #e9ecef; 
            border-radius: 8px; 
            padding: 20px; 
            background: #f8f9fa; 
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .section-card:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 12px rgba(0,0,0,0.1); 
        }
        .section-title { 
            font-size: 1.2em; 
            font-weight: bold; 
            color: #3C3C3C; 
            margin-bottom: 10px; 
        }
        .section-details { 
            color: #6c757d; 
            margin-bottom: 15px; 
        }
        .device-badges { 
            display: flex; 
            gap: 8px; 
            flex-wrap: wrap; 
        }
        .device-badge { 
            padding: 4px 8px; 
            border-radius: 12px; 
            font-size: 0.8em; 
            font-weight: bold; 
        }
        .desktop-badge { background: #e3f2fd; color: #1976d2; }
        .mobile-badge { background: #f3e5f5; color: #7b1fa2; }
        .tablet-badge { background: #e8f5e8; color: #388e3c; }
        .miro-actions { 
            background: #f8f9fa; 
            padding: 30px; 
            text-align: center; 
            border-top: 1px solid #e9ecef; 
        }
        .action-button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #0066cc; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 0 10px; 
            font-weight: bold; 
            transition: background 0.2s;
        }
        .action-button:hover { background: #0052a3; }
        .action-button.secondary { background: #6c757d; }
        .action-button.secondary:hover { background: #545b62; }
        .instructions-link { 
            margin-top: 20px; 
            font-size: 0.9em; 
        }
    </style>
</head>
<body>
    <div class="board-container">
        <div class="board-header">
            <div class="board-title">🎨 MIRO Board Preview</div>
            <div>${layout.title}</div>
            <div class="board-stats">
                <div class="stat">
                    <div class="stat-number">${layout.sections.length}</div>
                    <div class="stat-label">Sections</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${layout.cards.filter(card => card.type === 'image').length}</div>
                    <div class="stat-label">Screenshots</div>
                </div>
                <div class="stat">
                    <div class="stat-number">${new Set(layout.cards.map(card => card.metadata.device)).size}</div>
                    <div class="stat-label">Device Types</div>
                </div>
            </div>
        </div>

        <div class="sections-overview">
            <h2>📁 Board Sections</h2>
            <div class="section-grid">
                ${layout.sections.map(section => {
                  const sectionCards = layout.cards.filter(card => 
                    section.cards.includes(card.id) && card.type === 'image'
                  );
                  const devices = [...new Set(sectionCards.map(card => card.metadata.device))];
                  
                  return `
                    <div class="section-card">
                        <div class="section-title">${section.name}</div>
                        <div class="section-details">
                            ${sectionCards.length} screenshots<br>
                            ${section.width}×${section.height}px area
                        </div>
                        <div class="device-badges">
                            ${devices.map(device => 
                              `<span class="device-badge ${device}-badge">${device}</span>`
                            ).join('')}
                        </div>
                    </div>
                  `;
                }).join('')}
            </div>
        </div>

        <div class="miro-actions">
            <h3>🚀 Ready to Create Your MIRO Board?</h3>
            <p>Use the generated data and instructions to build an interactive documentation board.</p>
            
            <a href="https://miro.com/app/dashboard/" target="_blank" class="action-button">
                Open MIRO
            </a>
            <a href="./miro-board-data.json" class="action-button secondary" download>
                Download Data
            </a>
            
            <div class="instructions-link">
                📖 <a href="./miro-instructions.md">Read Setup Instructions</a>
            </div>
        </div>
    </div>

    <script>
        console.log('🎨 MIRO Board Preview Loaded');
        console.log('📊 Board Stats:', {
            sections: ${layout.sections.length},
            screenshots: ${layout.cards.filter(card => card.type === 'image').length},
            total_cards: ${layout.cards.length}
        });
    </script>
</body>
</html>`;

    await fs.writeFile('./miro-preview.html', html);
  }
}

// Run the generator
if (require.main === module) {
  const generator = new MiroBoardGenerator();
  generator.generateMiroBoard().catch(console.error);
}

export { MiroBoardGenerator };