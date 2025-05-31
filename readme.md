# 🗺️ System Mapper

**System Mapper** is a powerful, interactive web application for visualizing and managing complex system architectures. Built with D3.js and featuring a modern dark UI, it provides an intuitive interface to create, modify, and share visual system diagrams with real-time collaboration features.

## ✨ Key Features

### 🎨 **Interactive Visualization**
- **Dynamic D3.js rendering** with smooth animations and physics-based layouts
- **Zoom and pan** controls for exploring large system maps
- **Drag-and-drop** node positioning with collision detection
- **Real-time updates** with live connection management

### 🔧 **Advanced Node Management**
- **Rich node types** (API, Database, Hardware, Services, etc.)
- **Custom attributes** with multi-line text support
- **Parent-child relationships** with visual connection mapping
- **Bulk operations** for efficient map building

### 💾 **Data Persistence & Sharing**
- **Redis backend** for reliable data storage
- **Multiple map management** with easy switching
- **JSON export/import** for backup and migration
- **Shareable URLs** and embeddable visualizations
- **Real-time collaboration** ready architecture

### 🎯 **Modern UI/UX**
- **Dark theme** with glassmorphism effects
- **Responsive design** that works on all screen sizes
- **Keyboard shortcuts** for power users
- **Context-sensitive tooltips** and detailed node modals
- **Collapsible sidebar** for focused viewing

---

## 🖼️ Screenshots

![System Mapper Interface](docs/screenshot-main.png)
*Main interface showing system architecture visualization*

![Node Details Modal](docs/screenshot-modal.png)
*Detailed node information with connection mapping*

![Export and Sharing](docs/screenshot-export.png)
*Export options and embeddable visualization*

---

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/michael-william/system-mapper.git
cd system-mapper

# Start with Docker Compose
docker-compose up -d

# Open your browser
open http://localhost:3000
```

### Option 2: Local Development

**Prerequisites:**
- [Node.js](https://nodejs.org/) v16 or later
- [Redis](https://redis.io/) server running on localhost:6379

```bash
# Clone and install
git clone https://github.com/michael-william/system-mapper.git
cd system-mapper
npm install

# Start Redis (macOS with Homebrew)
brew services start redis

# Or start Redis with Docker
docker run -d -p 6379:6379 redis:alpine

# Start the application
npm start

# Open your browser
open http://localhost:3000
```

---

## 📁 Project Architecture

```
system-mapper/
├── 📁 public/                 # Frontend assets
│   ├── 📄 index.html         # Main application entry point
│   ├── 🎨 custom.css         # Modern dark theme styles
│   └── 📁 js/                # Client-side application logic
│       ├── 📄 main.js        # Application initialization & coordination
│       ├── 📄 api.js         # API communication & data management
│       ├── 📄 ui.js          # UI interactions & form handling
│       └── 📄 visualization.js # D3.js visualization engine
├── 📄 server.js              # Express.js API server with Redis
├── 📄 package.json           # Dependencies and scripts
├── 📄 docker-compose.yml     # Complete deployment stack
├── 📄 Dockerfile            # Application container
└── 📁 docs/                 # Documentation and screenshots
```

---

## 🎛️ Usage Guide

### Creating Your First Map

1. **Start with nodes**: Click "Add Node" and create your system components
2. **Define relationships**: Set parent nodes to create connections
3. **Add details**: Use custom attributes for documentation
4. **Visualize**: Watch your system come to life with automatic layout

### Advanced Features

**🔗 Connection Management**
- Click any node to see detailed connection information
- Navigate between connected nodes in the modal view
- Bulk edit relationships through the parent node selector

**📊 Export Options**
- **JSON Export**: Full system data for backup/sharing
- **Shareable URLs**: Direct links to specific maps
- **Embed Code**: Integration into documentation or wikis

**⚙️ Customization**
- **Node Types**: Predefined categories (API, Database, Hardware, etc.)
- **Custom Attributes**: Add any metadata to nodes
- **Visual Themes**: Built-in dark theme with glassmorphism

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save current map |
| `Ctrl/Cmd + N` | Create new map |
| `Ctrl/Cmd + E` | Export map |
| `Escape` | Close panels/modals |

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file for custom configuration:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password

# Application Settings
DEFAULT_MAP_NAME="My System Map"
MAX_FILE_SIZE=10485760
ENABLE_ANALYTICS=false
```

### Redis Setup

The application requires Redis for data persistence. Configure connection in `server.js`:

```javascript
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
});
```

---

## 🚀 Deployment Options

### Production Deployment

#### Docker Hub
```bash
docker pull michaelwilliam/system-mapper:latest
docker run -d -p 3000:3000 --name system-mapper michaelwilliam/system-mapper
```

#### Manual Deployment
```bash
# Build for production
npm run build

# Start with PM2 (recommended)
npm install -g pm2
pm2 start server.js --name "system-mapper"
```

### Cloud Platforms

<details>
<summary>🌩️ Deploy to Heroku</summary>

```bash
# Install Heroku CLI and login
heroku create your-system-mapper
heroku addons:create heroku-redis:hobby-dev
git push heroku main
```
</details>

<details>
<summary>🐳 Deploy to DigitalOcean App Platform</summary>

1. Fork this repository
2. Connect to DigitalOcean App Platform
3. Add Redis managed database
4. Deploy automatically
</details>

---

## 🛠️ Development

### Local Development Setup

```bash
# Install dependencies
npm install

# Start in development mode with nodemon
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

### API Documentation

The application exposes a REST API for programmatic access:

<details>
<summary>📚 View API Endpoints</summary>

#### Maps
- `GET /api/maps` - List all maps
- `POST /api/maps` - Create new map
- `GET /api/maps/:id` - Get specific map
- `PUT /api/maps/:id` - Update map metadata
- `DELETE /api/maps/:id` - Delete map

#### Nodes
- `POST /api/maps/:id/nodes` - Add node to map
- `PUT /api/maps/:id/nodes/:nodeId` - Update node
- `DELETE /api/maps/:id/nodes/:nodeId` - Delete node
- `GET /api/maps/:id/nodes/:nodeId/connections` - Get node connections

#### Connections
- `GET /api/maps/:id/connections` - Get all connections
- `DELETE /api/maps/:id/connections` - Remove connection
</details>

### Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 🔍 Troubleshooting

### Common Issues

**Redis Connection Failed**
```bash
# Check if Redis is running
redis-cli ping
# Should return "PONG"

# Start Redis
# macOS: brew services start redis
# Ubuntu: sudo systemctl start redis
# Docker: docker run -d -p 6379:6379 redis:alpine
```

**Port Already in Use**
```bash
# Find and kill process using port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm start
```

**Node Modules Issues**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Performance Optimization

For large maps (100+ nodes):
- Enable Redis persistence: `redis-server --appendonly yes`
- Increase Node.js memory: `node --max-old-space-size=4096 server.js`
- Use production build: `NODE_ENV=production npm start`

---

## 📋 Roadmap

### 🚧 Upcoming Features
- [ ] **Real-time collaboration** with WebSocket support
- [ ] **Version control** for map changes
- [ ] **Templates** for common architectures
- [ ] **Import from** popular tools (Lucidchart, Draw.io)
- [ ] **Advanced filtering** and search
- [ ] **Performance analytics** for large maps

### 🔮 Future Enhancements
- [ ] **Mobile app** for iOS/Android
- [ ] **AI-powered** architecture suggestions
- [ ] **Integration** with cloud providers (AWS, Azure, GCP)
- [ ] **Compliance mapping** for security frameworks

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgments

- **D3.js** for powerful visualization capabilities
- **Redis** for reliable data persistence
- **Express.js** for robust API framework
- **Open source community** for inspiration and contributions

---

## 📞 Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/michael-william/system-mapper/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/michael-william/system-mapper/discussions)
- 📧 **Email**: michael@example.com

---

<div align="center">

**Made with ❤️ by [Michael William](https://github.com/michael-william)**

[⭐ Star this repo](https://github.com/michael-william/system-mapper) if you find it useful!

</div>