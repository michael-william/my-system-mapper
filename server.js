const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const redis = require('redis');

// Create Express app
const app = express();
const PORT = 3000;

// Create Redis client
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
});

// Connect to Redis
async function connectRedis() {
    try {
        await redisClient.connect();
        console.log('📊 Connected to Redis');
        
        // Initialize with default map if no maps exist
        await initializeDefaultMap();
    } catch (error) {
        console.error('❌ Redis connection failed:', error);
        console.log('📝 Falling back to file storage');
    }
}

// Initialize default map
async function initializeDefaultMap() {
    try {
        const mapsExist = await redisClient.exists('maps:list');
        if (!mapsExist) {
            console.log('🔧 Creating default map...');
            
            const defaultMap = {
                id: 'default',
                name: 'My System Map',
                description: 'Default system map',
                nodes: [
                    { id: "Internet", group: "www" },
                    { id: "Arris TG2492LG-ZG (Modem+Router)", group: "Hardware" },
                    { id: "TP-Link Deco Mesh (AP-1)", group: "Hardware" },
                    { id: "Wifi AP-2", group: "Hardware" },
                    { id: "Wifi AP-3", group: "Hardware" },
                    { id: "MikroTik CSS610-8G-2S+in", group: "Hardware" },
                    { id: "Synology DS920+", group: "Hardware" },
                    { id: "Volume1", group: "Storage" },
                    { id: "UM790", group: "Hardware" },
                    { id: "Proxmox VE 8", group: "OS" },
                    { id: "Tailscale", group: "Networking" },
                    { id: "Ollama - Qwen 2.5 7B", group: "AI" },
                    { id: "LXC 101 - Jellyfin", group: "Media" },
                    { id: "LXC 102 - Postgres", group: "Storage" },
                    { id: "LXC 104 - NGINX Proxy Manager", group: "Networking" },
                    { id: "LXC 105 - n8n", group: "Automation" },
                    { id: "LXC 106 - Tdarr", group: "Media" },
                    { id: "VM 203 - Immich", group: "Media" },
                    { id: "Planned - Nextcloud", group: "Cloud" },
                    { id: "Planned - NoCoDB", group: "Storage" },
                    { id: "Planned - MinIO", group: "Storage" },
                    { id: "photos.dataandstories.com", group: "Public" },
                    { id: "monitoring.dataandstories.com", group: "Public" },
                    { id: "n8n.dataandstories.com", group: "Public" }
                ],
                links: [
                    { source: "Internet", target: "Arris TG2492LG-ZG (Modem+Router)" },
                    { source: "TP-Link Deco Mesh (AP-1)", target: "Wifi AP-2" },
                    { source: "TP-Link Deco Mesh (AP-1)", target: "Wifi AP-3" },
                    { source: "UM790", target: "Proxmox VE 8" },
                    { source: "Proxmox VE 8", target: "LXC 101 - Jellyfin" },
                    { source: "Proxmox VE 8", target: "LXC 104 - NGINX Proxy Manager" },
                    { source: "Proxmox VE 8", target: "LXC 106 - Tdarr" },
                    { source: "Proxmox VE 8", target: "VM 203 - Immich" },
                    { source: "Proxmox VE 8", target: "Planned - Nextcloud" },
                    { source: "Proxmox VE 8", target: "LXC 102 - Postgres" },
                    { source: "Proxmox VE 8", target: "Planned - NoCoDB" },
                    { source: "Proxmox VE 8", target: "Planned - MinIO" },
                    { source: "Proxmox VE 8", target: "Tailscale" },
                    { source: "Proxmox VE 8", target: "LXC 105 - n8n" },
                    { source: "Proxmox VE 8", target: "Ollama - Qwen 2.5 7B" },
                    { source: "Ollama - Qwen 2.5 7B", target: "LXC 105 - n8n" },
                    { source: "UM790", target: "MikroTik CSS610-8G-2S+in" },
                    { source: "Synology DS920+", target: "MikroTik CSS610-8G-2S+in" },
                    { source: "TP-Link Deco Mesh (AP-1)", target: "MikroTik CSS610-8G-2S+in" },
                    { source: "MikroTik CSS610-8G-2S+in", target: "Arris TG2492LG-ZG (Modem+Router)" },
                    { source: "Arris TG2492LG-ZG (Modem+Router)", target: "TP-Link Deco Mesh (AP-1)" },
                    { source: "Synology DS920+", target: "Volume1" },
                    { source: "LXC 101 - Jellyfin", target: "Volume1" },
                    { source: "VM 203 - Immich", target: "Volume1" },
                    { source: "LXC 106 - Tdarr", target: "Volume1" },
                    { source: "Planned - MinIO", target: "Volume1" },
                    { source: "LXC 104 - NGINX Proxy Manager", target: "photos.dataandstories.com" },
                    { source: "LXC 104 - NGINX Proxy Manager", target: "monitoring.dataandstories.com" },
                    { source: "LXC 104 - NGINX Proxy Manager", target: "n8n.dataandstories.com" }
                ],
                created: new Date().toISOString(),
                updated: new Date().toISOString()
            };

            // Save default map
            await redisClient.hSet('maps:list', 'default', JSON.stringify({
                id: 'default',
                name: defaultMap.name,
                description: defaultMap.description,
                nodeCount: defaultMap.nodes.length,
                updated: defaultMap.updated
            }));
            
            await redisClient.set('map:default', JSON.stringify(defaultMap));
            console.log('✅ Default map created in Redis');
        }
    } catch (error) {
        console.error('❌ Error initializing default map:', error);
    }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API Routes

// Get all maps (metadata only)
app.get('/api/maps', async (req, res) => {
    try {
        console.log('📡 GET /api/maps - Fetching all maps');
        
        const mapsData = await redisClient.hGetAll('maps:list');
        const maps = Object.values(mapsData).map(mapStr => JSON.parse(mapStr));
        
        console.log(`📊 Found ${maps.length} maps`);
        res.json(maps);
    } catch (error) {
        console.error('❌ Error fetching maps:', error);
        res.status(500).json({ error: 'Failed to fetch maps' });
    }
});

// Get specific map
app.get('/api/maps/:id', async (req, res) => {
    try {
        const mapId = req.params.id;
        console.log(`📡 GET /api/maps/${mapId} - Fetching specific map`);
        
        const mapData = await redisClient.get(`map:${mapId}`);
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }
        
        const map = JSON.parse(mapData);
        console.log(`📊 Map found: ${map.name} with ${map.nodes?.length || 0} nodes`);
        res.json(map);
    } catch (error) {
        console.error('❌ Error fetching map:', error);
        res.status(500).json({ error: 'Failed to fetch map' });
    }
});

// Create new map
app.post('/api/maps', async (req, res) => {
    try {
        console.log('📡 POST /api/maps - Creating new map');
        console.log('📝 Request body:', req.body);
        
        const mapId = 'map-' + Date.now();
        const newMap = {
            id: mapId,
            name: req.body.name || 'Untitled Map',
            description: req.body.description || '',
            nodes: req.body.nodes || [
                { id: 'Internet', group: 'External' }
            ],
            links: req.body.links || [],
            created: new Date().toISOString(),
            updated: new Date().toISOString()
        };
        
        // Save map metadata to hash
        await redisClient.hSet('maps:list', mapId, JSON.stringify({
            id: mapId,
            name: newMap.name,
            description: newMap.description,
            nodeCount: newMap.nodes.length,
            updated: newMap.updated
        }));
        
        // Save full map data
        await redisClient.set(`map:${mapId}`, JSON.stringify(newMap));
        
        console.log('✅ Map created:', mapId);
        res.status(201).json(newMap);
    } catch (error) {
        console.error('❌ Error creating map:', error);
        res.status(500).json({ error: 'Failed to create map' });
    }
});

// Delete map
app.delete('/api/maps/:id', async (req, res) => {
    try {
        const mapId = req.params.id;
        console.log(`📡 DELETE /api/maps/${mapId} - Deleting map`);
        
        // Check if map exists
        const mapData = await redisClient.get(`map:${mapId}`);
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }
        
        // Remove from maps list
        await redisClient.hDel('maps:list', mapId);
        
        // Remove full map data
        await redisClient.del(`map:${mapId}`);
        
        console.log('✅ Map deleted:', mapId);
        res.status(204).send();
    } catch (error) {
        console.error('❌ Error deleting map:', error);
        res.status(500).json({ error: 'Failed to delete map' });
    }
});

// Add this endpoint to your server.js file, RIGHT AFTER the existing node DELETE endpoint
// Find this section and add the new endpoint after it:

// Continue with your existing code below...

// Add node to map
app.post('/api/maps/:id/nodes', async (req, res) => {
    try {
        const mapId = req.params.id;
        console.log(`📡 POST /api/maps/${mapId}/nodes - Adding node`);
        console.log('📝 Node data:', req.body);
        
        const mapData = await redisClient.get(`map:${mapId}`);
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }
        
        const map = JSON.parse(mapData);
        
        const newNode = {
            id: req.body.id || `node-${Date.now()}`,
            group: req.body.group || 'Default',
            attributes: req.body.attributes || []
        };
        
        // Check if node already exists
        if (map.nodes.find(n => n.id === newNode.id)) {
            return res.status(400).json({ error: 'Node already exists' });
        }
        
        map.nodes.push(newNode);
        
        // Add links to parent nodes if specified
        if (req.body.parentNodes && req.body.parentNodes.length > 0) {
            req.body.parentNodes.forEach(parentId => {
                map.links.push({
                    source: parentId,
                    target: newNode.id
                });
            });
        }
        
        map.updated = new Date().toISOString();
        
        // Update Redis
        await redisClient.set(`map:${mapId}`, JSON.stringify(map));
        
        // Update metadata
        await redisClient.hSet('maps:list', mapId, JSON.stringify({
            id: mapId,
            name: map.name,
            description: map.description,
            nodeCount: map.nodes.length,
            updated: map.updated
        }));
        
        console.log('✅ Node added:', newNode.id);
        res.status(201).json(newNode);
    } catch (error) {
        console.error('❌ Error adding node:', error);
        res.status(500).json({ error: 'Failed to add node' });
    }
});

// Update node
app.put('/api/maps/:id/nodes/:nodeId', async (req, res) => {
    try {
        const mapId = req.params.id;
        const nodeId = req.params.nodeId;
        console.log(`📡 PUT /api/maps/${mapId}/nodes/${nodeId} - Updating node`);
        console.log('📝 Update data:', req.body);
        
        const mapData = await redisClient.get(`map:${mapId}`);
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }
        
        const map = JSON.parse(mapData);
        const nodeIndex = map.nodes.findIndex(n => n.id === nodeId);
        
        if (nodeIndex === -1) {
            return res.status(404).json({ error: 'Node not found' });
        }
        
        // Update node with new data
        const updatedNode = {
            ...map.nodes[nodeIndex],
            ...req.body
        };
        
        // Remove parentNodes from the node object as it shouldn't be stored there
        delete updatedNode.parentNodes;
        
        map.nodes[nodeIndex] = updatedNode;

        // Handle parent node changes if parentNodes is provided
        if (req.body.parentNodes !== undefined) {
            console.log('🔗 Updating parent relationships for:', nodeId);
            console.log('🔗 New parents:', req.body.parentNodes);
            
            // Remove ALL existing links where this node is the target
            const oldLinksCount = map.links.length;
            map.links = map.links.filter(link => link.target !== nodeId);
            console.log(`🗑️ Removed ${oldLinksCount - map.links.length} old parent links`);
            
            // Add new parent links
            let newLinksAdded = 0;
            req.body.parentNodes.forEach(parentId => {
                if (parentId && parentId.trim()) {
                    // Check if parent node exists
                    const parentExists = map.nodes.find(n => n.id === parentId);
                    if (parentExists) {
                        map.links.push({
                            source: parentId,
                            target: nodeId
                        });
                        newLinksAdded++;
                        console.log(`➕ Added link: ${parentId} -> ${nodeId}`);
                    } else {
                        console.log(`⚠️ Parent node "${parentId}" not found, skipping link`);
                    }
                }
            });
            console.log(`✅ Added ${newLinksAdded} new parent links`);
        }
        
        map.updated = new Date().toISOString();
        
        // Update Redis
        await redisClient.set(`map:${mapId}`, JSON.stringify(map));
        
        // Update metadata
        await redisClient.hSet('maps:list', mapId, JSON.stringify({
            id: mapId,
            name: map.name,
            description: map.description,
            nodeCount: map.nodes.length,
            updated: map.updated
        }));
        
        console.log('✅ Node updated successfully:', nodeId);
        console.log('📊 Final link count:', map.links.length);
        res.json(map.nodes[nodeIndex]);
    } catch (error) {
        console.error('❌ Error updating node:', error);
        res.status(500).json({ error: 'Failed to update node' });
    }
});

// Delete node
app.delete('/api/maps/:id/nodes/:nodeId', async (req, res) => {
    try {
        const mapId = req.params.id;
        const nodeId = req.params.nodeId;
        console.log(`📡 DELETE /api/maps/${mapId}/nodes/${nodeId} - Deleting node`);
        
        const mapData = await redisClient.get(`map:${mapId}`);
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }
        
        const map = JSON.parse(mapData);
        
        // Remove node
        map.nodes = map.nodes.filter(n => n.id !== nodeId);
        
        // Remove associated links
        map.links = map.links.filter(l => 
            l.source !== nodeId && l.target !== nodeId
        );
        
        map.updated = new Date().toISOString();
        
        // Update Redis
        await redisClient.set(`map:${mapId}`, JSON.stringify(map));
        
        // Update metadata
        await redisClient.hSet('maps:list', mapId, JSON.stringify({
            id: mapId,
            name: map.name,
            description: map.description,
            nodeCount: map.nodes.length,
            updated: map.updated
        }));
        
        console.log('✅ Node deleted:', nodeId);
        res.status(204).send();
    } catch (error) {
        console.error('❌ Error deleting node:', error);
        res.status(500).json({ error: 'Failed to delete node' });
    }
});

// Remove connection between nodes
app.delete('/api/maps/:id/connections', async (req, res) => {
    try {
        const mapId = req.params.id;
        const { source, target } = req.body;
        
        console.log(`📡 DELETE /api/maps/${mapId}/connections - Removing connection`);
        console.log('📝 Connection to remove:', { source, target });
        
        if (!source || !target) {
            return res.status(400).json({ error: 'Source and target are required' });
        }
        
        const mapData = await redisClient.get(`map:${mapId}`);
        if (!mapData) {
            return res.status(404).json({ error: 'Map not found' });
        }
        
        const map = JSON.parse(mapData);
        const originalLinkCount = map.links.length;
        
        // Remove the specific link
        map.links = map.links.filter(link => 
            !(link.source === source && link.target === target)
        );
        
        const removedCount = originalLinkCount - map.links.length;
        
        if (removedCount === 0) {
            return res.status(404).json({ error: 'Connection not found' });
        }
        
        map.updated = new Date().toISOString();
        
        // Update Redis
        await redisClient.set(`map:${mapId}`, JSON.stringify(map));
        
        // Update metadata
        await redisClient.hSet('maps:list', mapId, JSON.stringify({
            id: mapId,
            name: map.name,
            description: map.description,
            nodeCount: map.nodes.length,
            updated: map.updated
        }));
        
        console.log(`✅ Connection removed: ${source} -> ${target}`);
        console.log(`📊 Links remaining: ${map.links.length}`);
        
        res.json({ 
            message: 'Connection removed successfully',
            removedConnection: { source, target },
            remainingLinks: map.links.length
        });
    } catch (error) {
        console.error('❌ Error removing connection:', error);
        res.status(500).json({ error: 'Failed to remove connection' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.message);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404s
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Start server
async function startServer() {
    await connectRedis();
    
    app.listen(PORT, () => {
        console.log(`🗺️  System Mapper running on http://localhost:${PORT}`);
        console.log(`📁 Open your browser and go to: http://localhost:${PORT}`);
        console.log('🔧 Press Ctrl+C to stop the server');
    });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await redisClient.quit();
    process.exit(0);
});

module.exports = app;