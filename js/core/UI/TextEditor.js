class TextEditor {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'central-editor-container';
        this.container.style.display = 'none';

        this.editorId = 'central-quill-editor';
        this.container.innerHTML = `
            <div id="${this.editorId}"></div>
            <div class="button-container">
                <button class="ok-btn">OK</button>
                <button class="cancel-btn">Cancel</button>
            </div>
        `;

        this.quill = null;
        this.onSave = null;
        this.onCancel = null;
        this.activeTarget = null;

        // Bind buttons
        this.container.querySelector('.ok-btn').onclick = (e) => {
            e.stopPropagation();
            this.save();
        };
        this.container.querySelector('.cancel-btn').onclick = (e) => {
            e.stopPropagation();
            this.cancel();
        };
    }

    initQuill() {
        if (this.quill) return;

        const editorElement = this.container.querySelector('#' + this.editorId);
        this.quill = new Quill(editorElement, {
            theme: 'snow',
            modules: {
                toolbar: [

                    ['bold', 'italic', 'underline', 'strike'],

                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'align': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'clean']
                ]
            }
        });
    }

    attachTo(targetElement, content, onSave, onCancel) {
        this.activeTarget = targetElement;
        this.onSave = onSave;
        this.onCancel = onCancel;

        // Clear target and append our container
        targetElement.innerHTML = '';
        targetElement.appendChild(this.container);
        this.container.style.display = 'block';

        // Initialize Quill if first time (NOW it's in the DOM, but we pass element anyway)
        this.initQuill();

        // Set content
        this.quill.root.innerHTML = content;

        // Focus editor
        this.quill.focus();
    }

    detach() {
        if (this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container.style.display = 'none';
        this.activeTarget = null;
        this.onSave = null;
        this.onCancel = null;
    }

    save() {
        const content = this.quill.root.innerHTML;
        if (this.onSave) this.onSave(content);
        this.detach();
    }

    cancel() {
        if (this.onCancel) this.onCancel();
        this.detach();
    }

    getContent() {
        return this.quill ? this.quill.root.innerHTML : '';
    }
}

export default TextEditor;
