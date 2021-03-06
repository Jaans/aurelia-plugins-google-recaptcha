import {inject} from 'aurelia-dependency-injection';
import {bindable,customElement,noView} from 'aurelia-templating';

// PUBLIC CLASS
export class Config {
  // PRIVATE PROPERTIES
  _config;

  // CONSTRUCTOR
  constructor() {
    this._config = { hl: 'en', siteKey: '' };
  }

  // PUBLIC METHODS
  get(key) {
    return this._config[key];
  }

  options(obj) {
    Object.assign(this._config, obj);
  }

  set(key, value) {
    this._config[key] = value;
    return this._config[key];
  }
}

// IMPORTS
// CLASS ATTRIBUTES
@customElement('aup-google-recaptcha')
@noView()
@inject(Element, Config)


// PUBLIC CLASS
export class Recaptcha {
  // PRIVATE PROPERTIES (DI)
  _config;
  _element;

  // PRIVATE PROPERTIES (CUSTOM)
  _scriptPromise = null;

  // BINDABLE PROPERTIES
  @bindable callback;
  @bindable size = 'normal';
  @bindable theme = 'light';
  @bindable type = 'image';
  @bindable widgetId;

  // CONSTRUCTOR
  constructor(element, config) {
    this._config = config;
    this._element = element;
    if (!this._config.get('siteKey')) return console.error('No sitekey has been specified.');
    this._loadApiScript();
  }

  // AURELIA LIFECYCLE METHODS
  bind() {
    this._initialize();
  }

  // PRIVATE METHODS
  async _initialize() {
    await this._scriptPromise;
    this.widgetId = window.grecaptcha.render(this._element, { callback: this.callback, sitekey: this._config.get('siteKey'), size: this.size, theme: this.theme, type: this.type });
  }

  _loadApiScript() {
    if (this._scriptPromise) return;
    if (window.grecaptcha === undefined) {
      let script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.src = `https://www.google.com/recaptcha/api.js?hl=${this._config.get('hl')}&onload=aureliaPluginsGoogleRecaptchaOnLoad&render=explicit`;
      script.type = 'text/javascript';
      document.head.appendChild(script);
      this._scriptPromise = new Promise((resolve, reject) => {
        window.aureliaPluginsGoogleRecaptchaOnLoad = () => { resolve(); };
        script.onerror = error => { reject(error); };
      });
    } else if (window.grecaptcha) {
      this._scriptPromise = new Promise(resolve => { resolve(); });
    }
  }
}

// IMPORTS
// PUBLIC METHODS
export function configure(aurelia, configCallback) {
  let instance = aurelia.container.get(Config);
  if (configCallback !== undefined && typeof(configCallback) === 'function') {
    configCallback(instance);
  }

  aurelia.globalResources('./aurelia-plugins-google-recaptcha-element');
}
