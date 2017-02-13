;(function(undefined) {
  'use strict';

  if (typeof sigma === 'undefined')
    throw 'sigma is not declared';

  // Initialize package:
  sigma.utils.pkg('sigma.parsers');

  /**
   * If the first arguments is a valid URL, this function loads a TLP file and
   * creates a new sigma instance or updates the graph of a given instance. It
   * is possible to give a callback that will be executed at the end of the
   * process. And if the first argument is a DOM element, it will skip the
   * loading step and parse the given XML tree to fill the graph.
   *
   * @param  {string|DOMElement} target   The URL of the TLP file or a valid
   *                                      TLP tree.
   * @param  {object|sigma}      sig      A sigma configuration object or a
   *                                      sigma instance.
   * @param  {?function}         callback Eventually a callback to execute
   *                                      after having parsed the file. It will
   *                                      be called with the related sigma
   *                                      instance as parameter.
   */
  sigma.parsers.tlp = function(target, sig, callback) {
    var i,
        l,
        arr,
        obj;

    function parse(graph) {
      // Adapt the graph:
      arr = graph.nodes;
        var tmp = "";

      for (i = 0, l = arr.length; i < l; i++) {
        obj = arr[i];

        //obj.id = obj.id;
        obj.label = obj.viewLabel;
        tmp = obj.viewLayout
        tmp = obj.viewLayout.substring(1,tmp.length-1).split(',');
        obj.x = Number(tmp[0]);
        obj.y = -Number(tmp[1]);
        tmp = obj.viewSize
        tmp = obj.viewSize.substring(1,tmp.length-1).split(',');
        obj.size = (Number(tmp[0])+Number(tmp[1]));
        tmp = obj.viewColor
        tmp= tmp.substring(1,tmp.length-1).split(',');
        obj.color = "rgba("+parseInt(tmp[0])+","+parseInt(tmp[1])+","+parseInt(tmp[2])+","+parseInt(tmp[3])+")";
      }

      arr = graph.edges;
      for (i = 0, l = arr.length; i < l; i++) {
        obj = arr[i];

        //obj.id = typeof obj.id === 'string' ? obj.id : edgeId();
        //obj.source = '' + obj.source;
        //obj.target = '' + obj.target;
        obj.label = obj.viewLabel;
        tmp = obj.viewSize
        tmp = obj.viewSize.substring(1,tmp.length-1).split(',');
        obj.size = (Number(tmp[0])+Number(tmp[1]))/2;
        tmp = obj.viewColor
        tmp = obj.viewColor.substring(1,tmp.length-1).split(',');
        obj.color = "rgba("+parseInt(tmp[0])+","+parseInt(tmp[1])+","+parseInt(tmp[2])+","+parseInt(tmp[3])+")";
        obj.direction = "undirected";
      }

      // Update the instance's graph:
      if (sig instanceof sigma) {
        sig.graph.clear();

        arr = graph.nodes;
        for (i = 0, l = arr.length; i < l; i++)
          sig.graph.addNode(arr[i]);

        arr = graph.edges;
        for (i = 0, l = arr.length; i < l; i++)
          sig.graph.addEdge(arr[i]);

      // ...or instantiate sigma if needed:
      } else if (typeof sig === 'object') {
        sig.graph = graph;
        sig = new sigma(sig);

      // ...or it's finally the callback:
      } else if (typeof sig === 'function') {
        callback = sig;
        sig = null;
      }

      // Call the callback if specified:
      if (callback) {
        callback(sig || graph);
        return;
      } else
        return graph;
    }

    if (typeof target === 'string')
      tlp.fetch(target, parse);
    else if (typeof target === 'object')
      return parse(tlp.parse(target));
  };
}).call(this);
