<template>
  <div class="hello">
    <svg >
      <g></g>
    </svg>
  </div>
</template>

<script>
/* eslint-disable no-console */
import * as d3 from "d3";
import * as smalldata from "../data/small.json";
import * as dagred3 from "dagre-d3/dist/dagre-d3";
// import graphlib from "dagre-d3";
// let dagred3 = require("dagre-d3/dist/dagre-d3");

export default {
  name: "graph",
  data() {
    return {
      gdata: null
    };
  },
  created() {
    let myMap = new Map();
    let initialdata = smalldata[0].reports
    // console.log(smalldata[0].reports)
    for (const i in initialdata) {
      console.log(initialdata[i]["nodeId"])
      myMap.set(initialdata[i]["nodeId"], initialdata[i]["Edge"]);
    }
    this.gdata = myMap;
  },
  mounted() {
    this.render();
  },
  methods: {
    render: function() {
      const g = new dagred3.graphlib.Graph().setGraph({});

      for (const [key, value] of this.gdata.entries()) {
        console.log(key, value)
        g.setNode(key, { label: key, Edge: value });
        value.forEach(edge => {
          g.setEdge(key, edge, {
            arrowhead: "vee",
            label: " "
          });
        });
      }
      /*for (const a of this.gdata) {
          console.log(a)
          let id = a["nodeId"];
          // console.log("index for " + id + ": " + i)
          g.setNode(id, { label: id, Edge: a["Edge"] });
          a["Edge"].forEach(edge => {
            g.setEdge(id, edge, {
              arrowhead: "vee",
              label: " "
            });
          });
        }*/

      const svg = d3
          .select("svg")
          .attr("width", "100%")
          .attr("height", "100%"),
        inner = svg.select("g");

      // Set up zoom support
      const zoom = d3.zoom().on("zoom", function() {
        inner.attr("transform", d3.event.transform);
      });
      svg.call(zoom);

      // Create the renderer object
      const render = new dagred3.render();
      // Run the renderer. This is what draws the final graph.
      render(inner, g);

      inner.selectAll("g.node")
        .on("click", (d, i) => {
          this.addChild(d, i);
          this.addParent(d);
          this.render()
        })
        .on("mouseenter", (d, i) => {
          this.highlightEdges(d, i);
        })
        .on("mouseout", () =>
          d3.selectAll("rect.label-container").style("fill", "white")
        )
        .selectAll("rect.label-container")
        .on("mouseenter", function() {
          d3.select(this).style("fill", "lightgray");
        })
        .on("mouseout", function() {
          d3.select(this)
            // .select("rect")
            .style("fill", "white");
        });

      // Center the graph
      const initialScale = 0.75;
      svg.call(
        zoom.transform,
        d3.zoomIdentity
          .translate(
            (svg.attr("width") - g.graph().width * initialScale) / 2,
            20
          )
          .scale(initialScale)
      );
      svg.attr("height", g.graph().height * initialScale + 40);
    },

    addChild: function(id) {
      const newId = this.generateId(16);
      let edges = this.gdata.get(id);
      edges.push(newId);
      this.gdata.set(id, edges);
      this.gdata.set(newId, []);
      // this.gdata[index]["Edge"].push(newId);
      // for (const a of this.gdata) {
      //   let currentId = a["nodeId"];
      //   // g.setNode(id + "2", {label: " "});
      //   if (id === currentId) {
      //       a["Edge"].push(newId)
      //   }
      // }
      // this.gdata.push({
      //   nodeId: newId,
      //   Edge: []
      // });
      // this.render();
    },
    addParent: function(id) {
      const newId = this.generateId(16);
      this.gdata.set(newId, [id]);
      // this.gdata.push({
      //   nodeId: newId,
      //   Edge: [id]
      // });
      // this.render();
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
      console.log(d)
      let children = this.gdata.get(d);
      if (children.length > 0) {
        d3.select("svg").select("g").selectAll("g.node")
          .filter(function (d) {
            return children.includes(d);
          })
          .select("rect.label-container")
          .style("fill", "steelblue");
      }
      let parents = [];
      for (const [key, value] of this.gdata.entries()){
        if (value.includes(d)) parents.push(key);
      }
      if (parents.length > 0) {
        d3.select("svg").select("g").selectAll("g.node")
          .filter(function (d) {
            return parents.includes(d);
          })
          .select("rect.label-container")
          .style("fill", "orange");
      }
      // let node = this.gdata[i]["nodeId"];
      // console.log("node passed in: " + d);
      // console.log("node at index " + i + " " + node);
      //
      // let prevnode = this.gdata[i - 1];
      // if (prevnode !== undefined)
      //   console.log("node at index " + (i - 1) + " " + prevnode["nodeId"]);
      //
      // let nextnode = this.gdata[i + 1];
      // if (nextnode !== undefined)
      //   console.log("node at index " + (i + 1) + " " + nextnode["nodeId"]);
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
body {
  font: 300 14px "Helvetica Neue", Helvetica;
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

.edgePath path {
  stroke: #333;
  fill: #333;
  stroke-width: 1.5px;
}
</style>
