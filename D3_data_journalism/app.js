var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenxAxis = "poverty";


// function used for updating x-scale var upon click on axis label
function xScale(peopledata, chosenxAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(peopledata, d => d[chosenxAxis]) * 0.8,
        d3.max(peopledata, d => d[chosenxAxis]) * 1.2,
        d3.max(peopledata, d => d[chosenxAxis]) * 1.6,

        ])
        .range([0, width]);

    return xLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenxAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenxAxis]));

    return circlesGroup;
}

function renderCirclesText(circlesGroup, newXScale, chosenxAxis) {

    labelGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenxAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenxAxis, circlesGroup) {

    var label;

    if (chosenxAxis === "poverty") {
        var label = "Poverty:";
    } else {
        var label = "Age:"
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([120, -10])
        //.offset([0,5])
        .html(function (d) {
            return (`${d.state}<br>Coverage: ${parseFloat(d.healthcare * 100).toFixed(1)}%<br>${label} ${d[chosenxAxis]}`);
        });


    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data, this);
    })
        // onmouseout event
        .on("mouseout", function (dataTip, index) {
            toolTip.hide(dataTip);
        });

    return circlesGroup;
}

// Step 1: Parse Data/Cast as numbers
// ==============================
d3.csv("data.csv").then(function (journalismData) {
    journalismData.forEach(function (data) {
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        // data.smokes = +data.smokes;
        data.age = +data.age;
        // data.income = +data.income;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(journalismData, chosenxAxis);


    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(journalismData, d => d.healthcare)])
        .range([height, 0]);


    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(journalismData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenxAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 20)
        .attr("fill", "red")
        .attr("opacity", ".5");

    // Step 6: Append text to Created Circles
    // ==============================
    labelGroup = chartGroup.append("g")
        .selectAll("text")
        .data(journalismData)
        .enter()
        .append("text").text(d => d.abbr)
        .attr("x", d => xLinearScale(d[chosenxAxis]))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("font_family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", "blue")
        .style("font-weight", "bold");



}).catch(function (error) {
    console.log(error);







});



