# aurelia-hot-module-reload

Core functionality for Aurelia's Hot Module Reload (HMR) capabilities, which is shared by all loaders and tools.

This library is part of the [Aurelia](http://www.aurelia.io/) platform and contains an implementation of Aurelia's loader interface to enable webpack.

> To keep up to date on [Aurelia](http://www.aurelia.io/), please visit and subscribe to [the official blog](http://blog.aurelia.io/) and [our email list](http://eepurl.com/ces50j). We also invite you to [follow us on twitter](https://twitter.com/aureliaeffect). If you have questions, please [join our community on Gitter](https://gitter.im/aurelia/discuss) or use [stack overflow](http://stackoverflow.com/search?q=aurelia). Documentation can be found [in our developer hub](http://aurelia.io/hub.html). If you would like to have deeper insight into our development process, please install the [ZenHub](https://zenhub.io) Chrome or Firefox Extension and visit any of our repository's boards.

## TODO

- [ ] decorators for ViewModels or maybe a one-time, global option
  `@hotReloadPrototype`: instead of creating a new instance, just swap prototypes and delete non-existent properites
  swapping proto: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf
  `@hotReloadMerge`: unbind, make fresh BindingContext, Object.assign (no getters/setters) from old BindingContext, bind
- [ ] by default all aurelia-loaded modules should be hot-reloadable, by unbinding and re-binding with a fresh BindingContext
- [ ] fully cycle unbind-create-bind when constructor has changed
