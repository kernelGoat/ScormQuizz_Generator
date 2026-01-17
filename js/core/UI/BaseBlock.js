import Utils from './Utils.js';
import Icons from '../Icons/svgIcons.js';

class BaseBlock {
    constructor(manager, qData) {
        this.manager = manager;
        this.id = Utils.generateId();
        this.content = qData.Qtext;
        this.qData = qData;
        // Image State
        //this.imageData = this.qData.imageData; // { src, width, height, collapsed }

        // Editor State
        this.isVisible = true;
        this.isCollapsed = false;
        this.isEditingText = false;
        this.isEditingImage = false;
        this.originalContent = '';
        this.originalEditorContent = null;
        this.editTimeout = null;

        // Image Snapshot
        this.originalImageData = null;

        this.element = this.createDOM();
        this.bindStaticEvents();
        this.render();
    }

    createDOM() {
        const div = document.createElement('div');
        div.className = 'editable-container';
        div.dataset.id = this.id;
        return div;
    }

    render() {
        if (this.isVisible) {
            this.element.classList.remove('is-hidden');
        } else {
            this.element.classList.add('is-hidden');
        }

        let imageHTML = '';
        if (this.qData.imageData) {
            imageHTML = Utils.getImageViewHTML(
                this.qData.imageData.src,
                this.qData.imageData.width,
                this.qData.imageData.height,
                this.qData.imageData.collapsed
            );
        }

        this.element.innerHTML = this.getTemplate(imageHTML);
        this.bindDynamicEvents();
    }

    // To be overridden by subclasses 
    getTemplate(imageHTML) {
        return '';
    }

    getVisibilityIconHTML() {
        return this.isVisible ? Icons.visibilityOn : Icons.visibilityOff;
    }
    collapse() {
        this.isCollapsed = true;
        this.element.classList.add('is-collapsed');
    }

    expand() {
        this.isCollapsed = false;
        this.element.classList.remove('is-collapsed');
    }

    toggle() {
        this.isCollapsed ? this.expand() : this.collapse();
    }


    bindStaticEvents() {
        this.onImageControlClick = (e) => {
            const control = e.target.closest('.image-controls');
            if (control) {
                e.stopPropagation();
                if (this.qData.imageData) {
                    this.qData.imageData.collapsed = !this.qData.imageData.collapsed;
                    const imageContainer = this.element.querySelector('.image-container');
                    if (imageContainer) {
                        imageContainer.innerHTML = Utils.getImageViewHTML(
                            this.qData.imageData.src,
                            this.qData.imageData.width,
                            this.qData.imageData.height,
                            this.qData.imageData.collapsed
                        );
                    }
                }
            }
        };
        this.element.addEventListener('click', this.onImageControlClick);

        this.onMouseDown = (e) => {
            if (e.target.closest('.block-label')) {
                this.element.draggable = true;
            } else {
                this.element.draggable = false;
            }
        };
        this.element.onmousedown = this.onMouseDown;

        this.onDragStart = (e) => {
            if (!this.element.draggable) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.setData('text/plain', this.id);
            this.element.classList.add('dragging');
        };
        this.element.addEventListener('dragstart', this.onDragStart);

        this.onDragEnd = () => {
            this.element.classList.remove('dragging');
            this.element.draggable = false;
            document.querySelectorAll('.editable-container').forEach(el => el.classList.remove('drag-over'));
        };
        this.element.addEventListener('dragend', this.onDragEnd);

        this.onDragOver = (e) => {
            e.preventDefault();
            this.element.classList.add('drag-over');
        };
        this.element.addEventListener('dragover', this.onDragOver);

        this.onDragLeave = () => {
            this.element.classList.remove('drag-over');
        };
        this.element.addEventListener('dragleave', this.onDragLeave);

        this.onDrop = (e) => {
            e.preventDefault();
            this.element.classList.remove('drag-over');
            const sourceId = e.dataTransfer.getData('text/plain');
            if (sourceId) this.manager.handleReorder(sourceId, this.id);
        };
        this.element.addEventListener('drop', this.onDrop);
    }

    bindDynamicEvents() {
        const editIcon = this.element.querySelector('.edit-icon');
        if (editIcon) {
            this.onEditIconClick = (e) => {
                e.stopPropagation();
                this.manager.requestActivation(this, 'text');
            };
            editIcon.onclick = this.onEditIconClick;
        }

        const imageIcon = this.element.querySelector('.image-icon');
        if (imageIcon) {
            this.onImageIconClick = (e) => {
                e.stopPropagation();
                this.manager.requestActivation(this, 'image');
            };
            imageIcon.onclick = this.onImageIconClick;
        }

        const collapseIcon = this.element.querySelector('.collapse-icon');
        if (collapseIcon) {
            this.onCollapseIconClick = (e) => {
                e.stopPropagation();
                this.toggle();
                // Update the question data
                this.qData.isCollapsed = !this.qData.isCollapsed;
                this.manager.triggerChange();
            };
            collapseIcon.onclick = this.onCollapseIconClick;
        }

        const visibilityIcon = this.element.querySelector('.visibility-icon');
        if (visibilityIcon) {
            this.onVisibilityIconClick = (e) => {
                e.stopPropagation();
                this.isVisible = !this.isVisible;
                this.element.classList.toggle('is-hidden', !this.isVisible);
                visibilityIcon.title = this.isVisible ? 'Hide' : 'Show';
                visibilityIcon.innerHTML = this.getVisibilityIconHTML();
                this.qData.isVisible = this.isVisible; // Update the question data
                this.manager.triggerChange();
            };
            visibilityIcon.onclick = this.onVisibilityIconClick;
        }

        const deleteIcon = this.element.querySelector('.delete-icon');
        if (deleteIcon) {
            this.onDeleteIconClick = (e) => {
                e.stopPropagation();
                this.manager.removeBlock(this);
            };
            deleteIcon.onclick = this.onDeleteIconClick;
        }

        const upIcon = this.element.querySelector('.up-icon');
        if (upIcon) {
            this.onUpIconClick = (e) => {
                e.stopPropagation();
                this.manager.moveBlockUp(this);
            };
            upIcon.onclick = this.onUpIconClick;
        }

        const downIcon = this.element.querySelector('.down-icon');
        if (downIcon) {
            this.onDownIconClick = (e) => {
                e.stopPropagation();
                this.manager.moveBlockDown(this);
            };
            downIcon.onclick = this.onDownIconClick;
        }
    }

    unbindStaticEvents() {
        // Remove static event listeners
        this.element.removeEventListener('click', this.onImageControlClick);
        this.element.removeEventListener('mousedown', this.onMouseDown);
        this.element.removeEventListener('dragstart', this.onDragStart);
        this.element.removeEventListener('dragend', this.onDragEnd);
        this.element.removeEventListener('dragover', this.onDragOver);
        this.element.removeEventListener('dragleave', this.onDragLeave);
        this.element.removeEventListener('drop', this.onDrop);
        // Clean up references
        delete this.onImageControlClick;
        delete this.onMouseDown;
        delete this.onDragStart;
        delete this.onDragEnd;
        delete this.onDragOver;
        delete this.onDragLeave;
        delete this.onDrop;
    }

    unbindDynamicEvents() {
        // Remove dynamic event listeners
        const editIcon = this.element.querySelector('.edit-icon');
        if (editIcon && this.onEditIconClick) editIcon.onclick = null;

        const imageIcon = this.element.querySelector('.image-icon');
        if (imageIcon && this.onImageIconClick) imageIcon.onclick = null;

        const collapseIcon = this.element.querySelector('.collapse-icon');
        if (collapseIcon && this.onCollapseIconClick) collapseIcon.onclick = null;

        const visibilityIcon = this.element.querySelector('.visibility-icon');
        if (visibilityIcon && this.onVisibilityIconClick) visibilityIcon.onclick = null;

        const deleteIcon = this.element.querySelector('.delete-icon');
        if (deleteIcon && this.onDeleteIconClick) deleteIcon.onclick = null;

        const upIcon = this.element.querySelector('.up-icon');
        if (upIcon && this.onUpIconClick) upIcon.onclick = null;

        const downIcon = this.element.querySelector('.down-icon');
        if (downIcon && this.onDownIconClick) downIcon.onclick = null;
        // Clean up references
        delete this.onEditIconClick;
        delete this.onImageIconClick;
        delete this.onCollapseIconClick;
        delete this.onVisibilityIconClick;
        delete this.onDeleteIconClick;
        delete this.onUpIconClick;
        delete this.onDownIconClick;
    }

    unbindAllEvents() {
        this.unbindStaticEvents();
        this.unbindDynamicEvents();
    }



    startTextEdit() {
        if (this.isEditingText) return;
        this.isEditingText = true;
        this.element.classList.add('editor-wrapper');

        const div = this.element.querySelector('.editable-div');
        this.originalContent = this.qData.Qtext;

        this.manager.textEditor.attachTo(
            div,
            this.originalContent,
            (newContent) => this.closeTextEdit(true, newContent),
            () => this.closeTextEdit(false)
        );

        this.editTimeout = setTimeout(() => {
            if (this.isEditingText && this.manager.textEditor.quill) {
                this.originalEditorContent = this.manager.textEditor.quill.root.innerHTML;
            }
            this.editTimeout = null;
        }, 100);
    }

    closeTextEdit(save, newContent = null) {
        if (this.editTimeout) {
            clearTimeout(this.editTimeout);
            this.editTimeout = null;
        }

        if (save && newContent !== null) {
            this.qData.Qtext = newContent;
            this.manager.triggerChange();  // only if text changes
        }
        this.isEditingText = false;
        this.originalEditorContent = null;
        this.element.classList.remove('editor-wrapper');
        this.manager.clearActive();

        // Restore content to the editable div
        const editableDiv = this.element.querySelector('.editable-div');
        if (editableDiv) {
            editableDiv.innerHTML = `<p>${this.qData.Qtext}</p>`;
        }
    }

    startImageEdit() {
        if (this.isEditingImage) return;
        this.isEditingImage = true;
        this.element.classList.add('editor-wrapper');
        this.originalImageData = this.qData.imageData ? { ...this.qData.imageData } : null;
        const imageContainer = this.element.querySelector('.image-container');

        this.manager.imageEditor.attachTo(
            imageContainer,
            this.qData.imageData,
            (newImageData) => this.closeImageEdit(true, newImageData),
            () => this.closeImageEdit(false)
        );
    }

    closeImageEdit(save, newImageData = null) {
        if (save && newImageData !== null) {
            this.qData.imageData = { ...newImageData };
            this.manager.triggerChange();  // only if image changes
        } else if (save && !newImageData) {
            this.qData.imageData = null;
        }
        this.isEditingImage = false;
        this.element.classList.remove('editor-wrapper');
        this.manager.clearActive();

        // Update only the image container without re-rendering the entire block
        const imageContainer = this.element.querySelector('.image-container');
        if (imageContainer) {
            const imageHTML = this.qData.imageData ? Utils.getImageViewHTML(
                this.qData.imageData.src,
                this.qData.imageData.width,
                this.qData.imageData.height,
                this.qData.imageData.collapsed
            ) : '';
            imageContainer.innerHTML = imageHTML;
        }
    }

    hasUnsavedChanges() {
        if (this.isEditingText) {
            if (!this.originalEditorContent) return false;
            return this.manager.textEditor.getContent() !== this.originalEditorContent;
        }
        if (this.isEditingImage) {
            const orig = this.originalImageData;
            const curr = this.manager.imageEditor.getImageData();
            if ((!orig && curr.src) || (orig && !curr.src)) return true;
            if (!orig && !curr.src) return false;
            return (
                orig.src !== curr.src ||
                orig.width !== curr.width ||
                orig.height !== curr.height
            );
        }
        return false;
    }

    attemptClose(callback) {
        if (this.hasUnsavedChanges()) {
            Utils.showConfirmModal((action) => {
                if (action === 'save') {
                    if (this.isEditingText) this.closeTextEdit(true, this.manager.textEditor.getContent());
                    if (this.isEditingImage) this.closeImageEdit(true, this.manager.imageEditor.getImageData());
                    callback(true);
                } else if (action === 'discard') {
                    if (this.isEditingText) this.closeTextEdit(false);
                    if (this.isEditingImage) this.closeImageEdit(false);
                    callback(true);
                } else {
                    callback(false);
                }
            });
        } else {
            if (this.isEditingText) this.closeTextEdit(false);
            if (this.isEditingImage) this.closeImageEdit(false);
            callback(true);  // this callback indicates closure was successful, and can proceed
        }
    }
}

export default BaseBlock;
