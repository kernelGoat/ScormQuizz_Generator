import Parameter from './parameter.js';

class Config {

    constructor(parent) {
        this.parent = parent;
        this.parameters = [];
        this.popover = null;
        this.testconfig = null;
        this.isVisible = false;
        this.triggerElement = null; // Store trigger to ignore clicks on it
        this.boundHandleOutsideClick = this.handleOutsideClick.bind(this); // Bind for add/remove listener
        this.init();
    }

    bindConfig(testconfig, isLoaded) {
        this.testconfig = testconfig;   // Bind Test Config from testManager
        if (isLoaded) {
            //update the parameters
            this.updateConfigUI();
        }
    }

    updateConfigUI() {
        this.parameters.forEach(param => {
            // 1. Map values from testconfig to parameter state
            if (param.id === 'testDuration') {
                param.value = this.testconfig.isTime;
                param.inputValue = this.testconfig.time;
            } else if (param.id === 'mixquestions') {
                param.value = this.testconfig.mixQuestions;
            } else if (param.id === 'mixanswer') {
                param.value = this.testconfig.mixAnswers;
            } else if (param.id === 'bayesianTest') {
                param.value = this.testconfig.isBayesian;
                param.selectValue = this.testconfig.bayesianType;
            } else if (param.id === 'saveAnswers') {
                param.value = this.testconfig.saveAnswers;

                if (param.value && this.testconfig.dbConfig && Object.keys(this.testconfig.dbConfig).length > 0) {
                    this.verifyConnection(this.testconfig.dbConfig).then(isValid => {
                        param.updateStatus(isValid ? 'connected' : 'disconnected');
                    });
                } else {
                    param.updateStatus('disconnected');
                }
            }

            // 2. Refresh DOM elements
            if (param.elements.checkbox) {
                param.elements.checkbox.checked = param.value;
                // Update disabled state for dependent inputs
                const disabled = !param.value;
                if (param.elements.input) param.elements.input.disabled = disabled;
                if (param.elements.select) param.elements.select.disabled = disabled;
                if (param.elements.actions) param.elements.actions.forEach(btn => btn.disabled = disabled);
            }
            if (param.elements.input) param.elements.input.value = param.inputValue;
            if (param.elements.select) param.elements.select.value = param.selectValue;
        });
    }



    async verifyConnection(config) {
        if (!config || !config.databaseURL) return false;

        try {
            // Append .json?shallow=true to check if DB is reachable
            // We expect 200, 401 (Auth required), or 403 (Permission denied) 
            // All imply the DB endpoint exists and is reachable.
            const url = `${config.databaseURL}/.json?shallow=true`;
            const response = await fetch(url);

            if (response.status === 200 || response.status === 401 || response.status === 403) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Connection verification failed:', error);
            return false;
        }
    }

    init() {
        // Initialize Default Parameters
        this.addParameter(new Parameter({
            id: 'testDuration',
            label: 'Test Duration',
            type: 'switch-input',
            value: false, // Default off
            inputValue: '6', // Default 6 minutes
            hasInput: true,
            onChange: (state) => {
                console.log('Test Duration Parameter Changed:', state);
                this.testconfig.isTime = state.enabled;
                this.testconfig.time = state.value;
                this.parent.triggerChange();
                // Here we can dispatch a global event or call a specific handler
            }
        }));

        this.addParameter(new Parameter({
            id: 'mixquestions',
            label: 'Mix questions',
            type: 'switch',
            value: false, // Default off
            hasStatus: false,
            onChange: (state) => {
                console.log('Mix Question Parameter Changed:', state);
                this.testconfig.mixQuestions = state.enabled;
                this.parent.triggerChange();
                // Here we can dispatch a global event or call a specific handler
            }
        }));

        this.addParameter(new Parameter({
            id: 'mixanswer',
            label: 'Mix answers',
            type: 'switch',
            value: false, // Default off
            hasStatus: false,
            onChange: (state) => {
                console.log('Mix Answer Parameter Changed:', state);
                this.testconfig.mixAnswers = state.enabled;
                this.parent.triggerChange();
                // Here we can dispatch a global event or call a specific handler
            }
        }));

        this.addParameter(new Parameter({
            id: 'bayesianTest',
            label: 'Bayesian Test',
            type: 'switch-select',
            value: false,
            options: [
                { value: 'standard', label: 'Standard' },
                { value: 'adaptive', label: 'Adaptive' },
                { value: 'advanced', label: 'Advanced' }
            ],
            onChange: (state) => {
                console.log('Bayesian Parameter Changed:', state);
                this.testconfig.isBayesian = state.enabled;
                this.testconfig.bayesianType = state.selectValue;
                this.parent.triggerChange();
            }
        }));

        this.addParameter(new Parameter({
            id: 'saveAnswers',
            label: 'Save to Firebase',
            type: 'switch',
            value: false,
            hasStatus: true,
            statusState: 'disconnected',
            onChange: async (state) => {
                console.log('DB Parameter Changed:', state);
                this.testconfig.saveAnswers = state.enabled;
                this.testconfig.dbType = 'firebase';

                const paramInstance = this.parameters.find(p => p.id === 'saveAnswers');

                if (state.enabled) {
                    const configPath = 'js/core/DBconfig/firebase.json';

                    if (typeof fs !== 'undefined' && fs.existsSync(configPath)) {
                        try {
                            const content = fs.readFileSync(configPath, 'utf8');
                            const config = JSON.parse(content);
                            this.testconfig.dbConfig = config;

                            const isConnected = await this.verifyConnection(config);

                            if (isConnected) {
                                if (paramInstance) paramInstance.updateStatus('connected');
                                console.log('Firebase config loaded and verified.');
                            } else {
                                if (paramInstance) paramInstance.updateStatus('disconnected');
                                console.warn('Firebase config loaded but connection failed.');
                            }
                        } catch (e) {
                            console.error('Error reading Firebase config', e);
                            if (paramInstance) paramInstance.updateStatus('disconnected');
                        }
                    } else {
                        console.log(`Firebase config file not found at ${configPath}`);
                        if (paramInstance) paramInstance.updateStatus('disconnected');
                    }
                } else {
                    if (paramInstance) paramInstance.updateStatus('disconnected');
                }

                this.parent.triggerChange();
            }
        }));

        this.render();
        this.attachEvents();
    }

    addParameter(parameter) {
        this.parameters.push(parameter);
        // If already rendered, we could append it, but for now init() handles it
    }

    render() {
        // Create Popover Container
        this.popover = document.createElement('div');
        this.popover.id = 'config-popover';

        // Header
        const header = document.createElement('div');
        header.className = 'config-header';

        const title = document.createElement('h2');
        title.textContent = 'Configuration';

        // Close button (optional in this style, but kept for accessibility)
        const closeBtn = document.createElement('button');
        closeBtn.className = 'config-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.hide();

        header.appendChild(title);
        header.appendChild(closeBtn);

        // Body
        const body = document.createElement('div');
        body.className = 'config-body';

        if (this.parameters.length === 0) {
            body.innerHTML = '<p style="color: #888; text-align: center;">No parameters configured yet.</p>';
        } else {
            this.parameters.forEach(param => {
                body.appendChild(param.render());
            });
        }

        this.popover.appendChild(header);
        this.popover.appendChild(body);

        document.body.appendChild(this.popover);
    }

    attachEvents() {
        // Handle resize to update position if open
        window.addEventListener('resize', () => {
            if (this.isVisible) this.hide(); // Simple handling: close on resize
        });
    }

    toggle(triggerElement) {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show(triggerElement);
        }
    }

    show(triggerElement) {
        if (!triggerElement) return;
        this.triggerElement = triggerElement;

        this.isVisible = true;
        this.popover.classList.add('visible');

        this.updatePosition(triggerElement);

        // Add click listener to document to close when clicking outside
        // Use setTimeout to avoid catching the immediate click that opened it
        setTimeout(() => {
            document.addEventListener('click', this.boundHandleOutsideClick);
        }, 0);
    }

    hide() {
        this.isVisible = false;
        this.popover.classList.remove('visible');
        this.triggerElement = null;
        document.removeEventListener('click', this.boundHandleOutsideClick);
    }

    handleOutsideClick(e) {
        if (!this.isVisible) return;

        // If click is inside popover, ignore
        if (this.popover.contains(e.target)) return;

        // If click is on the trigger, ignore (toggle logic handles it, or we rely on this to not close immediately and reopen)
        // However, usually toggle handles the click. If we click trigger while open:
        // 1. toggle() runs -> calls hide().
        // 2. this listener runs -> calls hide().
        // To avoid double actions or conflicts, safely ignore trigger clicks here if toggle handles it.
        // But since we delayed adding the listener, the initial click is missed. 
        // A subsequent click on trigger will trigger toggle() which calls hide().
        // So we can arguably just let toggle handle the trigger.
        if (this.triggerElement && this.triggerElement.contains(e.target)) return;

        this.hide();
    }

    updatePosition(triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        const popoverRect = this.popover.getBoundingClientRect();

        // Calculate position: Centered below the trigger
        let top = rect.bottom + 22; // Increased gap to make arrow clearly visible
        let left = rect.left + (rect.width / 2) - (popoverRect.width / 2);

        // Edge detection (simple right edge check)
        if (left + popoverRect.width > window.innerWidth - 10) {
            left = window.innerWidth - popoverRect.width - 10;
        }
        if (left < 10) {
            left = 10;
        }

        this.popover.style.top = `${top}px`;
        this.popover.style.left = `${left}px`;

        // Calculate arrow position relative to popover
        // The arrow should point to the center of the trigger
        const triggerCenter = rect.left + (rect.width / 2);
        const arrowX = triggerCenter - left;

        // Set CSS variable for the arrow
        this.popover.style.setProperty('--arrow-left', `${arrowX}px`);
    }

    toJsonFormat(text) {
        try {
            // 1. Extract the object part: find first '{' and last '}'
            const start = text.indexOf('{');
            const end = text.lastIndexOf('}');
            if (start === -1 || end === -1 || end <= start) return null;

            let jsonStr = text.substring(start, end + 1);

            // 2. Remove comments safely (avoiding URLs like https://)
            // We match strings first to ignore them, then match comments
            jsonStr = jsonStr.replace(/(".*?"|'.*?'|`.*?`|(?:\/\*[\s\S]*?\*\/|\/\/.*$))/gm, (match) => {
                if (match.startsWith('//') || match.startsWith('/*')) {
                    return '';
                }
                return match;
            });

            // 3. Handle backticks inside quotes or as quotes
            // Specifically handles the " `value` " pattern
            jsonStr = jsonStr.replace(/"\s*`([^`]*)`\s*"/g, '"$1"');
            jsonStr = jsonStr.replace(/`([^`]*)`/g, '"$1"');

            // 4. Handle single quotes for values - convert to double quotes
            jsonStr = jsonStr.replace(/:\s*'([^']*)'/g, ': "$1"');

            // 5. Quote unquoted keys
            // This regex finds identifiers followed by a colon and ensures they are quoted
            // It looks for the start of the object, a comma, or a newline
            jsonStr = jsonStr.replace(/([{,\n]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

            // 6. Remove trailing commas before } or ]
            jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

            return jsonStr.trim();
        } catch (e) {
            console.error("toJsonFormat error:", e);
            return null;
        }
    }
}

export default Config;