//手写深拷贝

function Cat(name) {
  this.name = name;
  //   return []
}
Cat.prototype.say = function () {
  console.log(this.name);
};

function deduplication(arr) {
  return Array.from(new Set(arr));
}

{
  console.log(deduplication([1, 2, 3, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1]));
}

function deduplication2(arr) {
  const set = new Set();
  for (let i = 0; i < arr.length; i++) {
    if (!set.has(arr[i])) {
      set.add(arr[i]);
    } else {
      arr.splice(i, 1);
      i--;
    }
  }
}

{
  const arr = [1, 2, 3, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1];
  deduplication2(arr);
  console.log('2:', arr);
}

function deduplication3(arr) {
  return arr.filter((item, index) => arr.indexOf(item) === index);
}

{
  const arr = [1, 2, 3, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1];
  console.log('3:', deduplication3(arr));
}

function deepClone(source, map = new Map()) {
  if (map.get(source)) {
    return map.get(source);
  }
  if (source instanceof Object) {
    let dist;
    if (source instanceof Array) {
      dist = new Array();
    } else if (source instanceof Function) {
      dist = function (...args) {
        return source.call(null, ...args);
      };
    } else if (source instanceof RegExp) {
      dist = new RegExp(source.source, source.flags);
    } else if (source instanceof Date) {
      dist = new Date(source);
    } else {
      dist = new Object();
    }
    map.set(source, dist);
    for (let key in source) {
      if (source.hasOwnProperty(key)) {
        dist[key] = deepClone(source[key], map);
      }
    }
    return dist;
  } else {
    return source;
  }
}

{
  let a = [1, 2, 3, 4, 5, [1, 2, 3]];
  let b = deepClone(a);
  console.log(a, b, a === b);
}

{
  let a = (a, b) => a + b;
  let b = deepClone(a);
  console.log(a(1, 2), b(1, 2), a === b);
}

{
  let a = {
    b: 1,
    c: '12',
    d: { aa: 1, bb: false },
    e: [1, 2, 3, 4, 5],
  };

  let b = JSON.parse(JSON.stringify(a));

  console.log(a);
  console.log(b);
  console.log(a === b);
}

{
  console.log('-------环--------');
  const a = { name: 'jack' };
  a.self = a;
  const a2 = deepClone(a);
  console.log(a, a2, a !== a2);
  console.log(a.name === a2.name);
  console.log(a.self !== a2.self);
}

function trim(s) {
  return s.replace(/(^\s?) | (\s?$)/g, '');
}

console.log(trim('  aaaa   '));
console.log('  aaaa   ');

function curry(fn, params = []) {
  return function (...args) {
    if (params.length + args.length === fn.length) {
      return fn(...params, ...args);
    } else {
      return curry(fn, [...params, ...args]);
    }
  };
}

{
  const add = (a, b, c, d) => a + b + c + d;
  const newAdd = curry(add);
  console.log(newAdd(1)(2)(3)(4));
  console.log(newAdd(1, 2)(3, 4));
}

class EventHub {
  constructor() {
    this.cache = {}; // [{name: fn1,fn2,fn3}]
  }
  on(name, fn) {
    this.cache[name] = this.cache[name] || [];
    this.cache[name].push(fn);
  }
  off(name, fn) {
    let idx = (this.cache[name] || []).indexOf(fn);
    if (idx >= 0) this.cache[name].splice(idx, 1);
  }
  emit(name, ...args) {
    (this.cache[name] || []).forEach((fn) => fn(...args));
  }
}

const test1 = (message) => {
  const eventHub = new EventHub();
  console.assert(eventHub instanceof Object === true, 'eventHub是个对象');
  console.log(message);
};

// On Emit
const test2 = (message) => {
  const eventHub = new EventHub();
  let called = false;
  eventHub.on('xxx', (y, z) => {
    called = true;
    console.assert('y', y, y === '今天林志玲结婚了');
    console.assert('z', z, z === 'zzz');
  });
  eventHub.emit('xxx', '今天林志玲结婚了', 'zzz');
  setTimeout(() => {
    console.assert('called:', called, called === true);
  }, 1000);
  console.log(message);
};

const test3 = (message) => {
  const eventHub = new EventHub();
  let called = false;
  let fn1 = () => {
    called = true;
  };
  eventHub.on('yyy', fn1);
  eventHub.off('yyy', fn1);
  eventHub.emit('yyy');
  setTimeout(() => {
    console.assert(called === false);
  }, 1000);
  console.log(message);
};

test1('eventHub 可以创建对象');
test2('on之后 emit 函数会执行');
test3('off有效');

function myInstanceof(source, target) {
  if (typeof source !== 'object' && source !== null) {
    throw new Error();
  }
  if (typeof target !== 'function') {
    throw new Error();
  }
  let p = source;
  while (p) {
    if (p === target.prototype) return true;
    p = p.__proto__;
  }
  return false;
}

{
  const c = new Cat('jack');
  console.log(myInstanceof([], Array));
  console.log(myInstanceof([], Object));
  console.log(myInstanceof([], Function));
  console.log(myInstanceof(c, Cat));
}

function myNew(fn, ...args) {
  if (typeof fn !== 'function') throw new Error();
  const obj = Object.create(fn.prototype);
  const res = fn.call(obj, ...args);
  return typeof res === 'object' && res !== null ? res : obj;
}

{
  function Cat2(name) {
    this.name = name;
    // return [];
  }
  const c = myNew(Cat, 'j');
  console.log(c);
  c.say();
  console.log(myNew(Cat2, 'a'));
}

Function.prototype.mybind = function (thisArg, ...args) {
  const fn = this;
  function bindFn(...rest) {
    if (this instanceof bindFn) {
      const ctx = Object.create(fn.prototype);
      fn.call(ctx, ...args, ...rest);
      return ctx;
    } else {
      return fn.call(thisArg, ...args, ...rest);
    }
  }
  return bindFn;
};

{
  const a = (a, b) => a + b;

  const fa = a.mybind({}, 1, 2);

  console.log(fa());

  const myCat = Cat.mybind({ name: 'jact' });

  const cat = new myCat('hua');
  console.log(cat);
  cat.say();
}

Function.prototype.mycall = function (thisArg, ...args) {
  const fn = this;
  const ctx = thisArg;
  const symbol = Symbol();
  Object.prototype[symbol] = fn;
  const res = ctx[symbol](...args);
  delete Object[symbol];
  return res;
};

{
  function b(aa) {
    return this.a + aa;
  }

  console.log(b.mycall({ a: 1 }, 4));
  console.log(b.mycall({ a: 2 }, 4));

  function c(bb, aa) {
    return bb + aa;
  }
  console.log(c.mycall({ a: 2 }, 4, 1));
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

function throttle(fn, delay) {
  let timer;
  return function (...args) {
    if (timer) return;
    fn(...args);
    timer = setTimeout(() => {
      timer = null;
    }, delay);
  };
}

Array.prototype.mymap = function (fn) {
  const arr = this;
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    res.push(fn(arr[i], i, arr));
  }
  return res;
};

{
  const a = [1, 2, 3, 4, 5];

  const b = a.mymap((item) => item * 2);
  console.log(b);
}

Array.prototype.myfilter = function (fn) {
  const arr = this;
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i], i, arr)) res.push(arr[i]);
  }
  return res;
};

{
  const a = [1, 2, 3, 4, 5];

  const b = a.myfilter((item) => item % 2 === 0);
  console.log(b);
}

Array.prototype.myreduce = function (fn, init) {
  const arr = this;
  let prev = init || arr[0];
  let i = init ? 0 : 1;
  for (; i < arr.length; i++) {
    const cur = arr[i];
    prev = fn(prev, cur, i, arr);
  }
  return prev;
};

{
  const a = [1, 2, 3, 4, 5, 6];
  const d = a.myreduce((prev, cur) => {
    return prev + cur;
  });

  const e = a.reduce((prev, cur) => {
    return prev + cur;
  });

  console.log(d, e);
}

Array.prototype.myflat = function () {
  const arr = this;
  let tmp = [];
  arr.forEach((item) => {
    tmp = tmp.concat(Array.isArray(item) ? item.myflat() : item);
  });
  return tmp;
};

{
  const a = [1, 2, 3, [4, 5, 6, [7, 8, [9]]], 4, 5, 6, [8, 8, 8]];
  console.log(a.myflat());
}

/**
 * 实现一个LazyMan，可以按照以下方式调用:
LazyMan(“Hank”)输出:
Hi! This is Hank!

LazyMan(“Hank”).sleep(10).eat(“dinner”)输出
Hi! This is Hank!
//等待10秒..
Wake up after 10
Eat dinner~

LazyMan(“Hank”).eat(“dinner”).eat(“supper”)输出
Hi This is Hank!
Eat dinner~
Eat supper~

LazyMan(“Hank”).sleepFirst(5).eat(“supper”)输出
//等待5秒
Wake up after 5
Hi This is Hank!
Eat supper
以此类推。 */

function LazyMan(name) {
  let queue = [];
  let next = () => {
    const first = queue.shift();
    first?.();
  };
  const task = () => {
    console.log(`Hello I am ${name}`);
    next();
  };
  queue.push(task);
  let api = {
    eat(type) {
      const task = () => {
        console.log(
          `I am eating,it's ${type === 'lunch' ? 'lunch' : 'dinner'}`
        );
        next();
      };
      queue.push(task);
      return api;
    },
    sleep(time) {
      const task = () => {
        setTimeout(() => {
          console.log(`I wake up, I sleep ${time}s`);
          next();
        }, time * 1000);
      };
      queue.push(task);
      return api;
    },
    sleepFirst(time) {
      const task = () => {
        setTimeout(() => {
          console.log(`I wake up, I sleep ${time} s`);
          next();
        }, time * 1000);
      };
      queue.unshift(task);
      return api;
    },
  };
  setTimeout(next);
  return api;
}

LazyMan('jack').sleepFirst(5).eat('lunch').sleep(3).eat('dinner');
