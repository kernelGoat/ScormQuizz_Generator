import BaseBlock from './UI/BaseBlock.js';
import Icons from './Icons/svgIcons.js';
import AnswerBlock from './AnswerBlock.js';

class QuestionBlock extends BaseBlock {
    constructor(manager, questionData) {
        super(manager, questionData);
        this.element.classList.add('question-block');
        this.answers = [];
        this.questionData = questionData;   // The Question object data
        // Add two default answers
        this.addAnswer();
        this.addAnswer();
    }

    getTemplate(imageHTML) {
        return `
            <div class="block-header question-header">
                <span class="block-label question-label"></span>
                <div class="move-controls">
                    <span class="move-icon up-icon">
                        ${Icons.up}
                    </span>
                    <span class="move-icon down-icon">
                        ${Icons.down}
                    </span>
                </div>
            </div>
            <span class="collapse-icon" title="Collapse/Expand">
                ${Icons.collapse}
            </span>
            <span class="visibility-icon" title="${this.isVisible ? 'Hide' : 'Show'}">
                ${this.getVisibilityIconHTML()}
            </span>
            <span class="edit-icon">
                ${Icons.edit}
            </span>
            <span class="image-icon">
                ${Icons.image}
            </span>
            <span class="delete-icon">
                ${Icons.delete}
            </span>
            <div class="editable-div question-content"><p>${this.content}</p></div>
            <div class="image-container">${imageHTML}</div>
            
            <div class="answers-section">
                <div class="answers-header">
                    <h4>Answers</h4>
                    <div class="add-answer-btn-icon" title="Add Answer">
                        ${Icons.plus}
                    </div>
                </div>
                <div class="answers-list"></div>
            </div>
        `;
    }

    bindDynamicEvents() {
        super.bindDynamicEvents();
        const addBtn = this.element.querySelector('.add-answer-btn-icon');
        if (addBtn) {
            this.onAddAnswerClick = () => this.addAnswer();
            addBtn.onclick = this.onAddAnswerClick;
        }
    }

    unbindQuestionEvents() {
        super.unbindAllEvents();
        const addBtn = this.element.querySelector('.add-answer-btn-icon');
        if (addBtn && this.onAddAnswerClick) {
            addBtn.onclick = null;
        }

        // Unbind all answer events to prevent memory leaks
        this.answers.forEach(answer => {
            answer.unbindAnswerEvents();
        });
    }


    addAnswer() {
        const answerData = {
            Atext: "Click edit icon to change the answer text",
            isCorrect: false
        };
        this.questionData.answers.push(answerData);  // push the answer object

        const ans = new AnswerBlock(this, answerData);
        this.answers.push(ans);  // push the answer block DOM

        // Only append to DOM, don't re-render everything
        const container = this.element.querySelector('.answers-list');
        if (container) {
            container.appendChild(ans.element);
        }
        this.triggerChange();
    }

    removeAnswer(answerBlock) {
        const index = this.answers.indexOf(answerBlock);
        const aindex = this.questionData.answers.indexOf(answerBlock.answerData);
        if (index > -1) {
            this.answers.splice(index, 1);
            this.questionData.answers.splice(aindex, 1);
            // Only remove from DOM, don't re-render everything
            if (answerBlock.element && answerBlock.element.parentNode) {
                answerBlock.element.parentNode.removeChild(answerBlock.element);
                // Unbind events to prevent memory leaks
                answerBlock.unbindAnswerEvents();
            }
            this.triggerChange();
        }

    }

    triggerChange() {
        this.manager.triggerChange();
    }
}

export default QuestionBlock;