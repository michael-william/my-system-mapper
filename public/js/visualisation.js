// D3.js Visualization Functions

let simulation = null;

function initVisualization() {
    clearVisualization();

    if (!window.currentMapData || !window.currentMapData.nodes) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const tooltip = d3.select(".tooltip");

    const svg = d3.select("svg")
        .attr("viewBox", [0, 0, width, height]);

    const LXC = svg.append("g");

    svg.call(d3.zoom().on("zoom", ({transform}) => {
        LXC.attr("transform", transform);
    }));

    simulation = d3.forceSimulation(window.currentMapData.nodes)
        .force("link", d3.forceLink(window.currentMapData.links).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(width / 2, height / 2));

    const link = LXC.append("g")
        .attr("stroke", "#aaa")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(window.currentMapData.links)
        .join("line")
        .attr("stroke-width", 1.5);

    const node = LXC.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(window.currentMapData.nodes)
        .join("circle")
        .attr("r", 10)
        .attr("fill", d => colorScale(d.group))
        .call(drag(simulation))
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 1);
            let tooltipContent = `<strong>${d.id}</strong><br/>Group: ${d.group}`;
            if (d.attributes && d.attributes.length > 0) {
                tooltipContent += '<br/>Attributes:';
                d.attributes.forEach(attr => {
                    tooltipContent += `<br/>${attr.name}: ${attr.value}`;
                });
            }
            tooltip.html(tooltipContent)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

    const label = LXC.append("g")
        .selectAll("text")
        .data(window.currentMapData.nodes)
        .join("text")
        .text(d => d.id)
        .attr("x", 12)
        .attr("y", "0.31em")
        .attr("fill", "#ccc")
        .style("font-size", "0.75rem");

    simulation.on("tick", () => {
        link.attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
            .attr("cy", d => d.y);

        label.attr("x", d => d.x + 12)
            .attr("y", d => d.y);
    });
}

function clearVisualization() {
    d3.select("svg").selectAll("*").remove();
}

function drag(simulation) {
    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }
    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
}