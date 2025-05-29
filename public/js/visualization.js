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
            
            // Open modal with node details
            openNodeModal(d);
        });

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

// Global functions for HTML access
window.closeNodeModal = closeNodeModal;
window.openNodeModalById = openNodeModalById;