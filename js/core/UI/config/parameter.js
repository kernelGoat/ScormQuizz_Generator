class Parameter {
    constructor(config) {
        this.id = config.id;
        this.label = config.label;
        this.type = config.type || 'switch'; // switch, input, etc.
        this.value = config.value ?? false; // Switch state
        this.inputValue = config.inputValue ?? ''; // Input value (if applicable)
        this.hasInput = config.hasInput || false; // Does it have an extra input field?

        // New: Select Options (Combo List)
        this.options = config.options || []; // Array of strings or objects { value, label }
        this.selectValue = config.selectValue || (this.options.length > 0 ? (typeof this.options[0] === 'object' ? this.options[0].value : this.options[0]) : '');

        // New: Actions & Status
        this.hasStatus = config.hasStatus || false;
        this.statusState = config.statusState || 'disconnected'; // connected, disconnected
        this.actions = config.actions || []; // Array of action buttons { icon, onClick, title }

        // Deprecated Expansion
        this.fields = config.fields || [];
        this.fieldValues = config.fieldValues || {};

        this.onChange = config.onChange || (() => { });

        this.dom = null;
        this.elements = {}; // Store DOM elements for easy access
    }

    render() {
        const wrapper = document.createElement('div');
        wrapper.className = 'config-parameter-wrapper';

        const container = document.createElement('div');
        container.className = 'config-parameter-row';

        // 1. Label
        const labelEl = document.createElement('span');
        labelEl.className = 'parameter-label';
        labelEl.textContent = this.label;

        // 2. Controls Container
        const controls = document.createElement('div');
        controls.className = 'parameter-controls';

        // 2a. Status Icon (if enabled)
        if (this.hasStatus) {
            const statusContainer = document.createElement('div');
            statusContainer.className = 'status-container';
            statusContainer.style.display = 'flex';
            statusContainer.style.alignItems = 'center';
            statusContainer.style.gap = '8px';

            const statusIcon = document.createElement('div');
            statusIcon.className = `parameter-status ${this.statusState}`;
            statusIcon.title = this.statusState === 'connected' ? 'Connected' : 'Disconnected';
            statusIcon.innerHTML = this.getStatusSVG(); // Helper method for SVG
            this.elements.status = statusIcon;

            const statusText = document.createElement('span');
            statusText.className = 'parameter-status-text';
            statusText.textContent = this.statusState === 'connected' ? 'Connected' : 'Not Connected';
            // Optional: color logic could be done in CSS or here
            this.elements.statusText = statusText;

            statusContainer.appendChild(statusIcon);
            statusContainer.appendChild(statusText);
            controls.appendChild(statusContainer);
        }

        // 2b. Action Buttons (Paste, etc.)
        this.elements.actions = [];
        this.actions.forEach(action => {
            const btn = document.createElement('button');
            btn.className = 'parameter-action-btn';
            btn.title = action.title || '';
            btn.innerHTML = action.icon; // Expecting SVG string

            // Initial state based on switch value
            btn.disabled = !this.value;

            btn.onclick = (e) => action.onClick(e, this);

            this.elements.actions.push(btn);
            controls.appendChild(btn);
        });

        // 2c. Select Field (if options exist)
        if (this.options.length > 0) {
            const select = document.createElement('select');
            select.className = 'parameter-select';
            select.disabled = !this.value;

            this.options.forEach(opt => {
                const option = document.createElement('option');
                const val = typeof opt === 'object' ? opt.value : opt;
                const label = typeof opt === 'object' ? opt.label : opt;
                option.value = val;
                option.textContent = label;
                if (val === this.selectValue) option.selected = true;
                select.appendChild(option);
            });

            select.addEventListener('change', (e) => {
                this.selectValue = e.target.value;
                this.triggerChange();
            });

            this.elements.select = select;
            controls.appendChild(select);
        }

        // 2d. Input Field (if enabled)
        if (this.hasInput) {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'parameter-input';
            input.value = this.inputValue;
            input.disabled = !this.value;

            input.addEventListener('input', (e) => {
                this.inputValue = e.target.value;
                this.triggerChange();
            });

            this.elements.input = input;
            controls.appendChild(input);
        }

        // 2e. Switch
        const switchLabel = document.createElement('label');
        switchLabel.className = 'parameter-switch';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.value;

        const slider = document.createElement('span');
        slider.className = 'slider round';

        checkbox.addEventListener('change', (e) => {
            this.updateState(e.target.checked);
        });

        switchLabel.appendChild(checkbox);
        switchLabel.appendChild(slider);

        this.elements.checkbox = checkbox;
        controls.appendChild(switchLabel);

        container.appendChild(labelEl);
        container.appendChild(controls);
        wrapper.appendChild(container);

        // (Expansion logic removed for this refactor as per request to simplify)

        this.dom = wrapper;
        return this.dom;
    }

    updateState(isChecked) {
        this.value = isChecked;

        if (this.elements.input) {
            this.elements.input.disabled = !this.value;
        }

        if (this.elements.select) {
            this.elements.select.disabled = !this.value;
        }

        if (this.elements.actions) {
            this.elements.actions.forEach(btn => {
                btn.disabled = !this.value;
            });
        }

        this.triggerChange();
    }

    updateStatus(status) {
        this.statusState = status;
        if (this.elements.status) {
            this.elements.status.className = `parameter-status ${status}`;
            this.elements.status.title = status === 'connected' ? 'Connected' : 'Disconnected';
        }
        if (this.elements.statusText) {
            this.elements.statusText.textContent = status === 'connected' ? 'Connected' : 'Not Connected';
            // Could also toggle a class like 'success' or 'error' on the text if needed
            this.elements.statusText.className = `parameter-status-text ${status}`;
        }
    }

    getStatusSVG() {
        // Simple circle or plug icon
        return `<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z"/>
        </svg>`;
    }

    triggerChange() {
        const state = {
            id: this.id,
            enabled: this.value,
            value: this.inputValue
        };

        if (this.options.length > 0) {
            state.selectValue = this.selectValue;
        }

        if (this.hasStatus) {
            state.status = this.statusState;
        }

        this.onChange(state);
    }
}

export default Parameter;