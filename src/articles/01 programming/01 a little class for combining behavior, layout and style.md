# a little class for combining behavior, layout and style

### 2018-08-02

I don't use Javascript frameworks, so React appeals to me. I like how it
organizes ideas. I like its top-down, one-way flow of data. But I also think
some of its usefulness is debatable. It has a big island of tooling that's going
in a very different direction than the rest of the web. Like Coffeescript or
jQuery, in 5 years it will probably inspire standards bodies with its best
features.

I also like Web Components, they're great because they offer true, native
encapsulation &nbsp;&mdash;&nbsp; no hacks. They are mostly the result of
consensus among the web's working groups. But they're awkward, and already feel
outdated. They also [only work][1] well in Chrome.

![img](https://raw.githubusercontent.com/hxoht/tonic/addimage/readme-tonic.png)

I'd like to introduce Tonic. It's about 150 lines of code. It combines some of
the goals and ideas of React and Web Components. It works in all browsers. Its
intented to provide the *minimum* of what is needed to organize application
code, the flow of data and accommodate component based architecture.

You can find the project [here][0] on Github.

[0]:https://github.com/hxoht/tonic/
[1]:https://caniuse.com/#search=web%20components
