d3.json("./visNetwork.json").then((d) => {
  d.links = createJson(d);
  d.links = createFinalArray(d);
  d.links = lineThickness(d);
  var arr = lineThicknessRoundTwo(d);

  findDup(arr, d);
  d = finalArray(arr, d);
  //   getCount(d);
  createElements(d);

  //   console.log(d);
});

const createJson = (d) => {
  var newLinks = d.links.map(function (d) {
    let newArr = [];

    target = d.target.split(", ");
    for (let t of target) {
      let currentData = {
        source: d.source,
        target: t,
        paper: d.paper,
        url: d.url,
      };
      newArr.push(currentData);
    }

    return newArr;
  });

  return newLinks;
};

const createFinalArray = (data) => {
  let b = [];
  for (let a of data.links) {
    b.push(...a);
  }

  return b;
};

const lineThickness = (data) => {
  let finalArr = [];
  let names = data.nodes.map((d) => d.id);

  for (let x of names) {
    var linkThickness = data.links.reduce(function (result, d) {
      if (d.source === x) {
        let currentData = result[d.target] || {
          source: d.source,
          target: "",
          paper: d.paper,
          url: d.url,
          value: 0,
        };

        if (currentData.target.includes(d.target)) {
          if (currentData.source.includes(d.source)) {
            currentData.paper += "," + d.paper;
            currentData.url += "," + d.url;
            currentData.value += 1;

            result[d.target] = currentData;
            return result;
          }
        } else {
          currentData.target += d.target;
          currentData.value += 1;
          result[d.target] = currentData;
          return result;
        }
      } else {
        return result;
      }
    }, {});

    linkThickness = Object.keys(linkThickness).map((key) => linkThickness[key]);

    finalArr.push(...linkThickness);
  }

  return finalArr;
};

const lineThicknessRoundTwo = (data) => {
  let finalArr = [];

  let names = data.nodes.map((d) => d.id);

  for (let x of names) {
    var linkThickness = data.links.reduce(function (result, d) {
      if (d.target === x) {
        if (typeof result != "undefined") {
          randomString = String(Math.random().toString(20).substr(2, 6));
          let currentData = result[randomString] || {
            source: d.source,
            target: d.target,
            paper: d.paper,
            url: d.url,
            value: d.value,
          };

          for (let db of data.links) {
            if (db.target === d.source) {
              if (db.source === x) {
                currentData.paper += "," + db.paper;
                currentData.url += "," + db.url;
                currentData.value += db.value;
                result[randomString] = currentData;

                return result;
              }
            }
          }
        }
      } else {
        return result;
      }
    }, {});

    if (typeof linkThickness != "undefined") {
      linkThickness = Object.keys(linkThickness).map(
        (key) => linkThickness[key]
      );

      finalArr.push(...linkThickness);
    }
  }

  return finalArr;
};

const findDup = (arr, data) => {
  for (let d of arr) {
    checkString = d.target + d.source;
    for (var i = data.links.length - 1; i >= 0; i -= 1) {
      if (checkString.includes(data.links[i].target)) {
        if (checkString.includes(data.links[i].source)) {
          data.links.splice(i, 1);
        }
      }
    }
  }
};

const finalArray = (arr, data) => {
  for (var i = 0; i < arr.length; i++) {
    if (i % 2 == 0) {
      shorterArray = arr.splice(i, 1);

      data.links.push(...shorterArray);
    }
  }
  return data;
};
// const getCount = (data) => {
//   var result = data.links.reduce(function (result, d) {
//     let currentData = result[d.source] || {
//       id: d.source,
//       count: 0,
//     };
//     currentData.count += 1;
//     result[d.source] = currentData;
//     return result;
//   }, {});
//   result = Object.keys(result).map((key) => result[key]);
//   let dataNodes = data.nodes.map((item, i) =>
//     Object.assign({}, item, result[i])
//   );
//   data.nodes = dataNodes;
// };

const createElements = (data) => {
  console.log(data);
  var width = 750;
  var height = 750;
  var margin = 50;
  var radius = 30;

  svg = d3
    .select("#huskyNetwork")
    .append("svg")
    .attr("height", width)
    .attr("width", height);

  // .attr("style", "border: solid 1px black");
  maxWidth = d3.max(data.links, (d) => d.value);

  strokeScale = d3.scaleLinear().range([5, 15]).domain([1, maxWidth]);

  var defs = svg.insert("svg:defs").data(["end"]);

  var link = svg
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
    .attr("stroke", " #ffffe6")
    .attr("stroke-width", (d) => {
      return strokeScale(d.value);
    })
    .attr("pageNames", (d) => d.paper)
    .attr("pageUrl", (d) => d.url)
    .attr("id", (d) => d.index)
    .style("opacity", ".7");

  defs
    .selectAll("clipPath")
    .data(data.nodes)
    .enter()
    .append("clipPath")
    .attr("id", function (d) {
      return d.id.split(" ").join("").substr(0, 5);
    })
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", radius);
  var nodeGroup = svg.append("g").attr("class", "allNodes");
  // var drag = d3.drag().on("dragstart", dragstart);
  //   console.log(d3.drag());

  var node = nodeGroup

    .selectAll("image")

    .data(data.nodes)
    .enter()

    .append("image")
    .attr("class", "tip")
    .attr("x", -radius)
    .attr("y", -radius)
    .attr("width", radius * 2)
    .attr("height", radius * 2)
    .attr("xlink:href", function (d) {
      return d.img;
    })
    .attr("clip-path", function (d) {
      return "url(#" + d.id.split(" ").join("").substr(0, 5) + ")";
    });
  //   console.log(data.nodes);
  node.attr("data-title", (d) => d.id);
  //     .attr("x", 0)
  //     .attr("y", 0 + 15)
  //     .attr("color", "white");
  // .attr("fill", "#130C0E");

  var setEvents = node
    .on("click", function (d) {
      for (let x of data.nodes) {
        if (this.getAttribute("href") === x.img) {
          window.location.href = x.page;
        }
      }
    })
    .on("mouseover", function (event, d) {
      d3.select(this)
        .attr("x", -radius * 2)
        .attr("y", -radius * 2)
        .attr("width", radius * 4)
        .attr("height", radius * 4);

      d3.select(this.getAttribute("clip-path").substr(4, 6))
        .select("circle")
        .attr("r", radius * 2);

      d3.select("#peopleNames")
        .style("top", event.y + 15 + "px")
        .style("left", event.x + 10 + "px")
        .append("p")
        .text(this.getAttribute("data-title"));
    })
    .on("mouseleave", function (d) {
      d3.select(this)
        .attr("x", -radius)
        .attr("y", -radius)
        .attr("width", radius * 2)
        .attr("height", radius * 2);
      d3.select(this.getAttribute("clip-path").substr(4, 6))
        .select("circle")
        .attr("r", radius);

      d3.select("#peopleNames").selectAll("p").remove();
    });

  createNetwork(link, node, data);
  svgElement = document.getElementsByTagName("svg")[0];

  svgElement.style.position = "relative";
  //   svgElement.style.top = "500%";
  svgElement.style.left = "50%";
  svgElement.style.transform = "translate(-50%)";
};

const createNetwork = (link, node, data) => {
  let height = 750;
  let width = 750;

  simulation = d3
    .forceSimulation(data.nodes)
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .links(data.links)
    )
    .force("charge", d3.forceManyBody().strength(-2000))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", tick);

  node.call(drag(simulation));

  link
    .on("mouseover", function (event, d) {
      pages = this.getAttribute("pageNames").split(",");
      url = this.getAttribute("pageUrl").split(",");
      var output = pages.map(function (obj, index) {
        var myobj = { paper: obj, url: url[index] };

        //   myobj[url[index]] = obj;
        return myobj;
      });

      coordx = event.x;
      coordy = event.y;
      var a = this;

      // console.log(pages, url, coord);
      showTooltip(a, output, coordx, coordy);
    })
    .on("mouseleave", function (event, d) {
      d3.select("#tooltip")
        .selectAll("p")
        .transition()
        .duration(2000)
        // .style("opacity", "0")
        .remove();
    });

  function showTooltip(a, output, coordx, coordy) {
    // console.log(this.keys());
    var tooltip = d3.select("#tooltip").selectAll("p").remove();

    d3.select("#tooltip")
      .style("top", coordy + "px")
      .style("left", coordx + "px")

      .selectAll("a")
      .data(output)
      .enter()
      .append("p")
      .append("a")
      //   .style("color", "white")
      .text((d) => d.paper)
      .attr("href", (d) => d.url);
  }

  function tick() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("transform", (d) => {
        return "translate(" + d.x + ", " + d.y + ")";
      });
  }
};

drag = (simulation) => {
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }

  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }

  return d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);
};
