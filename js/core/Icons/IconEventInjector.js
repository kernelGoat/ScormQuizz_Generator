import Icons from './svgIcons.js';

class IconEventInjector {

    static inject(selector, iconKey, e, handler) {
        const element = document.querySelector(selector);
        if (element && Icons[iconKey]) {
            const h3Element = element.querySelector('h3');
            // If the element contains an <h3>
            if (h3Element) {
                element.innerHTML = Icons[iconKey] + h3Element.outerHTML;
            } else {
                element.innerHTML = Icons[iconKey];
            }
            if (e != "") {

                element.addEventListener(e, handler);
            }
        }
    }

    static injectMultiple(config) {
        config.forEach(({ selector, icon, event, handler }) => {
            this.inject(selector, icon, event, handler);
        });
    }
    // Used to toggle the icons of collapse and uncollapse all 
    static toggleIcons(element, iconKeyTrue, iconKeyFalse, condition) {
        if (condition) {
            element.innerHTML = Icons[iconKeyTrue];
            element.setAttribute('data-collapsed', 'false');
            element.setAttribute('title', 'Collapse All');
        } else {
            element.innerHTML = Icons[iconKeyFalse];
            element.setAttribute('data-collapsed', 'true');
            element.setAttribute('title', 'Uncollapse All');
        }
    }
}

export default IconEventInjector; 
