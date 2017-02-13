;(function(undefined) {
  'use strict';

  /**
   * TLP Library
   * =============
   *
   * Author: VALLET Jason
   * URL: https://github.com/jason-vallet
   * Version: 0.1a
   */


  /**
   * Graph parser.
   * This structure parse a tlp string and return an object containing the
   * parsed graph.
   *
   * @param  {string}     The string of the tlp file to parse.
   * @return {object}     The parsed graph.
   */
  function Graph(tlp_str) {
    var tlp_tab = [];
    var index = -1;

    function _storeAsArray(tab) {
        var str = "";
        var currentString = false;
        var currentElement = false;
        var protected_char = false;
        var commentLine = false;
        while(true) {
            index+=1;
            if (index > tlp_str.length) 
                return tab;
            if (currentString) { //parse string
                if (tlp_str.charAt(index) == '\\') {
                    protected_char = true;
                    str += tlp_str.charAt(index);
                } else if (tlp_str.charAt(index) == '"' && !protected_char) {
                    currentString = false;
                    tab.push(str);
                    str="";
                } else {
                    str += tlp_str.charAt(index);
                    protected_char = false;
                }
                continue;
            }
            if (currentElement) { //parse attribute
                if (tlp_str.charAt(index) == ' ' || tlp_str.charAt(index) == '\n' || tlp_str.charAt(index) == '(' || tlp_str.charAt(index) == ')') {
                    currentElement = false;
                    tab.push(str);
                    str="";
                    if (tlp_str.charAt(index) == ' ' || tlp_str.charAt(index) == '\n')
                        continue;
                } else {
                    str += tlp_str.charAt(index);
                    continue;
                }
            }
            if (tlp_str.charAt(index) == '"') {
                currentString = true;
                continue;
            }
            if (tlp_str.charAt(index) == '(') {
                tab.push(_storeAsArray([]));
                if (commentLine) {
                    tab.pop();
                }
                continue;
            }
            if (tlp_str.charAt(index) == ')') {
                return tab;
            }
            if (tlp_str.charAt(index) == '\n') {
                commentLine = false;
                continue;
            }
            if (tlp_str.charAt(index) == ' ') {
                continue;
            }
            if (tlp_str.charAt(index) == ';') {
                commentLine = true;
                continue;
            }
            str = tlp_str.charAt(index);
            currentElement = true;
        }
    }

    function _readArray(tab) {
        var _nodes = [];
        var _edges = [];
        var _nb_nodes = 0;
        var _nb_edges = 0;

        var index = 0;
        var i;
        var name_property;
        var default_value;

        var next = false;

        // read meta
        while (!next) {
            if (tab[index].constructor === Array) {
                if (tab[index][0] == "nb_nodes") {
                    _nb_nodes = tab[index][1];
                }
                if (tab[index][0] == "nb_edges") {
                    _nb_edges = tab[index][1];
                    next = true;
                }
            }
            index++;
        }
        
        //create nodes
        for (i = 0; i < _nb_nodes; i++) {
            _nodes.push({id: i});
        }

        //create edges
        _nb_edges = parseInt(_nb_edges) + parseInt(index);
        for (; index < _nb_edges; index++) {
            if (tab[index].constructor === Array && tab[index][0] == "edge") {
                _edges.push({id: tab[index][1], source: tab[index][2], target: tab[index][3]});
            }
        }

        //add properties
        for (;index < tab.length; index++) {
            if (tab[index].constructor === Array && tab[index][0] == "property") {
                if (tab[index][1] != 0)
                    continue;
                name_property = tab[index][3];
                default_value = tab[index][4][1];
                for (i = 0; i < _nodes.length; i++) {
                    _nodes[i][name_property] = default_value;
                }
                default_value = tab[index][4][2];
                for (i = 0; i < _edges.length; i++) {
                    _edges[i][name_property] = default_value;
                }
                for (i = 5; i < tab[index].length; i++) {
                    if (tab[index][i][0] == "node") {
                        _nodes[tab[index][i][1]][name_property] = tab[index][i][2];
                    }
                    if (tab[index][i][0] == "edge") {
                        _edges[tab[index][i][1]][name_property] = tab[index][i][2];
                    }
                }
            }
        }
        return {nodes: _nodes, edges: _edges};
    }

    tlp_tab = _storeAsArray([])[0];

    return _readArray(tlp_tab);

    //return graph;
  }


  /**
   * Public API
   * -----------
   *
   * User-accessible functions.
   */

  // Fetching TLP with XHR
  function fetch(tlp_url, callback) {
    var xhr = (function() {
      if (window.XMLHttpRequest)
        return new XMLHttpRequest();

      var names,
          i;

      if (window.ActiveXObject) {
        names = [
          'Msxml2.XMLHTTP.6.0',
          'Msxml2.XMLHTTP.3.0',
          'Msxml2.XMLHTTP',
          'Microsoft.XMLHTTP'
        ];

        for (i in names)
          try {
            return new ActiveXObject(names[i]);
          } catch (e) {}
      }

      return null;
    })();

    if (!xhr)
      throw 'XMLHttpRequest not supported, cannot load the file.';

    // Async?
    var async = (typeof callback === 'function'),
        getResult;

    // If we can't override MIME type, we are on IE 9
    // We'll be parsing the response string then.
    if (xhr.overrideMimeType) {
      xhr.overrideMimeType('text/plain');
      getResult = function(r) {
        return r.response;
      };
    }
    else {
      getResult = function(r) {
        var p = new DOMParser();
        return r.responseText;
      };
    }

    xhr.open('GET', tlp_url, async);

    if (async)
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4)
          callback(getResult(xhr));
      };

    xhr.send();

    return (async) ? xhr : getResult(xhr);
  }

  // Parsing the TLP File
  function parse(TLP) {
    return Graph(TLP);
  }

  // Fetch and parse the TLP File
  function fetchAndParse(tlp_url, callback) {
    if (typeof callback === 'function') {
      return fetch(tlp_url, function(tlp) {
        var a =Graph(tlp);
        callback(a);
      });
    } else
      return Graph(fetch(tlp_url));
  }


  /**
   * Exporting
   * ----------
   */
  if (typeof this.tlp !== 'undefined')
    throw 'tlp: error - a variable called "tlp" already ' +
          'exists in the global scope';

  this.tlp = {

    // Functions
    parse: parse,
    fetch: fetchAndParse,

    // Version
    version: '0.1'
  };

  if (typeof exports !== 'undefined' && this.exports !== exports)
    module.exports = this.tlp;
}).call(this);
