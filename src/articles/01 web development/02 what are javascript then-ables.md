# What are javascript then-ables

*async / await* improves program flow and reduces the number of callbacks in
your code. The `await` keyword can be used to pause the current code path and
wait for an async function to return a value without blocking the [event loop][0].

```js
async function main () {
  console.log('started')
  await sleep(100)
  console.log('finished')
}

main()
```

An implementation for the `sleep` function might look like this...

```js
const sleep = n => new Promise(r => setTimeout(r, n))
```

However, as this example demonstrates, the code in the promise starts executing
immediately. Promises are eager (as opposed to being *lazy*), and sometimes we
want them to be lazy. [Here][1] is a detailed explaination of why an eager
promise may not be what you want.

A then-able is lazy. It has no constructor. It's any function, object or class
that implements a `then` method.

### Await-able Classes
To create an async class, implement a `then` method on it!

```js
class Foo {
  then (resolve, reject) {
    resolve(42)
  }
}

async function main () {
  const answer = await new Foo()
  // answer === 42
}
main()
```

### Await-able Objects
You can do the same thing with an object. You can name the callback
functions whatever you want. Also, you aren't required to use or care
about the `rejection` callback.

```js
const Foo = {
  then (resolve) {
    setTimeout(() => resolve(42), 1024)
  }
}

async function main () {
  const answer = await Foo
  // answer === 42
}
main()
```

### Await-able object factories

```js
const Foo = num => ({
  then (resolve) {
    setTimeout(() => resolve(num), 1024)
  }
})

async function main () {
  const answer = await Foo(42)
}
main()
```

### Async then-ables
Object and class methods can use the async keyword, just like functions.

```js
const Foo = {
  async then (resolve) {
    resolve(await request('https://foo.com'))
  }
}
```

Destructuring assignments provide a way to return multiple values...

```js
class Foo {
  then (resolve) {
    request('https://foo.com', (err, res) => resolve({ err, res }))
  }
}

async function main () {
  const { err, res } = await new Foo

  // More than one err? Const is block-scoped!
  {
    const { err, res } = await new Foo
  }

  // Destructured values can also be aliased.
  const { err: namedError, res: namedResponse } = await new Foo
}
main()
```

[0]:https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
[1]:https://staltz.com/promises-are-not-neutral-enough.html
