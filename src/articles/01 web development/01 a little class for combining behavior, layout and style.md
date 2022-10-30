# a little class for combining behavior, layout and style

### 2018-7-30

I like some of what React offers. I also think it's bloated, over-hyped,
over-engineered and it sees the web as a compile target rather than a
development platform.

I like most of what Web Components offer, they're a part of the
[web platform][web]. They offer real encapsulation &nbsp;&mdash;&nbsp; for css.
And like most web APIs designed by consensus, they're awkward.

![img](https://raw.githubusercontent.com/heapwolf/tonic/master/readme-tonic.png)

Tonic is about 250 lines of code. It borrows goals and ideas from React but is
built on native Web Components. It works in all browsers. It's stable. It's the
*minimum* of what is needed to organize application code, the flow of data and
accommodate component based architecture.

You can find the core library [here][1] and a collection of components [here][2]
on Github.

### 2019-7-3 Update

Tonic is about a year old. To celebrate a year without any new features, let's
add a new feature...

Your render function can now be [`async`][3] or an [`async generator`][4]. This
provides a declaritive way to express the intent of your render method. For
example...

```js
class SomeComponent extends Tonic {
  async * render () {

    yield loadingState()

    return await getStuff()
  }
}
```

[web]:https://en.wikipedia.org/wiki/Web_platform
[0]:https://caniuse.com/#search=web%20components
[1]:https://github.com/heapwolf/tonic/
[2]:https://heapwolf.github.io/components/
[3]:https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
[4]:https://github.com/tc39/proposal-async-iteration#async-generator-functions
