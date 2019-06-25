<template>
  <!--  <div v-html="graphData"></div>-->
  <table id="dataTable">
    <thead>
      <tr>
        <th>ID</th>
        <th>File Name</th>
        <th>Sync Version</th>
        <th>Date Modified</th>
        <th>Inputs</th>
        <th>Outputs</th>
      </tr>
    </thead>
  </table>
</template>

<script>
export default {
  name: "impactTable",
  props: {
    gdata: Map
  },
  mounted() {
    let table = document.getElementById("dataTable"),
      _tr_ = document.createElement("tr"),
      _td_ = document.createElement("td"),
      tr = _tr_.cloneNode(false);

    for (const [key, value] of this.gdata.entries()) {
      tr = _tr_.cloneNode(false);
      let td = _td_.cloneNode(false);
      td.appendChild(document.createTextNode(key));
      tr.setAttribute("id", key);
      tr.appendChild(td);
      value.edges.forEach(edge => {
        td = _td_.cloneNode(false);
        td.appendChild(document.createTextNode(edge));
        tr.appendChild(td);
        // line += edge += " ";
      });
      table.appendChild(tr);
    }
    // document.getElementById("dataTable").appendChild(table);
  }
};
</script>

<style scoped></style>
