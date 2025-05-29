// UI Functions and Form Handling

function showMessage(message, type = 'success') {
    const messageEl = document.getElementById('statusMessage');
    messageEl.textContent = message;
    messageEl.className = `status-message ${type} show`;
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

// Tool Functions
function selectTool(tool, event = null) {
    // Remove active state from all items
    document.querySelectorAll('.tool-item').forEach(i => {
        i.style.background = '';
        i.style.borderColor = '';
    });

    const nodeConfig = document.getElementById('nodeConfig');
    const editNodeConfig = document.getElementById('editNodeConfig');

    // Toggle panels based on tool
    if (tool === 'node') {
        if (nodeConfig.classList.contains('active')) {
            nodeConfig.classList.remove('active');
            return;
        }
        nodeConfig.classList.add('active');
        editNodeConfig.classList.remove('active');
        updateParentNodeOptions();
    } else if (tool === 'edit') {
        if (editNodeConfig.classList.contains('active')) {
            editNodeConfig.classList.remove('active');
            return;
        }
        editNodeConfig.classList.add('active');
        nodeConfig.classList.remove('active');
        updateEditNodeOptions();
    }
    
    // Highlight the clicked tool if event is available
    if (event && event.target) {
        const toolItem = event.target.closest('.tool-item');
        if (toolItem) {
            toolItem.style.background = document.body.classList.contains('dark') ? '#333' : '#e3f2fd';
            toolItem.style.borderColor = '#667eea';
        }
    } else {
        // If no event, find and highlight the correct tool item by tool name
        const toolItems = document.querySelectorAll('.tool-item');
        toolItems.forEach(item => {
            const toolText = item.querySelector('.tool-text');
            if (toolText && 
                ((tool === 'edit' && toolText.textContent.includes('Edit')) ||
                 (tool === 'node' && toolText.textContent.includes('Add')))) {
                item.style.background = document.body.classList.contains('dark') ? '#333' : '#e3f2fd';
                item.style.borderColor = '#667eea';
            }
        });
    }
}

function updateParentNodeOptions() {
    const parentNodeSelects = document.querySelectorAll('.parent-node-select');
    parentNodeSelects.forEach(select => {
        select.innerHTML = '<option value="">Select parent node</option>';
        if (window.currentMapData && window.currentMapData.nodes) {
            window.currentMapData.nodes.forEach(node => {
                const option = document.createElement('option');
                option.value = node.id;
                option.textContent = node.id;
                select.appendChild(option);
            });
        }
    });
}

function updateEditNodeOptions() {
    const editNodeSelect = document.getElementById('editNodeSelect');
    if (editNodeSelect) {
        editNodeSelect.innerHTML = '<option value="">Select node</option>';
        if (window.currentMapData && window.currentMapData.nodes) {
            window.currentMapData.nodes.forEach(node => {
                const option = document.createElement('option');
                option.value = node.id;
                option.textContent = node.id;
                editNodeSelect.appendChild(option);
            });
        }
    }
}

// Edit Form Functions
async function populateEditNodeForm() {
    const editNodeSelect = document.getElementById('editNodeSelect');
    const editNodeForm = document.getElementById('editNodeForm');
    const selectedId = editNodeSelect.value;
    
    console.log('🔍 populateEditNodeForm called with selectedId:', selectedId);
    
    if (!selectedId) {
        editNodeForm.style.display = 'none';
        return;
    }

    // Show the edit form
    editNodeForm.style.display = 'block';

    // Find the selected node
    const node = window.currentMapData.nodes.find(n => n.id === selectedId);
    if (!node) return;

    // Populate basic fields
    document.getElementById('editNodeName').value = node.id;
    document.getElementById('editNodeType').value = node.group || '';

    // Clear and populate parent nodes
    const editParentContainer = document.getElementById('editParentNodeContainer');
    editParentContainer.innerHTML = '';

    // Find current parent nodes
    const currentParents = window.currentMapData.links
        .filter(link => (link.target.id || link.target) === selectedId)
        .map(link => link.source.id || link.source);
    
    console.log('🔍 Current parents found:', currentParents);
    console.log('🔍 All links for debugging:', window.currentMapData.links);
    console.log('🔍 Links pointing to selectedId:', window.currentMapData.links.filter(link => link.target === selectedId));
    console.log('🔍 Checking link targets vs selectedId:');
    window.currentMapData.links.forEach((link, i) => {
        const sourceId = link.source.id || link.source;
        const targetId = link.target.id || link.target;
        console.log(`🔍 Link ${i}: source="${sourceId}", target="${targetId}", target===selectedId: ${targetId === selectedId}`);
    });

    // Create parent node selects (at least one)
    if (currentParents.length === 0) {
        console.log('🔍 No parents found, creating empty select');
        addEditParentNodeSelect();
    } else {
        console.log('🔍 Creating parent selects for:', currentParents);
        currentParents.forEach((parentId, index) => {
            console.log(`🔍 Creating parent select ${index + 1} for parentId:`, parentId);
            addEditParentNodeSelect(parentId);
        });
    }

    // Clear and populate custom attributes
    const editAttributesList = document.getElementById('editAttributesList');
    editAttributesList.innerHTML = '';
    
    (node.attributes || []).forEach(attr => {
        addEditAttribute(attr.name, attr.value);
    });
}

function addEditParentNodeSelect(selectedParentId = '') {
    console.log('🔍 addEditParentNodeSelect called with selectedParentId:', selectedParentId);
    const container = document.getElementById('editParentNodeContainer');
    
    const rowDiv = document.createElement('div');
    rowDiv.className = 'parent-node-select-row';

    const select = document.createElement('select');
    select.className = 'config-select edit-parent-node-select';
    select.innerHTML = '<option value="">Select parent node</option>';
    
    if (window.currentMapData && window.currentMapData.nodes) {
        // Don't include the currently edited node as a parent option
        const editNodeSelect = document.getElementById('editNodeSelect');
        const currentEditId = editNodeSelect.value;
        console.log('🔍 currentEditId:', currentEditId);
        console.log('🔍 Available nodes:', window.currentMapData.nodes.map(n => n.id));
        
        let optionFound = false;
        window.currentMapData.nodes.forEach(node => {
            if (node.id !== currentEditId) {
                const option = document.createElement('option');
                option.value = node.id;
                option.textContent = node.id;
                if (node.id === selectedParentId) {
                    option.selected = true;
                    optionFound = true;
                    console.log('🔍 ✅ Pre-selected option:', node.id);
                }
                select.appendChild(option);
            }
        });
        
        console.log('🔍 selectedParentId found in options:', optionFound);
        console.log('🔍 Final select value after setup:', select.value);
    }

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-parent-btn';
    removeBtn.textContent = '−';
    removeBtn.onclick = function() {
        rowDiv.remove();
        updateEditRemoveParentButtons();
    };

    rowDiv.appendChild(select);
    rowDiv.appendChild(removeBtn);
    container.appendChild(rowDiv);
    
    updateEditRemoveParentButtons();
}

function updateEditRemoveParentButtons() {
    const container = document.getElementById('editParentNodeContainer');
    const rows = container.querySelectorAll('.parent-node-select-row');
    rows.forEach((row, idx) => {
        const btn = row.querySelector('.remove-parent-btn');
        if (btn) btn.style.display = idx === 0 ? 'none' : '';
    });
}

// Attribute Management Functions
function addAttribute() {
    const attributesList = document.getElementById('attributesList');

    const attributeDiv = document.createElement('div');
    attributeDiv.className = 'attribute-item';

    const nameRow = document.createElement('div');
    nameRow.className = 'attribute-name-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'attribute-name-input';
    nameInput.placeholder = 'Attribute name';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-attribute-btn';
    removeBtn.textContent = '−';
    removeBtn.onclick = function() {
        attributeDiv.remove();
    };

    nameRow.appendChild(nameInput);
    nameRow.appendChild(removeBtn);

    const valueInput = document.createElement('textarea');
    valueInput.className = 'attribute-value-input';
    valueInput.placeholder = 'Enter attribute value (can be multiple lines)';

    attributeDiv.appendChild(nameRow);
    attributeDiv.appendChild(valueInput);

    attributesList.appendChild(attributeDiv);
}

function addEditAttribute(name = '', value = '') {
    const editAttributesList = document.getElementById('editAttributesList');

    const attributeDiv = document.createElement('div');
    attributeDiv.className = 'attribute-item';

    const nameRow = document.createElement('div');
    nameRow.className = 'attribute-name-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'attribute-name-input';
    nameInput.placeholder = 'Attribute name';
    nameInput.value = name;

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-attribute-btn';
    removeBtn.textContent = '−';
    removeBtn.onclick = function() {
        attributeDiv.remove();
    };

    nameRow.appendChild(nameInput);
    nameRow.appendChild(removeBtn);

    const valueInput = document.createElement('textarea');
    valueInput.className = 'attribute-value-input';
    valueInput.placeholder = 'Enter attribute value';
    valueInput.value = value;

    attributeDiv.appendChild(nameRow);
    attributeDiv.appendChild(valueInput);

    editAttributesList.appendChild(attributeDiv);
}

function addParentNodeSelect() {
    const container = document.getElementById('parentNodeContainer');
    const selects = container.querySelectorAll('.parent-node-select');
    const newSelect = selects[0].cloneNode(true);
    newSelect.selectedIndex = 0;

    const rowDiv = document.createElement('div');
    rowDiv.className = 'parent-node-select-row';
    rowDiv.appendChild(newSelect);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'remove-parent-btn';
    removeBtn.textContent = '−';
    removeBtn.onclick = function() {
        rowDiv.remove();
        updateRemoveParentButtons();
    };
    rowDiv.appendChild(removeBtn);

    container.appendChild(rowDiv);
    updateRemoveParentButtons();
}

function updateRemoveParentButtons() {
    const container = document.getElementById('parentNodeContainer');
    const rows = container.querySelectorAll('.parent-node-select-row');
    rows.forEach((row, idx) => {
        const btn = row.querySelector('.remove-parent-btn');
        if (btn) btn.style.display = idx === 0 ? 'none' : '';
    });
}

// Theme and UI Controls
function toggleTheme() {
    document.body.classList.toggle('dark');
    const btn = document.querySelector('.theme-toggle');
    btn.innerHTML = document.body.classList.contains('dark') ? '☀️' : '🌙';
}

function togglePanel() {
    const panel = document.getElementById('sidePanel');
    const collapseBtn = panel.querySelector('.collapse-btn');
    
    panel.classList.toggle('collapsed');
    collapseBtn.innerHTML = panel.classList.contains('collapsed') ? '‹' : '‹';
}

// Export and Share Functions
function exportMap() {
    if (!window.currentMapData) {
        showMessage('No map selected', 'error');
        return;
    }

    const dataStr = JSON.stringify(window.currentMapData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${window.currentMapData.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showMessage('Map exported successfully!');
}

// Enhanced Share Function with Embed Option
// Replace your existing shareMap() function in ui.js with this:

function shareMap() {
    if (!window.currentMapData || !window.currentMapId) {
        showMessage('No map selected to share', 'error');
        return;
    }

    // Create a modal for share options
    const shareModal = createShareModal();
    document.body.appendChild(shareModal);
    
    // Show the modal
    setTimeout(() => shareModal.classList.add('show'), 10);
}

function createShareModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'shareModal';
    
    const currentUrl = window.location.href;
    const mapUrl = `${window.location.origin}${window.location.pathname}?map=${window.currentMapId}`;
    const embedCode = generateEmbedCode(mapUrl);
    
    modal.innerHTML = `
        <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header">
                <h3 class="modal-title">Share Map</h3>
                <button class="modal-close" onclick="closeShareModal()">&times;</button>
            </div>
            <div class="modal-content">
                <div class="modal-section">
                    <div class="modal-section-title">Direct Link</div>
                    <div class="share-option">
                        <label class="share-label">Map URL:</label>
                        <div class="share-input-group">
                            <input type="text" class="share-input" id="mapUrl" value="${mapUrl}" readonly>
                            <button class="share-copy-btn" onclick="copyToClipboard('mapUrl', 'Map URL copied!')">
                                📋 Copy
                            </button>
                        </div>
                        <div class="share-description">
                            Share this link to let others view your map directly
                        </div>
                    </div>
                </div>
                
                <div class="modal-section">
                    <div class="modal-section-title">Embed Code</div>
                    <div class="share-option">
                        <label class="share-label">HTML Embed:</label>
                        <div class="share-input-group">
                            <textarea class="share-textarea" id="embedCode" readonly>${embedCode}</textarea>
                            <button class="share-copy-btn" onclick="copyToClipboard('embedCode', 'Embed code copied!')">
                                📋 Copy
                            </button>
                        </div>
                        <div class="share-description">
                            Embed this map in your website or documentation
                        </div>
                    </div>
                </div>
                
                <div class="modal-section">
                    <div class="modal-section-title">Embed Options</div>
                    <div class="embed-options">
                        <div class="embed-option-group">
                            <label class="embed-label">
                                <input type="checkbox" id="embedReadonly" checked onchange="updateEmbedCode()">
                                Read-only mode
                            </label>
                        </div>
                        <div class="embed-option-group">
                            <label class="embed-label">
                                <input type="checkbox" id="embedHideTools" onchange="updateEmbedCode()">
                                Hide side panel
                            </label>
                        </div>
                        <div class="embed-option-group">
                            <label class="embed-label">
                                Width: <input type="text" class="embed-size-input" id="embedWidth" value="800" onchange="updateEmbedCode()">px
                            </label>
                        </div>
                        <div class="embed-option-group">
                            <label class="embed-label">
                                Height: <input type="text" class="embed-size-input" id="embedHeight" value="600" onchange="updateEmbedCode()">px
                            </label>
                        </div>
                    </div>
                </div>
                
                <div class="modal-section">
                    <div class="modal-section-title">Preview</div>
                    <div class="embed-preview">
                        <iframe id="embedPreview" src="${mapUrl}" width="400" height="300" frameborder="0"></iframe>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Close modal when clicking overlay
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeShareModal();
        }
    };
    
    return modal;
}

function generateEmbedCode(mapUrl) {
    const readonly = document.getElementById('embedReadonly')?.checked ?? true;
    const hideTools = document.getElementById('embedHideTools')?.checked ?? false;
    const width = document.getElementById('embedWidth')?.value ?? '800';
    const height = document.getElementById('embedHeight')?.value ?? '600';
    
    let embedUrl = mapUrl;
    const params = [];
    
    if (readonly) params.push('readonly=true');
    if (hideTools) params.push('hidetools=true');
    
    if (params.length > 0) {
        embedUrl += (mapUrl.includes('?') ? '&' : '?') + params.join('&');
    }
    
    return `<iframe src="${embedUrl}" width="${width}" height="${height}" frameborder="0" style="border: 1px solid #ccc; border-radius: 8px;"></iframe>`;
}

function updateEmbedCode() {
    const mapUrl = `${window.location.origin}${window.location.pathname}?map=${window.currentMapId}`;
    const newEmbedCode = generateEmbedCode(mapUrl);
    
    const embedCodeElement = document.getElementById('embedCode');
    const previewElement = document.getElementById('embedPreview');
    
    if (embedCodeElement) {
        embedCodeElement.value = newEmbedCode;
    }
    
    if (previewElement) {
        // Update preview iframe
        const readonly = document.getElementById('embedReadonly').checked;
        const hideTools = document.getElementById('embedHideTools').checked;
        const width = document.getElementById('embedWidth').value;
        const height = document.getElementById('embedHeight').value;
        
        let previewUrl = mapUrl;
        const params = [];
        
        if (readonly) params.push('readonly=true');
        if (hideTools) params.push('hidetools=true');
        
        if (params.length > 0) {
            previewUrl += (mapUrl.includes('?') ? '&' : '?') + params.join('&');
        }
        
        previewElement.src = previewUrl;
        previewElement.width = Math.min(400, parseInt(width) / 2);
        previewElement.height = Math.min(300, parseInt(height) / 2);
    }
}

function copyToClipboard(elementId, successMessage) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.select();
    element.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showMessage(successMessage || 'Copied to clipboard!');
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(element.value).then(() => {
            showMessage(successMessage || 'Copied to clipboard!');
        }).catch(() => {
            showMessage('Failed to copy to clipboard', 'error');
        });
    }
}

function closeShareModal() {
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Make functions available globally
window.shareMap = shareMap;
window.closeShareModal = closeShareModal;
window.copyToClipboard = copyToClipboard;
window.updateEmbedCode = updateEmbedCode;

function saveMap() {
    showMessage('Map saved automatically!');
}