<template>
  <div>
    <div class="svg-container" id="container">
      <svg
        class="svg-content"
        viewBox="0 0 960 500"
        preserveAspectRatio="xMidYMid meet"
      >
        <g></g>
      </svg>
    </div>
    <!--      <minimap :graph="graph"></minimap>-->
    <impact-table :gdata="gdata"></impact-table>
    <button @click="exportCSV('test')">export csv</button>
    <button @click="saveSVG('test', 'test.svg')">export svg</button>
  </div>
</template>

<script>
/* eslint-disable no-console */
import * as d3 from "d3";
import * as smalldata from "../data/small.json";
import * as dagred3 from "dagre-d3/dist/dagre-d3";
import minimap from "@/components/minimap.vue";
import impactTable from "@/components/Table.vue";

export default {
  name: "graph",
  components: { minimap, impactTable },
  data() {
    return {
      gdata: null,
      width: 1000,
      height: 500,
      scale: 0.75,
      graph: null
    };
  },
  created() {
    let myMap = new Map();
    let initialdata = smalldata[0].reports;
    for (const i in initialdata) {
      // console.log(initialData[i]["nodeId"])
      myMap.set(initialdata[i]["nodeId"], {
        edges: initialdata[i]["Edge"],
        detail: initialdata[i]["detail"],
        inputs: initialdata[i]["Inputs"]
      });
    }
    this.gdata = myMap;
  },
  mounted() {
    this.render();
    this.addDataTable();
  },
  computed: {
    table: function () {
      return this.addDataTable();
    }
  },
  methods: {
    render: function() {
      if (this.gdata === null) return "no data";
      // console.log(this.gdata)
      const graph = new dagred3.graphlib.Graph({}).setGraph({});
      for (const [key, value] of this.gdata.entries()) {
        graph.setNode(key, {
          label: key,
          Edge: value.edges,
          detail: value.detail
        });
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

      let tooltip = d3
        .select("body")
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
          return graph.node(v).detail;
        })
        .on("mouseenter", (d, i) => {
          this.highlightEdges(d, i);
          tooltip.style("visibility", "visible");
        })
        .on("mousemove", function() {
          tooltip
            .text(this.dataset.detail)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
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
        return d3.zoomIdentity.translate((svg.attr("width") * scale) / 2, 20);
        // .scale(scale);
      }
      // Center the graph
      svg.call(
        zoom.transform,
        transform(this.scale),
        d3.zoomIdentity
          .translate(
            (svg.attr("width") - graph.graph().width * this.scale) / 2,
            20
          )
        .scale(this.scale)
      );
      svg.attr("height", graph.graph().height * this.scale + 40);
      this.graph = inner;
    },
    addDataTable: function() {
      // var _table_ = document.createElement('table'),
      //   _tr_ = document.createElement('tr'),
      //   _th_ = document.createElement('th'),
      //   _td_ = document.createElement('td');
      // let table = _table_.cloneNode(false),
      //   tr = _tr_.cloneNode(false);
      // let headers = ["id", "file name", "sync Version", "mod Date", "inputs", "outputs"];
      //
      // for (const header of headers) {
      //   let th = _th_.cloneNode(false);
      //   th.appendChild(document.createTextNode(header));
      //   tr.appendChild(th);
      // }
      // table.appendChild(tr);
      //
      // for (const [key, value] of this.gdata.entries()) {
      //   tr = _tr_.cloneNode(false);
      //   let td = _td_.cloneNode(false);
      //   td.appendChild(document.createTextNode(key))
      //   tr.setAttribute("id",key)
      //   tr.appendChild(td)
      //   value.edges.forEach(edge => {
      //     td = _td_.cloneNode(false);
      //     td.appendChild(document.createTextNode(edge));
      //     tr.appendChild(td);
      //     // line += edge += " ";
      //   });
      //   table.appendChild(tr)
      // }
      // document.getElementById("dataTable").appendChild(table);

    },
    saveSVG: function(filename) {
      let svgE = d3
        .select("div#container")
        .select("svg")
        .node();
      svgE.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      console.log("node", svgE);
      const svgData = svgE.outerHTML;
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8"
      });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = filename + ".svg" || "impactGraph.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
    exportCSV: function(fileTitle) {
      var csv = "";
      csv += "program ID, outputs, inputs, \r\n";
      for (const [key, value] of this.gdata.entries()) {
        let line = "";
        line += key + ", ";
        value.edges.forEach(edge => {
          line += edge += " ";
        });
        line += ", ";
        value.inputs.forEach(i => {
          line += i += " ";
        });
        csv += line + "\r\n";
      }
      let exportedFilenmae = fileTitle + ".csv" || "impactData.csv";

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, exportedFilenmae);
      } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
          // feature detection Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilenmae);
          link.style.visibility = "hidden";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    },
    addChild: function(id) {
      const newId = this.generateId(16);
      let nodeData = this.gdata.get(id);
      nodeData.edges.push(newId);
      this.gdata.set(id, nodeData);
      //create a new node, add current node as parent
      this.gdata.set(newId, {
        detail: "This a child of " + id,
        edges: [],
        inputs: [id]
      });
    },
    addParent: function(id) {
      //create a new node, add current node as child
      const newId = this.generateId(16);
      let value = {
        detail: "This is a parent of " + id,
        edges: [id],
        inputs: []
      };
      this.gdata.set(newId, value);
      //add input to current node's parent data
      let nodeData = this.gdata.get(id);
      nodeData.inputs.push(newId);
      this.gdata.set(id, nodeData);
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
      let parents = this.gdata.get(d).inputs;
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
      const circulardp = children.filter(element => parents.includes(element));
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
      if (circulardp.length > 0) {
        d3.select("svg")
          .select("g")
          .selectAll("g.node")
          .filter(function(d) {
            return circulardp.includes(d);
          })
          .select("rect.label-container")
          .style("fill", "gold");
      }
    }
    // zoom:
    //   d3.zoom().on("zoom", () => {
    //   // console.log(d3.select(this).select("g"))
    //     this.setScale(d3.event.transform.k);
    //     inner.attr("transform", d3.event.transform);
    //   })
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
