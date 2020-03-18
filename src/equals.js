/**
 * @author taowt <msuserting@hotmail.com>
 * @param arr
 * @param inorder true: the arr must match the index of the invoking array ; false , just include the value. default true.
 * @returns {Boolean}
 */
// todo NaN === NaN false
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (arr, inorder = true) {
    // if the other array is a falsy value, return
    if (!arr) {
        return false;
    }

    // if the argument is not array, return
    if (!Array.isArray(arr)) {
        return false;
    }

    // compare lengths - can save a lot of time
    let l = arr.length;
    if (this.length !== l) {
        return false;
    }

    if (inorder) {
        for (let i = 0; i < l; i++) {
            const ori = this[i];
            const tar = arr[i];
            // Check if we have nested arrays
            if (Array.isArray(ori) && Array.isArray(tar)) {
                // recurse into the nested arrays
                if (!ori.equals(tar, inorder)) {
                    return false;
                }
            } else if (toString.call(ori) === '[object Object]' && toString.call(tar) === '[object Object]') {
                if (!ori.equals(tar)) {
                    return false;
                }
            } else if (ori !== tar) {
                return false;
            }
        }
        return true;
    } else {
        //copy the arr in case of changing original values
        let copy = arr.map(v => v);
        for (let i = 0; i < l; i++) {
            const ori = this[i];
            //check if we have arrays
            if (Array.isArray(ori)) {
                let flag = false;
                // check if the argument array has an array with the same values
                for (let j = 0, cl = copy.length; j < cl; j++) {
                    if (Array.isArray(copy[j])) {
                        if (ori.equals(copy[j], inorder)) {
                            flag = true;
                        }
                    }
                }
                // if couldn't found one , stop the loop
                if (!flag) {
                    return false;
                }
            } else if (toString.call(ori) === '[object Object]') {
                let flag = false;
                for (let j = 0, cl = copy.length; j < cl; j++) {
                    if (toString.call(copy[j]) === '[object Object]') {
                        if (ori.equals(copy[j])) {
                            flag = true;
                        }
                    }
                }
                if (!flag) {
                    return false;
                }
            } else {
                let idx = copy.indexOf(ori);
                if (!~idx) {
                    return false;
                } else {
                    // delete the found item in case of reduplicated comparing
                    copy.splice(idx, 1);
                }
            }
        }
        return true;
    }
};

// Hide method from for-in loops
Object.defineProperty(Array.prototype, 'equals', {enumerable: false});

/**
 * @author taowt <msuserting@hotmail.com>
 * @param obj
 * @returns {boolean}
 */
// todo a = { key : b }, b = { key : a }
Object.prototype.equals = function (obj) {
    if (this === obj) {
        return true;
    }
    if (!obj instanceof Object) {
        return false;
    }
    if (this.isPrototypeOf(obj) || obj.isPrototypeOf(this)) {
        return false;
    }
    if (this.constructor !== obj.constructor) {
        return false;
    }
    if (this.prototype !== obj.prototype) {
        return false;
    }
    if (!Object.keys(this).equals(Object.keys(obj), false)) {
        return false;
    }
    for (const key in this) {
        if (toString.call(this[key]) !== toString.call(obj[key])) {
            return false;
        }
    }
    let flagArr = [];
    for (const key in this) {
        const ori = this[key];
        const tar = obj[key];
        switch (toString.call(ori)) {
            case '[object Null]':
            case '[object Undefined]':
                flagArr.push(true);
                break;
            case '[object Function]':
                flagArr.push(ori.toString() === tar.toString());
                break;
            case '[object RegExp]':
            case '[object Date]':
            case '[object String]':
                flagArr.push('' + ori === '' + tar);
                break;
            case '[object Number]':
                if (ori === ori) {
                    flagArr.push(ori !== 0 || 1 / ori === 1 / tar);
                } else {
                    flagArr.push(true);
                }
                break;
            case '[object Boolean]':
                flagArr.push(+ori === +tar);
                break;
            case '[object Symbol]':
                //todo symbol value defined  for object keys
                flagArr.push(false);
                break;
            case '[object Array]':
                flagArr.push(ori.equals(tar));
                break;
            case '[object Object]':
                flagArr.push(ori.equals(tar));
                break;
            default:
                flagArr.push('UNKNOWN');
                break;
        }
    }
    return flagArr.every(v => v === true);
};