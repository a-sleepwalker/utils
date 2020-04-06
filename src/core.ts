// lodash
// import {camelCase} from 'lodash';

// css module shorter classname
export function getClsName(prefix: string, styleModule: any): { [k: string]: CSSStyleDeclaration } {
  return Object.keys(styleModule).reduce((p, c) => {
    // const clsName = camelCase(c.replace(`${prefix}-`, ''));
    const clsName = c.replace(`${prefix}-`, '');
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

export function loadModules<T>(modules: any, target: T, ext = 'ts'): T {
  const isArray = Array.isArray(target);
  return modules.keys().reduce((p: any, c: string) => {
    const name = c.replace(new RegExp(`./|.${ext}`, 'g'), '');
    return isArray
      ? [...p, modules(c).default]
      : {...p, [name]: modules(c).default};
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

export function randomIntValue(max: number, min = 0): number {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function randomStr(len: number) {
  // ASCII
  const [start, end] = [33, 126];
  return Array(len).fill('').map(() => String.fromCharCode(randomIntValue(end, start))).join('');
}

export function shuffle<T extends Array<any> = []>(arr: T): T[] {
  const l = arr.length;
  let res = arr.slice();
  for (let i = l - 1; i > 0; i--) {
    let j = randomIntValue(i);
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

export function calcStrLen(str = '') {
  const reg = /(?<otherLetter>\p{Lo})/ug;
  const res = str.match(reg) ?? '';
  return str.length + 2 * (res.length);
}

export function array2tree(arr: Array<any>, options: any) {
  if (!Array.isArray(arr)) return;
  const nodes = arr.slice();
  const {key = 'id', parentKey = 'pid', childrenKey = 'children'} = options;
  const result: any = [];
  const keyMap = nodes.reduce((p, c) => ({...p, [c[key]]: c}), {});
  nodes.forEach((n) => {
    // const parent = nodes.find(p => p[key] === n[parentKey]);
    const parent = keyMap[n[parentKey]];
    if (parent) {
      if (!parent[childrenKey]) {
        parent[childrenKey] = [];
      }
      parent[childrenKey].push(n);
    } else {
      result.push(n);
    }
  });
  return result;
}

export function thunk(fn: Function) {
  return function (...args: any) {
    return function () {
      fn(args);
    };
  };
}

export function promiseAll(arr: Promise<any>[]) {
  return new Promise((resolve, reject) => {
    let res: any = [];
    arr.forEach(p => {
      Promise.resolve(p).then(r => {
        res.push(r);
        if (res.length === arr.length) resolve(res);
      }, reject);
    });
  });
}
