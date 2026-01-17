import Icons from '../Icons/svgIcons.js';

const Utils = {
    generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    showConfirmModal(callback) {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';
        modalOverlay.innerHTML = `
            <div class="modal">
                <h3>Unsaved Changes</h3>
                <p>You have unsaved changes. What would you like to do?</p>
                <div class="modal-buttons">
                    <button class="save-btn">Save</button>
                    <button class="discard-btn">Discard</button>
                    <button class="cancel-modal-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modalOverlay);

        modalOverlay.querySelector('.save-btn').onclick = () => {
            document.body.removeChild(modalOverlay);
            callback('save');
        };
        modalOverlay.querySelector('.discard-btn').onclick = () => {
            document.body.removeChild(modalOverlay);
            callback('discard');
        };
        modalOverlay.querySelector('.cancel-modal-btn').onclick = () => {
            document.body.removeChild(modalOverlay);
            callback('cancel');
        };
    },

    getImageViewHTML(src, width, height, collapsed) {
        if (!src) return '';
        return `
            <div class="div-image${collapsed ? ' collapsed' : ''}">
                <div class="image-controls" title="Toggle Image">
                    <span class="image-collapse-icon">
                        ${Icons.chevronDown}
                    </span>
                    <span class="image-toggle-text"></span>
                </div>
                <img src="${src}" style="width: ${width}px; height: ${height}px;">
            </div>
        `;
    }
};

export default Utils;
