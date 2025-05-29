// D3.js Visualization Functions

let simulation = null;

// Enhanced D3.js Visualization with improved aesthetics
// Replace your initVisualization function with this enhanced version

function initVisualization() {
    clearVisualization();

    if (!window.currentMapData || !window.currentMapData.nodes) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Enhanced color scheme - more modern and vibrant
    const colorScale = d3.scaleOrdinal([
        '#667eea', '#764ba2', '#f093fb', '#f5576c', 
        '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
        '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3',
        '#ff9a9e', '#fecfef', '#ffeaa7', '#fab1a0'
    ]);
    
    const nodeTooltip = d3.select("#nodeTooltip");

    const svg = d3.select("svg")
        .attr("viewBox", [0, 0, width, height])
        .style("background", "radial-gradient(ellipse at center, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)");

    // Add filter definitions for glow effects
    const defs = svg.append("defs");
    
    // Glow filter for nodes
    const nodeGlow = defs.append("filter")
        .attr("id", "nodeGlow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    
    nodeGlow.append("feGaussianBlur")
        .attr("stdDeviation", "3")
        .attr("result", "coloredBlur");
    
    const nodeMerge = nodeGlow.append("feMerge");
    nodeMerge.append("feMergeNode").attr("in", "coloredBlur");
    nodeMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Glow filter for links
    const linkGlow = defs.append("filter")
        .attr("id", "linkGlow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");
    
    linkGlow.append("feGaussianBlur")
        .attr("stdDeviation", "2")
        .attr("result", "coloredBlur");
    
    const linkMerge = linkGlow.append("feMerge");
    linkMerge.append("feMergeNode").attr("in", "coloredBlur");
    linkMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Add gradient definitions for links
    const linkGradient = defs.append("linearGradient")
        .attr("id", "linkGradient")
        .attr("gradientUnits", "userSpaceOnUse");
    
    linkGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#667eea")
        .attr("stop-opacity", 0.8);
    
    linkGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#764ba2")
        .attr("stop-opacity", 0.4);

    const container = svg.append("g");

    // Enhanced zoom with smooth transitions
    const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", ({transform}) => {
            container.attr("transform", transform);
        });
    
    svg.call(zoom);

    // Enhanced simulation with better forces
    simulation = d3.forceSimulation(window.currentMapData.nodes)
        .force("link", d3.forceLink(window.currentMapData.links)
            .id(d => d.id)
            .distance(d => {
                // Dynamic link distance based on node types
                const sourceNode = window.currentMapData.nodes.find(n => n.id === d.source.id || n.id === d.source);
                const targetNode = window.currentMapData.nodes.find(n => n.id === d.target.id || n.id === d.target);
                
                if (sourceNode?.group === 'Hardware' && targetNode?.group === 'Hardware') {
                    return 150; // Hardware components closer together
                }
                return 120;
            })
            .strength(0.8))
        .force("charge", d3.forceManyBody()
            .strength(d => {
                // Stronger repulsion for nodes with more connections
                const connections = window.currentMapData.links.filter(l => 
                    l.source === d.id || l.target === d.id || 
                    l.source.id === d.id || l.target.id === d.id
                ).length;
                return -300 - (connections * 50);
            }))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => {
            // Dynamic collision radius based on node importance
            const connections = window.currentMapData.links.filter(l => 
                l.source === d.id || l.target === d.id ||
                l.source.id === d.id || l.target.id === d.id
            ).length;
            return 25 + (connections * 3);
        }));

    // Enhanced links with gradients and animations
    const link = container.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(window.currentMapData.links)
        .join("line")
        .attr("stroke", "url(#linkGradient)")
        .attr("stroke-width", d => {
            // Dynamic width based on connection importance
            const sourceNode = window.currentMapData.nodes.find(n => n.id === (d.source.id || d.source));
            const targetNode = window.currentMapData.nodes.find(n => n.id === (d.target.id || d.target));
            
            if (sourceNode?.group === 'Hardware' || targetNode?.group === 'Hardware') {
                return 3;
            }
            return 2;
        })
        .attr("stroke-opacity", 0.6)
        .attr("filter", "url(#linkGlow)")
        .style("cursor", "pointer")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke-opacity", 1)
                .attr("stroke-width", 4);
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("stroke-opacity", 0.6)
                .attr("stroke-width", d => {
                    const sourceNode = window.currentMapData.nodes.find(n => n.id === (d.source.id || d.source));
                    const targetNode = window.currentMapData.nodes.find(n => n.id === (d.target.id || d.target));
                    return (sourceNode?.group === 'Hardware' || targetNode?.group === 'Hardware') ? 3 : 2;
                });
        });

    // Enhanced nodes with dynamic sizing and better styling
    const node = container.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(window.currentMapData.nodes)
        .join("circle")
        .attr("r", d => {
            // Dynamic radius based on connections and importance
            const connections = window.currentMapData.links.filter(l => 
                l.source === d.id || l.target === d.id ||
                l.source.id === d.id || l.target.id === d.id
            ).length;
            
            // Base size + connection bonus + type bonus
            let radius = 12;
            radius += connections * 2;
            
            // Special nodes get bigger
            if (d.id === 'Internet' || d.id.includes('Proxmox')) radius += 6;
            if (d.group === 'Hardware') radius += 3;
            
            return Math.min(radius, 25); // Cap at 25px
        })
        .attr("fill", d => {
            // Enhanced color mapping
            const baseColor = colorScale(d.group);
            return `url(#nodeGradient-${d.group})` || baseColor;
        })
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 2)
        .attr("filter", "url(#nodeGlow)")
        .style("cursor", "pointer")
        .call(drag(simulation))
        .on("mouseover", function(event, d) {
            // Enhanced hover effect
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", function() {
                    const currentRadius = d3.select(this).attr("r");
                    return parseFloat(currentRadius) * 1.2;
                })
                .attr("stroke-width", 4);
            
            // Show enhanced tooltip near mouse cursor
            const tooltip = document.getElementById('nodeTooltip');
            tooltip.style.opacity = '1';
            tooltip.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 4px;">${d.id}</div>
                <div style="font-size: 11px; opacity: 0.8;">Type: ${d.group || 'Unknown'}</div>
                <div style="font-size: 11px; opacity: 0.8;">Connections: ${
                    window.currentMapData.links.filter(l => 
                        l.source === d.id || l.target === d.id ||
                        l.source.id === d.id || l.target.id === d.id
                    ).length
                }</div>
            `;
            
            // Calculate position relative to the mouse with proper offset
            const rect = svg.node().getBoundingClientRect();
            const x = event.clientX - rect.left + 10;
            const y = event.clientY - rect.top - 10;
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        })
        .on("mousemove", (event, d) => {
            // Update tooltip position to follow mouse
            const tooltip = document.getElementById('nodeTooltip');
            const rect = svg.node().getBoundingClientRect();
            const x = event.clientX - rect.left + 10;
            const y = event.clientY - rect.top - 10;
            
            tooltip.style.left = x + 'px';
            tooltip.style.top = y + 'px';
        })
        
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("r", function(d) {
                    const connections = window.currentMapData.links.filter(l => 
                        l.source === d.id || l.target === d.id ||
                        l.source.id === d.id || l.target.id === d.id
                    ).length;
                    let radius = 12 + connections * 2;
                    if (d.id === 'Internet' || d.id.includes('Proxmox')) radius += 6;
                    if (d.group === 'Hardware') radius += 3;
                    return Math.min(radius, 25);
                })
                .attr("stroke-width", 2);
            
            nodeTooltip.style("opacity", 0);
        })
        .on("click", (event, d) => {
            if (event.defaultPrevented) return;
            nodeTooltip.style("opacity", 0);
            openNodeModalWithConnections(d);
        });

    // Create gradients for each node type
    const nodeTypes = [...new Set(window.currentMapData.nodes.map(n => n.group))];
    nodeTypes.forEach(type => {
        const gradient = defs.append("radialGradient")
            .attr("id", `nodeGradient-${type}`)
            .attr("cx", "30%")
            .attr("cy", "30%");
        
        const baseColor = colorScale(type);
        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", d3.color(baseColor).brighter(0.8));
        
        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", baseColor);
    });

    // Enhanced labels with better positioning
    const label = container.append("g")
        .attr("class", "labels")
        .selectAll("text")
        .data(window.currentMapData.nodes)
        .join("text")
        .text(d => {
            // Truncate long names for better display
            if (d.id.length > 20) {
                return d.id.substring(0, 17) + "...";
            }
            return d.id;
        })
        .attr("x", 0)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .attr("fill", "#ffffff")
        .attr("font-size", d => {
            // Dynamic font size based on node importance
            const connections = window.currentMapData.links.filter(l => 
                l.source === d.id || l.target === d.id ||
                l.source.id === d.id || l.target.id === d.id
            ).length;
            return Math.max(10, Math.min(14, 10 + connections));
        })
        .attr("font-weight", "500")
        .attr("paint-order", "stroke fill")
        .attr("stroke", "#000000")
        .attr("stroke-width", "2px")
        .attr("stroke-linejoin", "round")
        .style("pointer-events", "none")
        .style("user-select", "none");

    // Enhanced simulation tick with smooth animations
    simulation.on("tick", () => {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label
            .attr("x", d => d.x)
            .attr("y", d => d.y + 35); // Position below the node
    });

    // Add floating particles for ambient effect (optional)
    const particles = container.append("g")
        .attr("class", "particles")
        .selectAll("circle")
        .data(d3.range(20))
        .join("circle")
        .attr("r", Math.random() * 2 + 1)
        .attr("fill", "#667eea")
        .attr("opacity", 0.3)
        .attr("cx", () => Math.random() * width)
        .attr("cy", () => Math.random() * height);

    // Animate particles
    function animateParticles() {
        particles
            .transition()
            .duration(20000)
            .ease(d3.easeLinear)
            .attr("cx", () => Math.random() * width)
            .attr("cy", () => Math.random() * height)
            .on("end", animateParticles);
    }
    animateParticles();
}

// Enhanced drag behavior
function drag(simulation) {
    let dragStarted = false;
    
    function dragstarted(event, d) {
        dragStarted = false;
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        
        // Visual feedback
        d3.select(this)
            .transition()
            .duration(100)
            .attr("stroke-width", 6)
            .attr("filter", "url(#nodeGlow)");
    }
    
    function dragged(event, d) {
        dragStarted = true;
        d.fx = event.x;
        d.fy = event.y;
        d3.select("#nodeTooltip").style("opacity", 0);
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        
        // Reset visual feedback
        d3.select(this)
            .transition()
            .duration(200)
            .attr("stroke-width", 2);
        
        if (dragStarted) {
            event.sourceEvent.preventDefault();
        }
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function clearVisualization() {
    d3.select("svg").selectAll("*").remove();
    // Also hide any tooltips
    d3.select("#nodeTooltip").style("opacity", 0);
}

function drag(simulation) {
    let dragStarted = false;
    
    function dragstarted(event, d) {
        dragStarted = false;
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(event, d) {
        dragStarted = true;
        d.fx = event.x;
        d.fy = event.y;
        
        // Hide tooltip while dragging
        d3.select("#nodeTooltip").style("opacity", 0);
    }
    
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
        
        // Prevent click event if we were dragging
        if (dragStarted) {
            event.sourceEvent.preventDefault();
        }
    }
    
    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

// Modal functionality
function openNodeModal(nodeData) {
    const modal = document.getElementById('nodeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    // Set modal title
    modalTitle.textContent = nodeData.id;
    
    // Build modal content
    let content = '';
    
    // Basic Information Section
    content += `
        <div class="modal-section">
            <div class="modal-section-title">Basic Information</div>
            <div class="modal-info-item">
                <span class="modal-info-label">Name:</span>
                <span class="modal-info-value">${nodeData.id}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Type:</span>
                <span class="modal-info-value">${nodeData.group || 'Not specified'}</span>
            </div>
        </div>
    `;
    
    // Connections Section
    const parentConnections = window.currentMapData.links
        .filter(link => link.target === nodeData.id)
        .map(link => {
            const parentNode = window.currentMapData.nodes.find(n => n.id === link.source);
            return {
                id: link.source,
                group: parentNode ? parentNode.group : 'Unknown'
            };
        });
    
    const childConnections = window.currentMapData.links
        .filter(link => link.source === nodeData.id)
        .map(link => {
            const childNode = window.currentMapData.nodes.find(n => n.id === link.target);
            return {
                id: link.target,
                group: childNode ? childNode.group : 'Unknown'
            };
        });
    
    // Total connections count
    const totalConnections = parentConnections.length + childConnections.length;
    
    content += `
        <div class="modal-section">
            <div class="modal-section-title">Network Overview</div>
            <div class="modal-info-item">
                <span class="modal-info-label">Total Connections:</span>
                <span class="modal-info-value">${totalConnections}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Parent Nodes:</span>
                <span class="modal-info-value">${parentConnections.length}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Child Nodes:</span>
                <span class="modal-info-value">${childConnections.length}</span>
            </div>
        </div>
    `;
    
    // Detailed Connections Section
    if (parentConnections.length > 0 || childConnections.length > 0) {
        content += `<div class="modal-section">`;
        content += `<div class="modal-section-title">Detailed Connections</div>`;
        
        if (parentConnections.length > 0) {
            content += `
                <div class="connection-group">
                    <div class="connection-group-title">
                        <span class="connection-arrow">⬆️</span>
                        Parent Nodes (${parentConnections.length})
                    </div>
                    <div class="connection-list">
                        ${parentConnections.map(parent => `
                            <div class="connection-item" onclick="openNodeModalById('${parent.id}')">
                                <span class="connection-name">${parent.id}</span>
                                <span class="connection-type">${parent.group}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (childConnections.length > 0) {
            content += `
                <div class="connection-group">
                    <div class="connection-group-title">
                        <span class="connection-arrow">⬇️</span>
                        Child Nodes (${childConnections.length})
                    </div>
                    <div class="connection-list">
                        ${childConnections.map(child => `
                            <div class="connection-item" onclick="openNodeModalById('${child.id}')">
                                <span class="connection-name">${child.id}</span>
                                <span class="connection-type">${child.group}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        content += `</div>`;
    } else {
        content += `
            <div class="modal-section">
                <div class="modal-section-title">Connections</div>
                <div style="color: #999; font-style: italic; text-align: center; padding: 20px;">
                    This node has no connections
                </div>
            </div>
        `;
    }
    
    // Custom Attributes Section
    if (nodeData.attributes && nodeData.attributes.length > 0) {
        content += `
            <div class="modal-section">
                <div class="modal-section-title">Custom Attributes</div>
                ${nodeData.attributes.map(attr => `
                    <div class="modal-attribute-item">
                        <div class="modal-attribute-name">${attr.name}</div>
                        <div class="modal-attribute-value">${attr.value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // If no custom attributes
    if (!nodeData.attributes || nodeData.attributes.length === 0) {
        content += `
            <div class="modal-section">
                <div class="modal-section-title">Custom Attributes</div>
                <div style="color: #999; font-style: italic; text-align: center; padding: 20px;">
                    No custom attributes defined
                </div>
            </div>
        `;
    }
    
    modalContent.innerHTML = content;
    
    // Show modal with animation
    modal.classList.add('show');
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

// Function to open modal by node ID (for navigation between connected nodes)
function openNodeModalById(nodeId) {
    const nodeData = window.currentMapData.nodes.find(n => n.id === nodeId);
    if (nodeData) {
        openNodeModal(nodeData);
    }
}

function closeNodeModal(event) {
    // Only close if clicking overlay or close button
    if (event && event.target !== event.currentTarget && !event.target.classList.contains('modal-close')) {
        return;
    }
    
    const modal = document.getElementById('nodeModal');
    modal.classList.remove('show');
    
    // Restore body scroll
    document.body.style.overflow = '';
}

// Add these functions to your visualization.js file or create a new file

// Enhanced modal functionality with API integration
async function openNodeModalWithConnections(nodeData) {
    const modal = document.getElementById('nodeModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    
    // Set modal title
    modalTitle.textContent = nodeData.id;
    
    // Show loading state
    modalContent.innerHTML = `
        <div style="text-align: center; padding: 40px;">
            <div style="font-size: 24px; margin-bottom: 16px;">⏳</div>
            <div>Loading node details...</div>
        </div>
    `;
    
    // Show modal immediately with loading state
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    
    try {
        // Fetch detailed connection data from API
        console.log(`🔍 Fetching connections for node: ${nodeData.id} from map: ${window.currentMapId}`);
        const url = `/api/maps/${window.currentMapId}/nodes/${encodeURIComponent(nodeData.id)}/connections`;
        console.log(`🔍 API URL: ${url}`);
        
        const response = await fetch(url);
        
        console.log(`🔍 Response status: ${response.status}`);
        console.log(`🔍 Response ok: ${response.ok}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ API Error Response:', errorText);
            throw new Error(`Failed to fetch node connections: ${response.status} ${response.statusText}`);
        }
        
        const connectionData = await response.json();
        console.log('✅ Connection data received:', connectionData);
        
        // Build enhanced modal content
        let content = buildEnhancedModalContent(nodeData, connectionData);
        modalContent.innerHTML = content;
        
    } catch (error) {
        console.error('Error fetching node connections:', error);
        
        // Fallback to original modal content if API fails
        let content = buildBasicModalContent(nodeData);
        modalContent.innerHTML = content;
        
        // Show error message
        showMessage('Failed to load detailed connection data', 'error');
    }
}

function buildEnhancedModalContent(nodeData, connectionData) {
    let content = '';
    
    // Basic Information Section
    content += `
        <div class="modal-section">
            <div class="modal-section-title">Basic Information</div>
            <div class="modal-info-item">
                <span class="modal-info-label">Name:</span>
                <span class="modal-info-value">${nodeData.id}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Type:</span>
                <span class="modal-info-value">${nodeData.group || 'Not specified'}</span>
            </div>
        </div>
    `;
    
    // Enhanced Network Overview Section
    content += `
        <div class="modal-section">
            <div class="modal-section-title">Network Overview</div>
            <div class="modal-info-item">
                <span class="modal-info-label">Total Connections:</span>
                <span class="modal-info-value">${connectionData.totalConnections}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Parent Nodes:</span>
                <span class="modal-info-value">${connectionData.parentCount}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Child Nodes:</span>
                <span class="modal-info-value">${connectionData.childCount}</span>
            </div>
        </div>
    `;
    
    // Enhanced Connections Section
    if (connectionData.totalConnections > 0) {
        content += `<div class="modal-section">`;
        content += `<div class="modal-section-title">Detailed Connections</div>`;
        
        if (connectionData.connections.parents.length > 0) {
            content += `
                <div class="connection-group">
                    <div class="connection-group-title">
                        <span class="connection-arrow">⬆️</span>
                        Parent Nodes (${connectionData.connections.parents.length})
                    </div>
                    <div class="connection-list">
                        ${connectionData.connections.parents.map(parent => `
                            <div class="connection-item" onclick="navigateToNode('${parent.id}')">
                                <div style="display: flex; flex-direction: column; flex: 1;">
                                    <span class="connection-name">${parent.name}</span>
                                    ${parent.attributes && parent.attributes.length > 0 ? 
                                        `<div style="font-size: 11px; color: #999; margin-top: 2px;">
                                            ${parent.attributes.length} attribute${parent.attributes.length > 1 ? 's' : ''}
                                        </div>` : ''
                                    }
                                </div>
                                <span class="connection-type">${parent.type}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (connectionData.connections.children.length > 0) {
            content += `
                <div class="connection-group">
                    <div class="connection-group-title">
                        <span class="connection-arrow">⬇️</span>
                        Child Nodes (${connectionData.connections.children.length})
                    </div>
                    <div class="connection-list">
                        ${connectionData.connections.children.map(child => `
                            <div class="connection-item" onclick="navigateToNode('${child.id}')">
                                <div style="display: flex; flex-direction: column; flex: 1;">
                                    <span class="connection-name">${child.name}</span>
                                    ${child.attributes && child.attributes.length > 0 ? 
                                        `<div style="font-size: 11px; color: #999; margin-top: 2px;">
                                            ${child.attributes.length} attribute${child.attributes.length > 1 ? 's' : ''}
                                        </div>` : ''
                                    }
                                </div>
                                <span class="connection-type">${child.type}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        content += `</div>`;
    } else {
        content += `
            <div class="modal-section">
                <div class="modal-section-title">Connections</div>
                <div style="color: #999; font-style: italic; text-align: center; padding: 20px;">
                    This node has no connections
                </div>
            </div>
        `;
    }
    
    // Custom Attributes Section
    if (nodeData.attributes && nodeData.attributes.length > 0) {
        content += `
            <div class="modal-section">
                <div class="modal-section-title">Custom Attributes</div>
                ${nodeData.attributes.map(attr => `
                    <div class="modal-attribute-item">
                        <div class="modal-attribute-name">${attr.name}</div>
                        <div class="modal-attribute-value">${attr.value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    } else {
        content += `
            <div class="modal-section">
                <div class="modal-section-title">Custom Attributes</div>
                <div style="color: #999; font-style: italic; text-align: center; padding: 20px;">
                    No custom attributes defined
                </div>
            </div>
        `;
    }
    
    // Add action buttons
    content += `
        <div class="modal-section">
            <div class="modal-section-title">Actions</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <button class="map-action-btn" onclick="editNodeFromModal('${nodeData.id}')">
                    ✏️ Edit Node
                </button>
                <button class="map-action-btn" onclick="exportNodeConnections('${nodeData.id}')">
                    📊 Export Connections
                </button>
                <button class="map-action-btn" onclick="refreshNodeModal('${nodeData.id}')">
                    🔄 Refresh
                </button>
            </div>
        </div>
    `;
    
    return content;
}

function buildBasicModalContent(nodeData) {
    // Fallback to original modal content structure
    let content = '';
    
    // Basic Information Section
    content += `
        <div class="modal-section">
            <div class="modal-section-title">Basic Information</div>
            <div class="modal-info-item">
                <span class="modal-info-label">Name:</span>
                <span class="modal-info-value">${nodeData.id}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Type:</span>
                <span class="modal-info-value">${nodeData.group || 'Not specified'}</span>
            </div>
        </div>
    `;
    
    // Basic connections from current map data
    const parentConnections = window.currentMapData.links
        .filter(link => link.target === nodeData.id)
        .map(link => {
            const parentNode = window.currentMapData.nodes.find(n => n.id === link.source);
            return {
                id: link.source,
                group: parentNode ? parentNode.group : 'Unknown'
            };
        });
    
    const childConnections = window.currentMapData.links
        .filter(link => link.source === nodeData.id)
        .map(link => {
            const childNode = window.currentMapData.nodes.find(n => n.id === link.target);
            return {
                id: link.target,
                group: childNode ? childNode.group : 'Unknown'
            };
        });
    
    // Network Overview
    content += `
        <div class="modal-section">
            <div class="modal-section-title">Network Overview</div>
            <div class="modal-info-item">
                <span class="modal-info-label">Total Connections:</span>
                <span class="modal-info-value">${parentConnections.length + childConnections.length}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Parent Nodes:</span>
                <span class="modal-info-value">${parentConnections.length}</span>
            </div>
            <div class="modal-info-item">
                <span class="modal-info-label">Child Nodes:</span>
                <span class="modal-info-value">${childConnections.length}</span>
            </div>
        </div>
    `;
    
    // Basic connections
    if (parentConnections.length > 0 || childConnections.length > 0) {
        content += `<div class="modal-section">`;
        content += `<div class="modal-section-title">Connections</div>`;
        
        if (parentConnections.length > 0) {
            content += `
                <div class="connection-group">
                    <div class="connection-group-title">
                        <span class="connection-arrow">⬆️</span>
                        Parent Nodes
                    </div>
                    <div class="connection-list">
                        ${parentConnections.map(parent => `
                            <div class="connection-item" onclick="navigateToNode('${parent.id}')">
                                <span class="connection-name">${parent.id}</span>
                                <span class="connection-type">${parent.group}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        if (childConnections.length > 0) {
            content += `
                <div class="connection-group">
                    <div class="connection-group-title">
                        <span class="connection-arrow">⬇️</span>
                        Child Nodes
                    </div>
                    <div class="connection-list">
                        ${childConnections.map(child => `
                            <div class="connection-item" onclick="navigateToNode('${child.id}')">
                                <span class="connection-name">${child.id}</span>
                                <span class="connection-type">${child.group}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        content += `</div>`;
    }
    
    return content;
}

// Navigation and action functions
function navigateToNode(nodeId) {
    const nodeData = window.currentMapData.nodes.find(n => n.id === nodeId);
    if (nodeData) {
        openNodeModalWithConnections(nodeData);
    }
}

function editNodeFromModal(nodeId) {
    closeNodeModal();
    
    // Switch to edit tool
    selectTool('edit');
    
    // Select the node in the dropdown
    const editNodeSelect = document.getElementById('editNodeSelect');
    editNodeSelect.value = nodeId;
    
    // Use setTimeout to ensure DOM is updated before populating form
    setTimeout(() => {
        populateEditNodeForm();
    }, 0);
    
    showMessage(`Editing node: ${nodeId}`);
}

async function exportNodeConnections(nodeId) {
    try {
        const response = await fetch(`/api/maps/${window.currentMapId}/nodes/${nodeId}/connections`);
        const connectionData = await response.json();
        
        const dataStr = JSON.stringify(connectionData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${nodeId}-connections.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        showMessage('Node connections exported successfully!');
    } catch (error) {
        console.error('Error exporting node connections:', error);
        showMessage('Failed to export node connections', 'error');
    }
}

function refreshNodeModal(nodeId) {
    const nodeData = window.currentMapData.nodes.find(n => n.id === nodeId);
    if (nodeData) {
        openNodeModalWithConnections(nodeData);
        showMessage('Node details refreshed');
    }
}

// Update the existing openNodeModal function to use the new enhanced version
window.openNodeModal = openNodeModalWithConnections;
window.navigateToNode = navigateToNode;
window.editNodeFromModal = editNodeFromModal;
window.exportNodeConnections = exportNodeConnections;
window.refreshNodeModal = refreshNodeModal;

// Global functions for HTML access
window.closeNodeModal = closeNodeModal;
window.openNodeModalById = openNodeModalById;