// @ts-ignore
import {convert} from 'css-color-function';
import {getFile, replaceAll} from './core';

interface DynamicThemeOptions {
  autoLoad?: boolean; // 是否根据meta加载主题色
  cssUrl: string; // 获取主题样式文件的url
  primaryColor: string; // vars.styl 跟随样式文件变量值，初始化使用
}

class DynamicTheme {
  get cssUrl(): string {
    return this._cssUrl;
  }

  private get cacheColor(): string {
    return this._cacheColor;
  }

  private set cacheColor(value: string) {
    this._cacheColor = value;
  }

  get primaryColor(): string {
    return this._primaryColor;
  }

  set primaryColor(value: string) {
    // this._primaryColor = value;
    this.cacheColor = value;
    this.generateColors();
  }

  private get colorFormula(): StringMap {
    return this._colorFormula;
  }

  private get template(): string {
    return this._template;
  }

  private set template(value: string) {
    this._template = value;
  }

  private get colorDescMap(): StringMap {
    return this._colorDescMap;
  }

  private readonly _colorFormula: StringMap = {
    'light-1': 'color(primary a(10%))',
    'light-2': 'color(primary a(20%))',
    'light-3': 'color(primary a(30%))',
    'light-4': 'color(primary a(40%))',
    'light-5': 'color(primary a(50%))',
    'light-6': 'color(primary a(60%))',
    'light-7': 'color(primary a(70%))',
    'light-8': 'color(primary a(80%))',
    'light-9': 'color(primary a(90%))',
  };

  private _colorDescMap: StringMap = {};

  private _primaryColor = '';

  private _cacheColor = '';

  private _template = '';

  private readonly _cssUrl: string;

  constructor(options: DynamicThemeOptions) {
    const {autoLoad, cssUrl, primaryColor} = options;
    this._cssUrl = cssUrl;
    this._primaryColor = primaryColor;
    if (autoLoad) {
      const meta = document.querySelector('meta[name=theme-color]');
      const primary = meta?.getAttribute('content');
      if (primary) {
        setTimeout(() => {
          this.primaryColor = primary;
        });
      }
    }
    this.generateColors();
  }

  // 根据主题色，用css-color-function 生成颜色表
  private generateColors() {
    const color = this.cacheColor || this.primaryColor;
    this.colorDescMap[color] = 'primary';
    Object.keys(this.colorFormula).forEach((key) => {
      const value = this.colorFormula[key].replace(/primary/g, color);
      // todo 忽略空格
      this.colorDescMap[convert(value).replace(/\s/g, '')] = key;
    });
    !this.template && this.initTemplate();
    this.changeTheme();
  }

  // 初始值变量替换
  private replaceTemplate(styleText: string) {
    let str = styleText;
    // todo 忽略空格
    Object.keys(this.colorDescMap).forEach((key) => {
      const value = this.colorDescMap[key];
      str = replaceAll(str, key, value).replace(new RegExp(key, 'ig'), value);
    });
    return str;
  }

  // 生成替换后的变量模版  开发和生产 获取原始样式方式不同
  private async initTemplate(): Promise<void> {
    if (process.env.NODE_ENV === 'development') {
      const targetStyle = document.querySelector('.dynamic-theme');
      const styles = targetStyle ? [targetStyle] : [...document.querySelectorAll('style')];
      this.template = styles.map((style) => this.replaceTemplate(style.innerHTML)).join('\n');
    } else {
      try {
        const res: any = await getFile(this.cssUrl);
        // todo file path
        this.template = res?.data;
      } catch {
        throw new Error('Error:[Dynamic Theme] can not get css stylesheet file');
      }
    }
  }

  // 替换主题，写入head
  private changeTheme() {
    const colorMap: StringMap = Object
      .keys(this.colorDescMap)
      .reduce((p, c) => ({...p, [this.colorDescMap[c]]: c}), {});
    if (colorMap?.primary === this.primaryColor) return;
    const targetStyle = document.querySelector('.dynamic-theme');
    let newTemp = this.template;
    Object.keys(colorMap).forEach((key) => {
      newTemp = newTemp.replace(new RegExp(key, 'ig'), colorMap[key]);
    });
    const styleEl = document.createElement('style');
    styleEl.innerHTML = newTemp;
    styleEl.className = 'dynamic-theme';
    targetStyle
      ? document.head.replaceChild(styleEl, targetStyle)
      : document.head.appendChild(styleEl);
    this._primaryColor = this.cacheColor;
  }
}

// 单例
function dynamicThemeFactory() {
  let instance: DynamicTheme;
  return (options: DynamicThemeOptions): DynamicTheme => {
    if (!instance) {
      instance = new DynamicTheme(options);
      return instance;
    }
    return instance;
  };
}

export default dynamicThemeFactory();
