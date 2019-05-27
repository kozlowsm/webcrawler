  //Holds node connections
  var linkedByIndex = {};

  //Data that drives the graph
  var data = {
    nodes: [],
    links: [],
  };

  //Select SVG element from html, acts as container for the graph
  const svg = d3.select('svg');
  //Gets the width and height of the inner browswer window
  const width = window.innerWidth;
  const height = window.innerHeight;

  //Sets the container dimensions
  svg
    .attr('width', width)
    .attr('height', height)

  //Size of the nodes
  const nodeRadius = 10;
  //Color scheme for the nodes
  const nodeColor = d3.scaleOrdinal(d3.schemeSet2);

  //Create forces to separate nodes
  const linkForce = d3.forceLink().id(d => d.site).distance(20).strength(0.3);
  const chargeForce = d3.forceManyBody().strength(-200);
  const centerForce = d3.forceCenter(width / 2, height / 2);
  const collisionForce = d3.forceCollide(25);
  //const variousForces = d3.

  //Create D3 simulation object where forces will be applied
  const simulation = d3.forceSimulation();


  //Append the forces to the simulation object
  simulation
    .force('link', linkForce)
    .force('charge', chargeForce)
    .force('center', centerForce)
    .force('collision', collisionForce)


  //Create group wrapper for entire graph, creating a group that will contain all other groups within the svg
  const graphWrapper = svg.append('g');

  //Group links together in graphWrapper
  let linkElements = graphWrapper.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(data.links)
    .enter().append('line') //enter selection, append a new line for each virtual element

  //Group all node elemenst together in graphWrapper
  let nodeElements = graphWrapper.append('g')
    .attr('class', 'nodes')
    .selectAll('circle')
    .data(data.nodes)
    .enter().append('circle')
    .attr('r', nodeRadius - .75)
    .attr('fill', d => nodeColor(d.group))
    .on('click', d => window.open(d.url, '_blank')) //Open link in new tab after clicking node
    .on('mouseover.fade', fade(.1))
    .on('mouseover.info', displayInfo)
    .on('mouseout.fade', fade(1))
    .on('mouseover.increaseNodeSize', increaseNodeSize)
    .on('mouseout.decreaseNodeSize', decreaseNodeSize)
    .call(d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded));

  svg.call(d3.zoom()
    .on('zoom', zoomAction));

  simulation
    .nodes(data.nodes)
    .on('tick', tickAction);

  simulation
    .force('link')
    .links(data.links);

  data.links.forEach(d => {
    linkedByIndex[`${d.source.index},${d.target.index}`] = 1;
  });

  /*Functions to get everything moving*/
  //Function that runs for each node, sets positions of links and nodes
  function tickAction() {
    linkElements
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
    nodeElements
      .attr('cx', d => d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x)))
      .attr('cy', d => d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y)));
  }

  /*
  * Set of functions that handle node dragging events
  */
  function dragStarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragEnded(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  //add on doubleclick listener to release nodes
  function releaseNode(d) {
    d.fx = null;
    d.fy = null;
  }

  //Handles pan/zoom event for graph
  function zoomAction() {
    graphWrapper.attr('transform', d3.event.transform);
  }

  function displayInfo(d) {
    const infoBox = d3.select('#info')
      .html(`<h2>Name: ${d.site}</h2><br><h3>URL: <span id="url">${d.url}</span></h3>`);
  }

  function isConnected(a, b) {
    return linkedByIndex[`${a.index},${b.index}`] || linkedByIndex[`${b.index},${a.index}`] || a.index === b.index;
  }

  function fade(opacity) {
    return function (d) {
      nodeElements.style('stroke-opacity', function (o) {
        let thisOpacity = isConnected(d, o) ? 1 : opacity;
        this.setAttribute('fill-opacity', thisOpacity);
        this.setAttribute('stroke-width', '1px');
        return thisOpacity;
      });
      linkElements.style('stroke-opacity', o => (o.source === d || o.target === d ? 1 : opacity));
    };
  }

  function increaseNodeSize() {
    const node = d3.select(this)
      .transition()
      .duration(750)
      .attr('r', 16);
  }

  function decreaseNodeSize() {
    const node = d3.select(this)
      .transition()
      .duration(750)
      .attr('r', nodeRadius);
  }

  function createSvgElement(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
  }

  //Update function
  //Everytime a new piece of data is added
  function update() {
    linkElements = linkElements.data(data.links);
    linkElements.exit().remove();
    linkElements = linkElements.enter().append('line')
      .attr('class', 'links')
      .merge(linkElements);

    nodeElements = nodeElements.data(data.nodes);
    nodeElements.exit().remove();
    nodeElements = nodeElements.enter().append(d => d.keyword ? createSvgElement('rect') : createSvgElement('circle'))
      .attr('class', 'nodes')
      .attr('r', nodeRadius - .75)
      .attr('fill', d => nodeColor(d.group))
      .on('click', d => window.open(d.url, '_blank'))
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded))
      .merge(nodeElements);

    //Handle mouse events over nodes
    nodeElements
      .on('mouseover.fade', fade(.1))
      .on('mouseover.info', displayInfo)
      .on('mouseover.increaseNodeSize', increaseNodeSize)
      .on('mouseout.fade', fade(1))
      .on('mouseout.decreaseNodeSize', decreaseNodeSize);

    simulation
      .nodes(data.nodes)
      .force('link')
      .links(data.links);

    svg.call(d3.zoom()
      .on('zoom', zoomAction));

    //restart the simulation
    simulation.alphaTarget(0.70).restart();
  }