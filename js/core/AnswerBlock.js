import Utils from './UI/Utils.js';
import Icons from './Icons/svgIcons.js';

class AnswerBlock {
    constructor(questionBlock, answerData) {
        this.questionBlock = questionBlock;
        this.manager = questionBlock.manager;
        this.id = Utils.generateId();

        this.answerData = answerData;

        //this.content = answerData.Atext;
        //this.isCorrect = answerData.isCorrect;

        this.isEditingText = false;
        this.originalEditorContent = null;
        this.editTimeout = null;

        this.element = this.createDOM();
        this.render();
    }

    createDOM() {
        const div = document.createElement('div');
        div.className = 'answer-option-item';
        div.dataset.id = this.id;
        return div;
    }

    render() {
        this.element.innerHTML = `
            <div class="answer-content">${this.answerData.Atext}</div>
            <div class="answer-actions">
                <div class="answer-toggle action-icon ${this.answerData.isCorrect ? 'is-correct' : ''}" title="Toggle Correctness">
                    ${this.answerData.isCorrect ? Icons.thumbsUp : Icons.thumbsDown}
                </div>
                <span class="answer-edit-icon action-icon" title="Edit Answer">
                    ${Icons.edit}
                </span>
                <span class="answer-delete-icon action-icon remove-icon" title="Delete Answer">
                    ${Icons.delete}
                </span>
            </div>
        `;
        this.bindEvents();
        //console.log(this.answerData);
    }

    bindEvents() {
        const toggle = this.element.querySelector('.answer-toggle');
        toggle.onclick = (e) => {
            e.stopPropagation();
            this.answerData.isCorrect = !this.answerData.isCorrect;
            this.updateToggleUI();
        };

        const editIcon = this.element.querySelector('.answer-edit-icon');
        editIcon.onclick = (e) => {
            e.stopPropagation();
            this.manager.requestActivation(this, 'text');
        };

        const deleteIcon = this.element.querySelector('.answer-delete-icon');
        deleteIcon.onclick = (e) => {
            e.stopPropagation();
            this.questionBlock.removeAnswer(this);
        };
    }

    unbindAnswerEvents() {

        const toggle = this.element.querySelector('.answer-toggle');
        toggle.onclick = null;
        const editIcon = this.element.querySelector('.answer-edit-icon');
        editIcon.onclick = null;
        const deleteIcon = this.element.querySelector('.answer-delete-icon');
        deleteIcon.onclick = null;

    }

    // --- Lifecycle Methods for Manager ---

    startTextEdit() {
        if (this.isEditingText) return;
        this.isEditingText = true;
        this.element.classList.add('is-editing');

        const div = this.element.querySelector('.answer-content');
        this.manager.textEditor.attachTo(
            div,
            this.answerData.Atext,
            (newContent) => this.closeEdit(true, newContent),
            () => this.closeEdit(false)
        );

        // Sync normalized content after Quill initializes
        this.editTimeout = setTimeout(() => {
            if (this.isEditingText && this.manager.textEditor.quill) {
                this.originalEditorContent = this.manager.textEditor.quill.root.innerHTML;
            }
            this.editTimeout = null;
        }, 100);
    }

    // satisfy manager's quest for image state
    get isEditingImage() { return false; }

    attemptClose(callback) {
        if (this.hasUnsavedChanges()) {
            Utils.showConfirmModal((action) => {
                if (action === 'save') {
                    const content = this.manager.textEditor.getContent();
                    this.closeEdit(true, content);
                    callback(true);
                } else if (action === 'discard') {
                    this.closeEdit(false);
                    callback(true);
                } else {
                    callback(false); // Cancel
                }
            });
        } else {
            if (this.isEditingText) this.closeEdit(false);
            callback(true);
        }
    }

    closeEdit(save, newContent = null) {
        if (this.editTimeout) {
            clearTimeout(this.editTimeout);
            this.editTimeout = null;
        }

        if (save && newContent !== null) {
            this.answerData.Atext = newContent;
            this.questionBlock.triggerChange();
        }
        this.isEditingText = false;
        this.originalEditorContent = null;
        this.element.classList.remove('is-editing');
        this.manager.clearActive();
        this.render();
    }

    hasUnsavedChanges() {
        if (this.isEditingText) {
            if (!this.originalEditorContent) return false;
            return this.manager.textEditor.getContent() !== this.originalEditorContent;
        }
        return false;
    }

    updateToggleUI() {
        const toggle = this.element.querySelector('.answer-toggle');
        if (toggle) {
            toggle.classList.toggle('is-correct', this.answerData.isCorrect);
            toggle.innerHTML = this.answerData.isCorrect ? Icons.thumbsUp : Icons.thumbsDown;
        }
    }
}

export default AnswerBlock;
