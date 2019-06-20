<template>
  <div class="svg-container" id="container">
    <svg
      class="svg-content"
      viewBox="0 0 960 500"
      preserveAspectRatio="xMidYMid meet"
    >
      <g></g>
      <!--      <g class="svg-content" width="100%" height="100%"-->
      <!--         viewBox="0 0 960 500"-->
      <!--         preserveAspectRatio="xMidYMid meet"></g>-->
    </svg>
  </div>
</template>

<script>
  /* eslint-disable no-console */
  import * as d3 from "d3";
  import * as smalldata from "../data/small.json";
  import * as dagred3 from "dagre-d3/dist/dagre-d3";
  // let dagred3 = require("dagre-d3/dist/dagre-d3");

export default {
  name: "graph",
  data() {
    return {
      gdata: null,
      width: 1000,
      height: 500,
      scale: 0.75
    };
  },
  created() {
    let myMap = new Map();
    let initialdata = smalldata[0].reports;
    for (const i in initialdata) {
      // console.log(initialdata[i]["nodeId"])
      myMap.set(initialdata[i]["nodeId"], {
        edges: initialdata[i]["Edge"],
        detail: initialdata[i]["detail"]
      });
    }
    this.gdata = myMap;
  },
  mounted() {
    this.render();
  },
  methods: {
    render: function() {
      const graph = new dagred3.graphlib.Graph({}).setGraph({ });
      for (const [key, value] of this.gdata.entries()) {
        graph.setNode(key, { label: key, Edge: value.edges, detail: value.detail });
        value.edges.forEach(edge => {
          graph.setEdge(key, edge, {
            arrowhead: "normal",
            // arrowheadStyle: "fill: #fff",
            curve: d3.curveBasis,
            label: " "
          });
        });
      }

      const svg = d3.select("div#container").select("svg"),
        inner = svg.select("g");

      // Set up zoom support
      const zoom = d3.zoom().on("zoom", () => {
        // console.log(d3.select(this).select("g"))
        this.setScale(d3.event.transform.k);
        inner.attr("transform", d3.event.transform);
      });
      svg.call(zoom);
      // this.zoom(svg, inner)

      // Create the renderer object
      const render = new dagred3.render();
      // Run the renderer. This is what draws the final graph.
      render(inner, graph);

      let tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip_template")
        .text("Simple Tooltip...");

      svg
        .selectAll("g.node")
        .on("click", (d, i) => {
          tooltip.style("visibility", "hidden");
          this.addChild(d, i);
          this.addParent(d);
          this.render();
        })
        .attr("data-detail", function(v) {
          return graph.node(v).detail
        })
        .on("mouseenter", (d, i) => {
          this.highlightEdges(d, i);
          tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
          tooltip
            .text(this.dataset.detail)
            .style("top", (event.pageY-10)+"px")
            .style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", () => {
          d3.selectAll("rect.label-container").style("fill", "white");
          tooltip.style("visibility", "hidden");
        })
        .selectAll("rect.label-container")
        .on("mouseenter", function() {
          d3.select(this).style("fill", "lightgray");
        })
        .on("mouseout", function() {
          d3.select(this)
            // .select("rect")
            .style("fill", "white");
        });

      function transform(scale) {
        return d3.zoomIdentity.translate((svg.attr("width") * scale) / 2, 20)
          // .scale(scale);
      }
      // Center the graph
      svg.call(
        this.zoom.transform,
        transform(this.scale),
        d3.zoomIdentity
          .translate(
            (svg.attr("width") - graph.graph().width * this.scale) / 2,
            20
          )
          // .scale(this.scale)
      );
      // svg.call(this.zoom.transform, transform(this.scale))

      svg.attr("height", graph.graph().height * this.scale + 40);
    },

    addChild: function(id) {
      const newId = this.generateId(16);
      let edges = this.gdata.get(id);
      edges.edges.push(newId);
      this.gdata.set(id, edges);
      this.gdata.set(newId, {
        detail: "This a child of " + id,
        edges: []
      });
    },
    addParent: function(id) {
      const newId = this.generateId(16);
      let value = {
        detail: "This is a parent of " + id,
        edges: [id]
      };
      this.gdata.set(newId, value);
    },
    setScale: function(scale) {
      this.scale = scale;
    },
    generateId: length => {
      let s = "";
      do {
        s += Math.random()
          .toString(36)
          .substr(2);
      } while (s.length < length);
      s = s.substr(0, length);
      return s;
    },
    highlightEdges: function(d) {
      let children = this.gdata.get(d).edges;
      if (children.length > 0) {
        d3.select("svg")
          .select("g")
          .selectAll("g.node")
          .filter(function(d) {
            return children.includes(d);
          })
          .select("rect.label-container")
          .style("fill", "steelblue");
      }
      let parents = [];
      for (const [key, value] of this.gdata.entries()) {
        if (value.edges.includes(d)) parents.push(key);
      }
      if (parents.length > 0) {
        d3.select("svg")
          .select("g")
          .selectAll("g.node")
          .filter(function(d) {
            return parents.includes(d);
          })
          .select("rect.label-container")
          .style("fill", "orange");
      }
    },
    zoom:
      d3.zoom().on("zoom", () => {
      // console.log(d3.select(this).select("g"))
        this.setScale(d3.event.transform.k);
        inner.attr("transform", d3.event.transform);
      })

  }
};
</script>

<style>
body {
  font: 300 14px "Helvetica Neue", Helvetica;
}
.svg-container {
  display: inline-block;
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  vertical-align: top;
  overflow: hidden;
}
.svg-content {
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
}
.node {
  cursor: pointer;
}
.node text {
  pointer-events: none;
}
.node rect,
.node circle,
.node ellipse {
  stroke: #333;
  fill: #fff;
  stroke-width: 1px;
}
#tooltip_template {
  position: absolute;
  background-color: white;
  border: 2px solid;
  border-radius: 5px;
  padding: 5px;
  z-index: 10;
  visibility: hidden;
}
.edgePath path {
  stroke: #333;
  fill: #333;
  stroke-width: 1.5px;
}

</style>
