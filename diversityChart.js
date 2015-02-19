(function() {
  var Node, diversityChart, initiate,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Array.prototype.mapcat = function(fn) {
    return [].concat.apply([], this.map(fn));
  };

  diversityChart = (function() {
    function diversityChart(selection, attr) {
      this.updateLinks = __bind(this.updateLinks, this);
      this.update = __bind(this.update, this);
      this.genLayout = __bind(this.genLayout, this);
      this.calculateFollowers = __bind(this.calculateFollowers, this);
      this.genLinks = __bind(this.genLinks, this);
      this.genNodes = __bind(this.genNodes, this);
      this.calculateLinks = __bind(this.calculateLinks, this);
      this.convertData = __bind(this.convertData, this);
      this.drawRings = __bind(this.drawRings, this);
      this.drawLinks = __bind(this.drawLinks, this);
      this.drawNodes = __bind(this.drawNodes, this);
      this.drawForce = __bind(this.drawForce, this);
      this.draw = __bind(this.draw, this);
      this.setup = __bind(this.setup, this);
      this.maxCircle = 6;
      this.colours = {
        pink: "#FE0557",
        blue: "#0AABBA",
        orange: "#FE8B05"
      };
      this.force = null;
      this.width = attr.size;
      this.height = attr.size;
      this.center = {
        x: this.width / 2,
        y: this.height / 2
      };
      this.rings = 6;
      this.innerRadius = 60;
      this.animationDuration = 200;
      this.animationType = "quad";
      this.ringScale = d3.scale.linear().domain([0, this.rings - 1]).range([this.innerRadius, this.width / 2 - 20]);
      this.numNodes = attr.nodes;
      this.numFollowing = attr.numFollow;
      this.refresh = attr.refresh;
      this.ratioFem = 50;
      this.percFemFollow = attr.percFollow;
      this.geo = new Geo();
      this.selection = selection;
      this.nodes = [];
      this.links = [];
    }

    diversityChart.prototype.setup = function() {
      var followerScale;
      this.contain = d3.select(this.selection).append("svg").attr("width", this.width).attr("height", this.height);
      this.force = d3.layout.force().friction(0.3).size([this.width, this.height]).linkDistance(100);
      followerScale = this.convertData(this.numNodes, this.ratioFem, this.numFollowing, this.percFemFollow);
      this.numNodesSlider = d3.select("#num-nodes").attr({
        min: 1
      }).attr({
        max: 300
      }).attr({
        value: this.numNodes
      }).on("change", (function(_this) {
        return function() {
          _this.numNodes = document.querySelector('#num-nodes').value;
          _this.followingSlider.attr({
            max: _this.numNodes
          });
          return _this.update();
        };
      })(this));
      this.genderSlider = d3.select("#perc-gender").attr({
        min: 0
      }).attr({
        max: 100
      }).attr({
        value: this.ratioFem
      }).on("change", (function(_this) {
        return function() {
          _this.ratioFem = document.querySelector('#perc-gender').value;
          return _this.update();
        };
      })(this));
      this.followingSlider = d3.select("#following").attr({
        min: 0
      }).attr({
        max: this.numNodes
      }).attr({
        value: this.numFollowing
      }).on("change", (function(_this) {
        return function() {
          _this.numFollowing = document.querySelector('#following').value;
          return _this.updateLinks();
        };
      })(this));
      this.perFemSlider = d3.select("#following-female").attr({
        min: 0
      }).attr({
        max: 100
      }).attr({
        value: this.percFemFollow
      }).on("change", (function(_this) {
        return function() {
          _this.percFemFollow = document.querySelector('#following-female').value;
          return _this.updateLinks();
        };
      })(this));
      this.reset = d3.select(this.refresh).on("click", (function(_this) {
        return function() {
          return _this.updateLinks();
        };
      })(this));
      return this.draw(followerScale);
    };

    diversityChart.prototype.draw = function(followerScale, animate) {
      if (animate == null) {
        animate = false;
      }
      if (!animate) {
        this.contain.selectAll("circle.node").remove();
        this.drawForce();
      }
      this.nodesD3 = this.contain.selectAll("circle.node").data(this.nodes);
      this.contain.selectAll("line.link").remove();
      this.drawForce();
      this.drawNodes(animate);
      this.drawLinks(animate);
      return this.drawRings(followerScale);
    };

    diversityChart.prototype.drawForce = function() {
      return this.force.start();
    };

    diversityChart.prototype.drawNodes = function(animate) {
      if (animate == null) {
        animate = false;
      }
      if (animate) {
        return this.nodesD3.transition().duration(this.animationDuration).ease(this.animationType).attr({
          cx: function(d) {
            return d.x;
          }
        }).attr({
          cy: function(d) {
            return d.y;
          }
        });
      } else {
        return this.nodesD3.enter().append("circle").attr({
          "class": "node"
        }).attr({
          r: this.maxCircle
        }).attr({
          fill: (function(_this) {
            return function(d) {
              if (d.gender === "female") {
                return _this.colours.pink;
              } else {
                return _this.colours.blue;
              }
            };
          })(this)
        }).attr({
          cx: function(d) {
            return d.x;
          }
        }).attr({
          cy: function(d) {
            return d.y;
          }
        });
      }
    };

    diversityChart.prototype.drawLinks = function(animate) {
      if (animate == null) {
        animate = false;
      }
      this.linksD3 = this.contain.selectAll("line.link").data(this.links, function(d) {
        return "" + d.source.index + "_" + d.target.index;
      });
      this.linkD3 = this.linksD3.enter().append("line").attr({
        "class": "link"
      }).attr({
        "stroke-opacity": 0
      }).attr({
        stroke: (function(_this) {
          return function(d) {
            var stroke;
            if (d.target.gender === "female") {
              return stroke = _this.colours.pink;
            } else if (d.target.gender === "male") {
              return stroke = _this.colours.blue;
            } else if (d.target.gender === "brand") {
              return stroke = _this.colours.orange;
            } else {
              return stroke = "#d3d3d3";
            }
          };
        })(this)
      }).attr("x1", function(d) {
        return d.source.x;
      }).attr("y1", function(d) {
        return d.source.y;
      }).attr("x2", function(d) {
        return d.target.x;
      }).attr("y2", function(d) {
        return d.target.y;
      });
      if (animate) {
        return this.linkD3.transition().duration(this.animationDuration / 2).delay(this.animationDuration / 2).ease(this.animationType).attr({
          "stroke-opacity": 0.2
        });
      } else {
        return this.linkD3.attr({
          "stroke-opacity": 0.2
        });
      }
    };

    diversityChart.prototype.drawRings = function(followerScale) {
      var _i, _j, _ref, _ref1, _results, _results1;
      this.contain.selectAll('circle.ring').data((function() {
        _results = [];
        for (var _i = 0, _ref = this.rings; 0 <= _ref ? _i < _ref : _i > _ref; 0 <= _ref ? _i++ : _i--){ _results.push(_i); }
        return _results;
      }).apply(this)).enter().append('circle').attr({
        "class": 'ring'
      }).attr({
        r: (function(_this) {
          return function(d) {
            return _this.ringScale(d);
          };
        })(this)
      }).attr({
        cx: this.center.x
      }).attr({
        cy: this.center.y
      }).attr({
        fill: 'none'
      }).attr({
        stroke: '#000000'
      }).attr({
        opacity: 0.1
      });
      this.contain.selectAll(".ring-label").remove();
      return this.contain.selectAll(".ring-label").data((function() {
        _results1 = [];
        for (var _j = 0, _ref1 = this.rings; 0 <= _ref1 ? _j < _ref1 : _j > _ref1; 0 <= _ref1 ? _j++ : _j--){ _results1.push(_j); }
        return _results1;
      }).apply(this)).enter().append("text").attr({
        "class": "ring-label"
      }).text(function(d) {
        return Math.ceil(followerScale.invert(d));
      }).attr({
        x: (function(_this) {
          return function(d) {
            return (_this.ringScale(d)) + _this.center.x + 4;
          };
        })(this)
      }).attr({
        "text-anchor": "start"
      }).attr({
        y: this.center.y
      }).attr({
        fill: '#000000'
      }).attr({
        "font-size": 14
      }).attr({
        opacity: 0.4
      });
    };

    diversityChart.prototype.convertData = function(count, ratio, numFollowing, perFem) {
      var indexOfFem, node;
      indexOfFem = ratio / 100 * count;
      this.nodes = (function() {
        var _i, _ref, _results;
        _results = [];
        for (node = _i = 0, _ref = count - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; node = 0 <= _ref ? ++_i : --_i) {
          _results.push(this.genNodes(node, indexOfFem));
        }
        return _results;
      }).call(this);
      return this.calculateLinks(count, numFollowing, perFem);
    };

    diversityChart.prototype.calculateLinks = function(count, numFollowing, perFem) {
      var followerScale, maxFollowers, node, segment, _i, _j, _len, _len1, _ref, _ref1;
      segment = 360 / count;
      this.links = this.nodes.mapcat((function(_this) {
        return function(node) {
          return _this.genLinks(node, numFollowing, perFem, _this.nodes);
        };
      })(this));
      this.force.nodes(this.nodes).links(this.links).start();
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        node.calcFollowedStats(this.links);
      }
      maxFollowers = d3.max(this.nodes, function(n) {
        return n.numFollowers;
      });
      followerScale = d3.scale.linear().domain([0, maxFollowers]).rangeRound([0, this.rings - 1]);
      _ref1 = this.nodes;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        node = _ref1[_j];
        this.genLayout(node, this.links, segment, followerScale);
      }
      return followerScale;
    };

    diversityChart.prototype.genNodes = function(i, indexOfFem) {
      var gender, node;
      gender = "male";
      if (i < indexOfFem) {
        gender = "female";
      }
      return node = new Node(i, gender, []);
    };

    diversityChart.prototype.genLinks = function(node, numFollowing, perFem, nodeData) {
      var femaleNodes, i, maleNodes, nodePool, numFem, numMale, _i, _j;
      node.clearFollowing();
      numFem = Math.floor(perFem / 100 * numFollowing);
      numMale = Math.floor(numFollowing - numFem);
      nodePool = nodeData.slice(0, node.index - 1).concat(nodeData.slice(node.index + 1, nodeData.length));
      maleNodes = nodePool.filter(function(n) {
        return n.gender === "male";
      });
      femaleNodes = nodePool.filter(function(n) {
        return n.gender === "female";
      });
      for (i = _i = 0; 0 <= numFem ? _i < numFem : _i > numFem; i = 0 <= numFem ? ++_i : --_i) {
        this.addFollowing(node, femaleNodes);
      }
      for (i = _j = 0; 0 <= numMale ? _j < numMale : _j > numMale; i = 0 <= numMale ? ++_j : --_j) {
        this.addFollowing(node, maleNodes);
      }
      return node.getOutbound();
    };

    diversityChart.prototype.calculateFollowers = function(node, links) {
      return node.numFollowers = links.filter(function(l) {
        return l.target === node.index;
      }).length;
    };

    diversityChart.prototype.genLayout = function(node, links, segment, followerScale) {
      var coords, r;
      r = this.ringScale(followerScale(node.numFollowers));
      coords = this.geo.p2c(r, node.index * segment);
      return node.setCoords({
        x: coords.x + this.center.x,
        y: coords.y + this.center.y
      });
    };

    diversityChart.prototype.addFollowing = function(node, nodePool) {
      var randIndex, randNode, updatedPool;
      updatedPool = nodePool.filter(function(n) {
        return node.following.filter(function(f) {
          return f.index === n.index;
        }).length === 0;
      });
      if (updatedPool.length < 1) {
        return false;
      } else {
        randIndex = Math.floor(Math.random() * updatedPool.length);
        randNode = updatedPool[randIndex];
        return node.followNode(randNode);
      }
    };

    diversityChart.prototype.update = function() {
      var followerScale;
      followerScale = this.convertData(this.numNodes, this.ratioFem, this.numFollowing, this.percFemFollow);
      return this.draw(followerScale);
    };

    diversityChart.prototype.updateLinks = function() {
      var followerScale;
      followerScale = this.calculateLinks(this.numNodes, this.numFollowing, this.percFemFollow);
      return this.draw(followerScale, true);
    };

    return diversityChart;

  })();

  Node = (function() {
    function Node(index, gender, following, x, y) {
      this.calcFollowedStats = __bind(this.calcFollowedStats, this);
      this.getOutbound = __bind(this.getOutbound, this);
      this.clearFollowing = __bind(this.clearFollowing, this);
      this.followNode = __bind(this.followNode, this);
      this.index = index;
      this.gender = gender;
      this.following = following;
      this.numFollowers = 0;
      this.femFollowers = 0;
      this.maleFollowers = 0;
      this.x = x;
      this.y = y;
    }

    Node.prototype.followNode = function(node) {
      return this.following.push(node);
    };

    Node.prototype.clearFollowing = function() {
      return this.following = [];
    };

    Node.prototype.getOutbound = function() {
      var node, _i, _len, _ref, _results;
      _ref = this.following;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push({
          source: this.index,
          target: node.index
        });
      }
      return _results;
    };

    Node.prototype.calcFollowedStats = function(links) {
      var femFollowers, followers, maleFollowers;
      followers = links.filter((function(_this) {
        return function(n) {
          return n.target.index === _this.index;
        };
      })(this));
      femFollowers = followers.filter(function(n) {
        return n.source.gender === "female";
      });
      maleFollowers = followers.filter(function(n) {
        return n.source.gender === "male";
      });
      this.numFollowers = followers.length;
      this.femFollowers = femFollowers.length;
      this.maleFollowers = maleFollowers.length;
      return {
        total: this.numFollowers,
        femFollowers: this.femFollowers,
        maleFollowers: this.maleFollowers
      };
    };

    Node.prototype.setCoords = function(coords) {
      this.x = coords.x;
      return this.y = coords.y;
    };

    return Node;

  })();

  initiate = function(chart) {
    var chartEl;
    chartEl = new diversityChart(chart, chart.dataset);
    return chartEl.setup();
  };

  window.onload = function() {
    var chart, diversityCharts, selection, _i, _len, _results;
    selection = "body";
    diversityCharts = d3.selectAll('.diversity-chart')[0];
    _results = [];
    for (_i = 0, _len = diversityCharts.length; _i < _len; _i++) {
      chart = diversityCharts[_i];
      _results.push(initiate(chart));
    }
    return _results;
  };

}).call(this);
