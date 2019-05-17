const data = {
  nodes: ['juan', 'yaun', 'john'],
  links: ['link0'],
};

const newNodes = ['mike', 'alex', 'chris'];
const newLinks = ['link1', 'link2', 'link3', 'link4'];

// data.nodes = [...data.nodes, ...newNodes];
// data.links = [...data.links, ...newLinks];

data.nodes.concat(newNodes);
data.links.concat(newLinks);

console.log(data.nodes);
console.log(data.links);

function isConnected(a, b) {
  return dataLinks[`${a.index},${b.index}`] || dataLinks[`${b.index},${a.index}`] || a.index === b.index;
}

function fade(opacity) {
  return function (d) {
    nodeElements.style("stroke-opacity", function (o) {
      thisOpacity = isConnected(d, o) ? 1 : opacity
      this.setAttribute('stroke-opacity', thisOpacity);
      return thisOpacity;
    });

    linkElements.style("stroke-opacity", function (o) {
      return o.source === d || o.target === d ? 1 : opacity;
    });
  }
}

function displayInfo(d) {
  const infoBox = d3.select('#info')
    .html(`<h1>Name: ${d.site}<br><h2>URL: <span id="url">${d.url}</span></h2>`);
}