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
function selectTool(tool) {
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
    // Highlight the clicked tool
    event.target.closest('.tool-item').style.background = document.body.classList.contains('dark') ? '#333' : '#e3f2fd';
    event.target.closest('.tool-item').style.borderColor = document.body.classList.contains('dark') ? '#667eea' : '#667eea';
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
        .filter(link => link.target === selectedId)
        .map(link => link.source);

    // Create parent node selects (at least one)
    if (currentParents.length === 0) {
        addEditParentNodeSelect();
    } else {
        currentParents.forEach((parentId, index) => {
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
        
        window.currentMapData.nodes.forEach(node => {
            if (node.id !== currentEditId) {
                const option = document.createElement('option');
                option.value = node.id;
                option.textContent = node.id;
                if (node.id === selectedParentId) {
                    option.selected = true;
                }
                select.appendChild(option);
            }
        });
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

function shareMap() {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
        showMessage('Share URL copied to clipboard!');
    }).catch(() => {
        showMessage(`Share this URL: ${shareUrl}`);
    });
}

function saveMap() {
    showMessage('Map saved automatically!');
}