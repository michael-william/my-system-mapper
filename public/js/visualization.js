// D3.js Visualization Functions

let simulation = null;

function initVisualization() {
    clearVisualization();

    if (!window.currentMapData || !window.currentMapData.nodes) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const nodeTooltip = d3.select("#nodeTooltip");

    const svg = d3.select("svg")
        .attr("viewBox", [0, 0, width, height]);

    const LXC = svg.append("g");

    svg.call(d3.zoom().on("zoom", ({transform}) => {
        LXC.attr("transform", transform);
    }));

    simulation = d3.forceSimulation(window.currentMapData.nodes)
        .force("link", d3.forceLink(window.currentMapData.links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = LXC.append("g")
        .attr("stroke", "#aaa")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(window.currentMapData.links)
        .join("line")
        .attr("stroke-width", 1.5);

    const node = LXC.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(window.currentMapData.nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", d => colorScale(d.group))
        .style("cursor", "pointer")
        .call(drag(simulation))
        .on("mouseover", (event, d) => {
            // Simple tooltip showing only the node name
            nodeTooltip
                .style("opacity", 1)
                .text(d.id)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mousemove", (event, d) => {
            // Update tooltip position as mouse moves
            nodeTooltip
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
        })
        .on("mouseout", () => {
            // Hide tooltip
            nodeTooltip.style("opacity", 0);
        })
        .on("click", (event, d) => {
            // Prevent drag behavior on click
            if (event.defaultPrevented) return;
            
            // Hide tooltip when modal opens
            nodeTooltip.style("opacity", 0);
            
            // Check if Ctrl/Cmd key is held for debug mode
            if (event.ctrlKey || event.metaKey) {
                console.log('🔍 Debug mode - Node data:', d);
                console.log('🔍 All connections for this node:', 
                    window.currentMapData.links.filter(l => 
                        l.source === d.id || l.target === d.id
                    )
                );
            }
            
            // Open enhanced modal with API data
            openNodeModalWithConnections(d);
        })

    const label = LXC.append("g")
        .selectAll("text")
        .data(window.currentMapData.nodes)
        .join("text")
        .text(d => d.id)
        .attr("x", 12)
        .attr("y", "0.31em")
        .attr("fill", "#ccc")
        .style("font-size", "0.75rem")
        .style("pointer-events", "none"); // Prevent text from interfering with click events

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label.attr("x", d => d.x + 12)
            .attr("y", d => d.y);
    });
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
        const response = await fetch(`/api/maps/${window.currentMapId}/nodes/${nodeData.id}/connections`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch node connections');
        }
        
        const connectionData = await response.json();
        
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
    populateEditNodeForm();
    
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