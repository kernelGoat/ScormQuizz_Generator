class ImageEditor {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'image-editor-container';
        this.container.style.display = 'none';

        this.onSave = null;
        this.onCancel = null;
        this.activeTarget = null;
        this.tempImageData = null;
        this.originalImageData = null;
        this.aspectRatio = 1;

        this.renderBase();
    }

    renderBase() {
        this.container.innerHTML = `
            <div class="image-upload-section no-image" style="position: relative;">
                <h4>Upload Image</h4>
                
                <div class="image-actions">
                    <label class="action-icon upload-icon" title="Choose Image">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                    </label>
                    <div class="action-icon remove-icon" style="display: none;" title="Remove Image">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </div>
                </div>

                <div class="slider-container" style="display: none;">
                    <div style="margin-bottom: 10px;">
                        <input type="checkbox" class="lock-ratio" checked>
                        <label style="display:inline; font-weight:normal; cursor:pointer;">Lock Aspect Ratio</label>
                    </div>
                    <label>Width: <span class="slider-value val-w">300px</span></label>
                    <input type="range" class="slider-w" min="100" max="800" value="300">
                    
                    <label>Height: <span class="slider-value val-h">300px</span></label>
                    <input type="range" class="slider-h" min="100" max="800" value="300">
                </div>

                <div class="image-preview"></div>

                <input type="file" class="file-input" accept="image/*" style="display: none;">
                
                <div class="button-container">
                    <button class="ok-btn">OK</button>
                    <button class="cancel-btn">Cancel</button>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    bindEvents() {
        const input = this.container.querySelector('.file-input');
        const removeBtn = this.container.querySelector('.remove-icon');
        const uploadLabel = this.container.querySelector('.upload-icon');
        const sliderW = this.container.querySelector('.slider-w');
        const sliderH = this.container.querySelector('.slider-h');
        const valW = this.container.querySelector('.val-w');
        const valH = this.container.querySelector('.val-h');
        const lockRatio = this.container.querySelector('.lock-ratio');
        const slidersDiv = this.container.querySelector('.slider-container');
        const preview = this.container.querySelector('.image-preview');
        const sectionWrapper = this.container.querySelector('.image-upload-section');

        const uploadSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
        `;

        const changeSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
        `;

        // File Input
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {

                const reader = new FileReader();
                reader.onload = (ev) => {
                    const src = ev.target.result;
                    this.tempImageData.src = src;
                    this.tempImageData.width = 300;
                    this.tempImageData.height = 300;
                    this.aspectRatio = 1;
                    this.updateUI();
                };
                reader.readAsDataURL(file);
            }
        };

        // Remove Btn
        removeBtn.onclick = () => {
            input.value = '';
            this.tempImageData.src = null;
            this.updateUI();
        };

        // Sliders
        sliderW.oninput = (e) => {
            const w = parseInt(e.target.value);
            this.tempImageData.width = w;
            valW.textContent = w + 'px';
            const img = preview.querySelector('img');
            if (img) img.style.width = w + 'px';

            if (lockRatio.checked) {
                const newH = Math.round(w / this.aspectRatio);
                sliderH.value = newH;
                this.tempImageData.height = newH;
                valH.textContent = newH + 'px';
                if (img) img.style.height = newH + 'px';
            } else {
                this.aspectRatio = w / parseInt(sliderH.value);
            }
        };

        sliderH.oninput = (e) => {
            const h = parseInt(e.target.value);
            this.tempImageData.height = h;
            valH.textContent = h + 'px';
            const img = preview.querySelector('img');
            if (img) img.style.height = h + 'px';

            if (lockRatio.checked) {
                const newW = Math.round(h * this.aspectRatio);
                sliderW.value = newW;
                this.tempImageData.width = newW;
                valW.textContent = newW + 'px';
                if (img) img.style.width = newW + 'px';
            } else {
                this.aspectRatio = parseInt(sliderW.value) / h;
            }
        };

        // Main Buttons
        this.container.querySelector('.ok-btn').onclick = (e) => {
            e.stopPropagation();
            this.save();
        };
        this.container.querySelector('.cancel-btn').onclick = (e) => {
            e.stopPropagation();
            this.cancel();
        };

        // Sync label click to hidden input
        uploadLabel.onclick = () => input.click();
    }

    attachTo(targetElement, initialImageData, onSave, onCancel) {
        this.activeTarget = targetElement;
        this.onSave = onSave;
        this.onCancel = onCancel;
        this.originalImageData = initialImageData ? { ...initialImageData } : null;
        this.tempImageData = initialImageData ? { ...initialImageData } : {
            src: null,
            width: 300,
            height: 300,
            collapsed: false
        };

        this.aspectRatio = (this.tempImageData.width && this.tempImageData.height) ?
            (this.tempImageData.width / this.tempImageData.height) : 1;

        // Clear target and append our container
        targetElement.innerHTML = '';
        targetElement.appendChild(this.container);
        this.container.style.display = 'block';

        this.updateUI();
    }

    updateUI() {
        const imgSrc = this.tempImageData.src;
        const width = this.tempImageData.width || 300;
        const height = this.tempImageData.height || 300;

        const sectionWrapper = this.container.querySelector('.image-upload-section');
        const uploadLabel = this.container.querySelector('.upload-icon');
        const removeBtn = this.container.querySelector('.remove-icon');
        const slidersDiv = this.container.querySelector('.slider-container');
        const preview = this.container.querySelector('.image-preview');
        const sliderW = this.container.querySelector('.slider-w');
        const sliderH = this.container.querySelector('.slider-h');
        const valW = this.container.querySelector('.val-w');
        const valH = this.container.querySelector('.val-h');
        const h4 = this.container.querySelector('h4');

        const uploadSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
        `;

        const changeSVG = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
        `;

        if (imgSrc) {
            sectionWrapper.classList.remove('no-image');
            sectionWrapper.classList.add('has-image');
            h4.textContent = 'Edit Image';
            uploadLabel.title = 'Change Image';
            uploadLabel.innerHTML = changeSVG;
            removeBtn.style.display = 'flex';
            slidersDiv.style.display = 'block';
            preview.innerHTML = `<img src="${imgSrc}" style="width: ${width}px; height: ${height}px;">`;

            sliderW.value = width;
            sliderH.value = height;
            valW.textContent = width + 'px';
            valH.textContent = height + 'px';
        } else {
            sectionWrapper.classList.remove('has-image');
            sectionWrapper.classList.add('no-image');
            h4.textContent = 'Upload Image';
            uploadLabel.title = 'Choose Image';
            uploadLabel.innerHTML = uploadSVG;
            removeBtn.style.display = 'none';
            slidersDiv.style.display = 'none';
            preview.innerHTML = '';
        }
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
        const data = this.tempImageData.src ? { ...this.tempImageData } : null;
        if (this.onSave) this.onSave(data);
        this.detach();
    }

    cancel() {
        if (this.onCancel) this.onCancel();
        this.detach();
    }

    getImageData() {
        return this.tempImageData;
    }
}

export default ImageEditor;
