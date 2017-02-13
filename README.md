sigma.parsers.tlp
==================

Plugin developed by [Jason Vallet](https://github.com/jason-vallet). Inspired from [sigma.parsers.gexf](https://github.com/jacomyal/sigma.js/tree/master/plugins/sigma.parsers.gexf), developed by [Alexis Jacomy](https://github.com/jacomyal).

---

This plugin provides a single function, `sigma.parsers.tlp()`, that will load a tlp encoded file, parse it, and instantiate sigma.

The most basic way to use this helper is to call it with a path and a sigma configuration object. It will then instantiate sigma, but after having added the graph into the config object.

````javascript
sigma.parsers.tlp(
  'myGraph.tlp',
  { container: 'myContainer' }
);
````

It is also possible to update an existing instance's graph instead.

````javascript
sigma.parsers.tlp(
  'myGraph.tlp',
  myExistingInstance,
  function() {
    myExistingInstance.refresh();
  }
);
````

To copy in the plugins directory.
