# a little class for combining behavior, layout and style

### 2019-04-30

I like some of what React offers. I also think it's bloated, over-hyped,
over-engineered and it sees the web as a compile target rather than a
development platform.

I like most of what Web Components offer, they're a part of the
[web platform][web]. They offer true component encapsulation &nbsp;&mdash;&nbsp;
without hacks. They are the result of consensus among the web's working groups.
And like most APIs designed by consensus, they are a little awkward.

![img](https://raw.githubusercontent.com/heapwolf/tonic/master/readme-tonic.png)

Tonic is about 250 lines of code. It borrows goals and ideas from React but is
built on native Web Components. It works in all browsers. It's the *minimum* of
what is needed to organize application code, the flow of data and accommodate
component based architecture.

You can find the core library [here][1] and a collection of components [here][2]
on Github.

[web]:https://en.wikipedia.org/wiki/Web_platform
[0]:https://caniuse.com/#search=web%20components
[1]:https://github.com/heapwolf/tonic/
[2]:https://heapwolf.github.io/components/
