import camelCase from 'camelcase';

// css module shorter classname
export function getClsName(prefix: string, styleModule: any): { [k: string]: CSSStyleDeclaration } {
  return Object.keys(styleModule).reduce((p, c) => {
    const clsName = camelCase(c.replace(`${prefix}-`, ''));
    return Object.assign(p, {[clsName]: styleModule[c]});
  }, {});
}

export function genClsName(...classNames: (string | false)[]): string {
  return classNames
    .flat()
    .map((c) => (c ? c.toLowerCase() : false))
    .filter(Boolean)
    .join(' ');
}

export function loadModules(modules: any, target: [] | {}, ext = 'ts') {
  const isArray: boolean = Array.isArray(target);
  return modules.keys().reduce((p: any, c: string) => {
    const name = c.replace(new RegExp(`./|.${ext}`, 'g'), '');
    return isArray
      ? [...p, modules(c).default]
      : Object.assign(p, {[name]: modules(c).default});
  }, target);
}

export function getFile(url: string, isBlob?: boolean) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.responseType = isBlob ? 'blob' : '';
    xhr.onreadystatechange = () => {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        const urlArr = xhr.responseURL.split('/');
        resolve({data: xhr.response, url: urlArr[urlArr.length - 1]});
      }
      reject(new Error(xhr.statusText));
    };
    xhr.open('GET', url);
    xhr.send();
  });
}

export function replaceAll(str: string, search: string, replacements: string): string {
  return str.includes(search) ? replaceAll(str.replace(search, replacements), search, replacements) : str;
}
