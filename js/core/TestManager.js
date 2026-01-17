import QuestionBlock from './QuestionBlock.js';
import TextEditor from './UI/TextEditor.js';
import ImageEditor from './UI/ImageEditor.js';
import FileManager from './FileManager.js';

class TestManager {
    constructor() {
        this.hasChanged = false;   // True when the test has changed
        this.isClosed = false;     // True when the test is closing
        this.testData = null;      // The Test object data
        this.blocks = [];          //bloks are question doms
        this.activeBlock = null;   // Currently editing block (Text or Image mode)
        this.textEditor = new TextEditor();
        this.imageEditor = new ImageEditor();
        this.FileManager = new FileManager(this);
    }

    triggerChange() {
        this.hasChanged = true;
        console.log("there is a change !");
    }


    newTest(folderName) {
        this.FileManager.createTestFolder(folderName);
        //Init a new test DATA
        const testData = {
            parameters: {
                isTime: false,
                time: 5,   //Minimum is 5 minutes
                mixQuestions: false,
                mixAnswers: false,
                isBayesian: false,    //for bayesian test type
                bayesianType: "",
                saveAnswers: false,
                dbType: "",             // is it Firebase or Supabase
                dbConfig: {}            // DB API keys etc...
            },
            questions: []
        };
        this.testData = testData;
        // Clear existing blocks, but only if there are any
        if (this.blocks.length > 0)
            this.clearBlockContainer();
    }

    clearBlockContainer() {
        const container = document.getElementById('blocks-container');
        container.innerHTML = '';
        this.removeAllBlocks();
    }

    openTest(folderName) {
        let tdata = this.FileManager.openTestFolder(folderName);
        if (tdata != null) {
            this.testData = tdata;
            this.loadBlocks();
            return this.testData.parameters;   // To the UI manager
        }
        return null;
    }

    loadBlocks() {
        this.clearBlockContainer();
        this.blocks = [];
        this.activeBlock = null;
        this.testData.questions.forEach(question => {
            const block = new QuestionBlock(this, question);
            this.blocks.push(block);
            document.getElementById('blocks-container').appendChild(block.element);
        });
    }

    addBlock() {
        // create question object and add it to testData
        const questionData = {
            Qtext: "Click the edit icon POUR edit the question.",
            imageData: null,
            answers: [],
            isCollapsed: false,
            isVisible: true,
        };
        this.testData.questions.push(questionData);

        const block = new QuestionBlock(this, questionData);
        this.blocks.push(block);
        document.getElementById('blocks-container').appendChild(block.element);
        //return block;
        this.triggerChange();
    }

    // Centralized method to handle switching active blocks
    requestActivation(requestingBlock, mode = 'text') { // mode: 'text' or 'image'
        if (this.activeBlock === requestingBlock) {
            // Check if we are switching modes (e.g. from text to image)
            if (mode === 'text' && requestingBlock.isEditingText) return;
            if (mode === 'image' && requestingBlock.isEditingImage) return;

            // We are switching modes in the same block. Attempt to close current mode.
            requestingBlock.attemptClose((success) => {
                if (success) {
                    this.setActive(requestingBlock, mode);
                }
            });
            return;
        }

        if (this.activeBlock) {
            // Ask current block to close. 
            this.activeBlock.attemptClose((success) => {
                if (success) {
                    this.setActive(requestingBlock, mode);
                }
            });
        } else {
            this.setActive(requestingBlock, mode);
        }
    }

    setActive(block, mode) {
        this.activeBlock = block;
        if (mode === 'text') block.startTextEdit();
        if (mode === 'image') block.startImageEdit();
    }

    clearActive() {
        this.activeBlock = null;
    }

    moveBlockUp(block) {
        const index = this.blocks.indexOf(block);
        if (index > 0) {
            // Swap in array
            const prevBlock = this.blocks[index - 1];
            this.blocks[index - 1] = block;
            this.blocks[index] = prevBlock;

            // Swap in testData
            const prevQuestion = this.testData.questions[index - 1];
            this.testData.questions[index - 1] = this.testData.questions[index];
            this.testData.questions[index] = prevQuestion;

            // Swap in DOM (Move Current before Prev)
            const container = document.getElementById('blocks-container');
            container.insertBefore(block.element, prevBlock.element);

            this.triggerChange();
        }

    }

    moveBlockDown(block) {
        const index = this.blocks.indexOf(block);
        if (index < this.blocks.length - 1) {
            // Swap in array
            const nextBlock = this.blocks[index + 1];
            this.blocks[index + 1] = block;
            this.blocks[index] = nextBlock;

            // Swap in testData
            const nextQuestion = this.testData.questions[index + 1];
            this.testData.questions[index + 1] = this.testData.questions[index];
            this.testData.questions[index] = nextQuestion;

            // Swap in DOM (Move Next before Current)
            const container = document.getElementById('blocks-container');
            container.insertBefore(nextBlock.element, block.element);

            this.triggerChange();
        }
    }

    handleReorder(sourceId, targetId) {
        if (sourceId === targetId) return;

        const sourceIndex = this.blocks.findIndex(b => b.id === sourceId);
        const targetIndex = this.blocks.findIndex(b => b.id === targetId);

        if (sourceIndex === -1 || targetIndex === -1) return;

        const [movedBlock] = this.blocks.splice(sourceIndex, 1);
        this.blocks.splice(targetIndex, 0, movedBlock);

        // Sync testData
        const [movedQuestion] = this.testData.questions.splice(sourceIndex, 1);
        this.testData.questions.splice(targetIndex, 0, movedQuestion);

        const container = document.getElementById('blocks-container');
        const targetElement = this.blocks[targetIndex + 1] ? this.blocks[targetIndex + 1].element : null;

        container.insertBefore(movedBlock.element, targetElement);

        this.triggerChange();
    }

    removeBlock(block) {
        // If the block being removed is active, clear active state
        if (this.activeBlock === block) {
            this.activeBlock = null;
        }

        // Remove from array
        const index = this.blocks.indexOf(block);
        if (index > -1) {
            this.blocks.splice(index, 1);
            this.testData.questions.splice(index, 1);    //Remove also from testData object
        }

        // Remove from DOM
        if (block.element && block.element.parentNode) {
            block.element.parentNode.removeChild(block.element);
        }
        block.unbindQuestionEvents();
        this.triggerChange();
    }

    removeAllBlocks() {
        this.blocks.forEach(block => {
            if (block.element && block.element.parentNode) {
                block.element.parentNode.removeChild(block.element);
            }
            block.unbindQuestionEvents();
        });
        this.blocks = [];
    }

    closeTest(UIcallback) {
        console.log("Closing test !");

        if (this.activeBlock) {

            this.activeBlock.attemptClose(() => {
                this.removeAllBlocks();
                this.clearActive();

                // Save the test and remove the regular save interval
                this.FileManager.saveTest(true);
                this.FileManager.setTestPath(null);
                // Clear testData
                this.testData = null;

                UIcallback();  // function from the UI manager to hide the editor
            });
        } else {
            // Save the test and remove the regular save interval
            this.FileManager.saveTest(true);
            this.FileManager.setTestPath(null);
            // Clear testData
            this.testData = null;
            UIcallback();  // function from the UI manager to hide the editor
        }



    }


}
export default TestManager;
