/*
*  webpack require.context 自动引入
*  1. target为对象时，返回target，文件名为key，default为value
*  2. 为数组时，返回target为每个文件的default
*/
export function loadModules<T extends Iterable<any>>(modules: any, target: T): T {
  const isArray = Array.isArray(target);
  return modules.keys().reduce((p: T, c: string) => {
    const name = c.replace(/(?<path>\.\/)|(?<ext>\.\w+$)/g, '');
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

/*
*  todo
*  RegExp(str) 不能匹配带'.'的string
*  e.g. background:rgba(12,12,12,.4)
*/
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

/*
*  延迟执行
*  source： tj/co- thunkify
*/
export function thunk(fn: Function) {
  return function (...args: any) {
    return function () {
      fn(args);
    };
  };
}

/*
* 默认promise.all
*/
export function promiseAny(arr: Promise<any>[], length = arr.length) {
  return new Promise((resolve, reject) => {
    let res: any = [];
    arr.forEach(p => {
      Promise.resolve(p).then(r => {
        res.push(r);
        if (res.length === length) resolve(res);
      }, reject);
    });
  });
}
