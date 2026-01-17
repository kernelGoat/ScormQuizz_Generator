import IconEventInjector from '../Icons/IconEventInjector.js';
import TestManager from '../TestManager.js';
import Config from './config/config.js';


class UI_Manager {
  constructor() {
    this.UI = [];
    this.testManager = new TestManager();
    this.config = new Config(this);
  }

  initUI() {
    // UI Object
    this.UI = [
      {
        selector: '#welcome-screen',
        icon: '',
        event: '',
        handler: () => { }
      },
      {
        selector: '#blocks-container',
        icon: '',
        event: '',
        handler: () => { }
      },
      {
        selector: '#top-bar',
        icon: '',
        event: '',
        handler: () => { }
      },
      {
        selector: '#add-block-btn',
        icon: 'addBlock',
        event: 'click',
        handler: this.addQuestionBlock.bind(this)
      },
      {
        selector: '#new-test-btn',
        icon: 'newTest',
        event: 'click',
        handler: () => ipcRenderer.send("NewTest", 1)
      },
      {
        selector: '#open-test-btn',
        icon: 'openTest',
        event: 'click',
        handler: () => ipcRenderer.send("OpenTest", 1)
      },
      {
        selector: '.folder-icon',
        icon: 'folder',
        event: '',
        handler: () => { }
      },
      {
        selector: '#import-btn',
        icon: 'import',
        event: 'click',
        handler: () => { }
      },
      {
        selector: '#collapse-all-btn',
        icon: 'collapseUp',
        event: 'click',
        handler: (e) => this.toggleCollapseIcon(e.currentTarget)
      },
      {
        selector: '#config-btn',
        icon: 'settings',
        event: 'click',
        handler: (e) => this.showConfigPanel(e.currentTarget)
      },
      {
        selector: '#generate-scorm-btn',
        icon: 'scorm',
        event: 'click',
        handler: () => {
          console.log("Generate scorm");
          console.log(this.testManager.testData);
        }
      },
      {
        selector: '#quit-btn',
        icon: 'quit',
        event: 'click',
        handler: () => this.quitTest()
      }
    ]
    document.addEventListener('DOMContentLoaded', this.InjectIconsEvent.bind(this));

    // ipcRenderer event for New Test Folder
    ipcRenderer.on('newFolder', (folderName) => {
      this.newTest(folderName);
      console.log(folderName);
    });

    // ipcRenderer event for Open Test Folder
    ipcRenderer.on('testFolder', (folderName) => {
      this.openTest(folderName);
      console.log(folderName);
    });

  }

  InjectIconsEvent() {
    IconEventInjector.injectMultiple(this.UI);
  }

  newTest(folderName) {
    this.testManager.newTest(folderName);
    this.config.bindConfig(this.testManager.testData.parameters, false); //isLoaded = false
    this.updateUiFolderPath(folderName);
    this.showHideEditor("new");
  }

  updateConfigUI() {
    //console.log("Update config UI");
    //console.log(configData);
    this.config.bindConfig(this.testManager.testData.parameters, true); //isLoaded = true
  }

  openTest(folderName) {
    let configData = this.testManager.openTest(folderName);
    // at this point the test is loaded and the blocks are created
    // by the testManager & now the UI manager will update the parameters
    // & show the editor
    if (configData != null) {
      this.updateUiFolderPath(folderName);
      this.updateConfigUI();
      this.showHideEditor("open");
    }
  }

  quitTest() {

    //before quit check if there are unsaved changes ( an active editor is opened )
    // when the user choose to save or not the changes of the active editor
    // then the test can be closed
    this.testManager.closeTest(this.showHideEditor.bind(this, "quit"));

  }

  updateUiFolderPath(path) {
    document.querySelector(".path-text").innerHTML = path;
  }

  showHideEditor(caller) {

    if (["new", "open"].includes(caller)) {
      // Show Editor, Hide Welcome Screen
      document.querySelector(this.UI[0].selector)?.classList.add('hidden');
      document.querySelector(this.UI[1].selector)?.classList.remove('hidden');
      document.querySelector(this.UI[3].selector)?.classList.remove('hidden');
      document.querySelector(this.UI[2].selector)?.classList.remove('hidden');
    } else {
      // Hide Editor, Show Welcome Screen
      document.querySelector(this.UI[0].selector)?.classList.remove('hidden');
      document.querySelector(this.UI[1].selector)?.classList.add('hidden');
      document.querySelector(this.UI[3].selector)?.classList.add('hidden');
      document.querySelector(this.UI[2].selector)?.classList.add('hidden');
    }
  }

  showConfigPanel(triggerElement) {
    this.config.toggle(triggerElement);
  }

  toggleCollapseIcon(element) {

    const isCollapsed = element.getAttribute('data-collapsed') === 'true';
    IconEventInjector.toggleIcons(element, 'collapseUp', 'collapseDown', isCollapsed);

  }

  addQuestionBlock() {
    this.testManager.addBlock();
  }

  triggerChange() {
    this.testManager.triggerChange();
  }
}

export default UI_Manager;








