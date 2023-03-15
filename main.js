import './style.css';

function convertToRgba(hex, opacity) {
  const str = hex.replace('#', '');
  const r = parseInt(str.substring(0, 2), 16);
  const g = parseInt(str.substring(2, 4), 16);
  const b = parseInt(str.substring(4, 6), 16);
  
  const result = `rgba(${r}, ${g}, ${b}, ${opacity})`;
  return result;
}

const accordion = document.querySelector('.mw-accordion--group');
const accordionStyles = getComputedStyle(accordion);
const hex = accordionStyles.getPropertyValue('--hover-border-color');
const opacity = accordionStyles.getPropertyValue('--hover-border-opacity');

const rgba = convertToRgba(hex, opacity);

accordion.style.setProperty('--hover-color', rgba);

class Accordion {
  constructor(config) {
    this.state = config.state;
    this.multiple = config.allowMultiple;
    this.show = config.showControls;
    this.accordion = document.querySelector(`[data-id="${config.accordion}"]`);
    if ( !this.accordion ) return;
    this.panels = Array.from(this.accordion.querySelectorAll('.mw-accordion--item'));
    this.triggers = Array.from(this.accordion.querySelectorAll(`[role="button"]`));
    this.containers = Array.from(this.accordion.querySelectorAll(`[role="region"]`));
  }

  buildIcon() {
    this.triggers.forEach(trigger => {
      const icon = document.createElement('div');
      icon.classList.add('mw-accordion--icon');
      trigger.append(icon);
    })
  }

  buildControls() {
    const buttons = ['button', 'button'].map(tagName => document.createElement(tagName));
    buttons.forEach(button => {
      button.setAttribute('type', 'button');
      button.setAttribute('aria-pressed', 'false');
      button.classList.add('mw-accordion--button');
    })
    const [ expand, collapse ] = buttons;

    expand.setAttribute('aria-label', 'Expand all');
    expand.classList.add('mw-accordion--expand');
    expand.innerHTML = 'Expand all';
    collapse.setAttribute('aria-label', 'Collapse all');
    collapse.classList.add('mw-accordion--collapse');
    collapse.innerHTML = 'Collapse all';
    
    const controlWrapper = document.createElement('div');
    controlWrapper.classList.add('mw-accordion--controls');
    controlWrapper.append(collapse, expand);
    
    this.accordion.insertBefore(controlWrapper, this.accordion.firstChild);
    this.handleButtonListeners(buttons);
  }

  triggerButtonEvent(button) {
    button.setAttribute('aria-pressed', true);
    const func = button.getAttribute('aria-label');
    if ( func === 'Expand all' ) {
      this.triggers.forEach(trigger => {
        trigger.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-pressed', 'true');
      })
      this.containers.forEach(container => {
        container.setAttribute('aria-hidden', 'false');
      })
    } else if ( func === 'Collapse all' ) {
      this.triggers.forEach(trigger => {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-pressed', 'false');
      })
      this.containers.forEach(container => {
        container.setAttribute('aria-hidden', 'true');
      })
    }
  }

  handleButtonListeners(buttons) {
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        this.triggerButtonEvent(button);
      })
      button.addEventListener('keydown', e => {
        if ( e.code === 'Space' || e.code === 'Enter' ) {
          this.triggerButtonEvent(button);
        }
      })
      button.addEventListener('blur', () => button.setAttribute('aria-pressed', false) )
    })
  }

  handleContentHeight() {
    this.containers.forEach(container => {
      const height = container.scrollHeight;
      container.style.setProperty('--content-height', `${height}px`);
    })
  }

  handleAttributes(index) {
    const ariaExpanded = this.triggers[index].getAttribute('aria-expanded');
    this.triggers[index].setAttribute('aria-expanded', ariaExpanded === 'true' ? false : true);
    this.triggers[index].setAttribute('aria-pressed', ariaExpanded === 'true' ? false : true);
    this.containers[index].setAttribute('aria-hidden', ariaExpanded === 'true' ? true : false);
  }

  handleFocusListeners () {
    this.panels.forEach((panel, index) => {
      panel.addEventListener('keydown', e => {
        if ( e.code === 'Space' || e.code === 'Enter' ) {
          this.handleAttributes(index);
        }
      })
    })
  }

  handleTriggerListeners() {
    this.triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => {
        if ( this.multiple ) {
          this.handleAttributes(index);
        } else {
          this.triggers.forEach((t, i) => {
            if ( i !== index ) {
              t.setAttribute('aria-expanded', 'false');
              t.setAttribute('aria-pressed', 'false');
              this.containers[i].setAttribute('aria-hidden', 'true');
            } else if ( i === index ) {
              t.setAttribute('aria-expanded', 'true');
              t.setAttribute('aria-pressed', 'true');
              this.containers[i].setAttribute('aria-hidden', 'false');
            }
          })
        }
      });
    })
  }
  
  handleInitialState() {
    this.triggers.forEach((trigger, index) => {
      if ( this.state === 'first' && index === 0 ) {
        trigger.focus()
        trigger.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-pressed', 'true');
        this.containers[0].setAttribute('aria-hidden', 'false');
      } else if ( this.state === 'first' && index !== 0 ) {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-pressed', 'false');
        this.containers[index].setAttribute('aria-hidden', 'true');
      } else if ( this.state === 'expand' ) {
        trigger.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-pressed', 'true');
        this.containers[index].setAttribute('aria-hidden', 'false');
      } else if ( this.state === 'collapse' ) {
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-pressed', 'false');
        this.containers[index].setAttribute('aria-hidden', 'true');
      }

      this.containers[index].style.transition = 'all 0.2s linear'
    })
  }

  load() {
    if ( !this.accordion ) return;
    this.handleContentHeight();
    this.handleInitialState();
    this.handleTriggerListeners();
    this.handleFocusListeners();
    this.buildIcon();
    if ( this.show ) this.buildControls();
  }
}

const accordionConfig = {
  accordion: '1', // the data-id of the accordion
  state: 'first', // options: first, expand, collapse
  allowMultiple: false, // can multiple panels be open at once
  showControls: true, // show expand/collapse all buttons
};

new Accordion(accordionConfig).load();