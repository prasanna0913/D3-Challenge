var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
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
var chosenYAxis = "healthcare";


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


// function used for updating x-scale var upon click on axis label
function yScale(peopledata, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(peopledata, d => d[chosenYAxis])])
        .range([height, 0]);

    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
}

function renderYAxes(yLinearScale, yAxis) {
    var leftAxis = d3.axisLeft(yLinearScale);

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenxAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenxAxis]));

    return circlesGroup;
}

function renderYAxisCircles(circlesGroup, newYScale, chosenxAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenxAxis]));

    return circlesGroup;
}

function renderCirclesText(circlesGroup, newXScale, chosenxAxis) {

    labelGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenxAxis]))
    return circlesGroup;
}

function renderYAxisCirclesText(circlesGroup, newXScale, chosenxAxis) {

    labelGroup.transition()
        .duration(1000)
        // .attr("x", d => newXScale(d[chosenxAxis]))x
        .attr("y", d => newXScale(d[chosenxAxis]));


    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenxAxis, chosenYAxis, circlesGroup) {

    var label;

    if (chosenxAxis === "poverty") {
        var xLabel = "Poverty:";
    }
    else if (chosenxAxis === "age") {
        var xLabel = "Age:";
    }
    else if (chosenxAxis === "income") {
        var xLabel = "Income:";
    }

    if (chosenYAxis === "healthcare") {
        var yLabel = "Health care:";
    }
    else if (chosenYAxis === "smokes") {
        var yLabel = "Smokes:";
    }


    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([120, -10])
        //.offset([0,5])
        .html(function (d) {
            var textData;
            if (chosenxAxis === 'income' || chosenxAxis === 'age') {
                textData = (`${d.state}<br>${xLabel} ${d[chosenxAxis]}<br>${yLabel} ${d[chosenYAxis]}%`);
            } else {
                textData = (`${d.state}<br>${xLabel} ${d[chosenxAxis]}%<br>${yLabel} ${d[chosenYAxis]}%`);
            }
            return textData;
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
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.income = +data.income;
    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(journalismData, chosenxAxis);
    var yLinearScale = yScale(journalismData, chosenYAxis);


    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(journalismData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenxAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
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
        .attr("y", d => yLinearScale(d[chosenYAxis]))
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("font_family", "sans-serif")
        .attr("font-size", "10px")
        .attr("fill", "blue")
        .style("font-weight", "bold");

    // Create group for two x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height})`)


    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty(%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age(Median)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 75)
        .attr("value", "income") // value to grab for event listener
        .classed("inactive", true)
        .text("Household Income (Median)");



    // append y axis
    var healthcareLabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 1.5))
        .attr("dy", "4em")
        .attr("value", "healthcare")
        .classed("axis-text", true)
        .classed("active", true)
        .text("Lacks Healthcare(%)");


    var smokesLabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 1.5))
        .attr("dy", "2em")
        .attr("value", "smokes")
        .classed("axis-text", true)
        .classed("inactive", true)
        .text("Smokes(%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenxAxis, chosenYAxis, circlesGroup);

    chartGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value === 'healthcare' || value === 'smokes') {
                if (value !== chosenYAxis) {
                    // replaces chosenxAxis with value
                    chosenYAxis = value;

                    console.log(chosenYAxis)

                    // functions here found above csv import
                    yLinearScale = yScale(journalismData, chosenYAxis);

                    // updates x axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    // updates circles with new x values
                    circlesGroup = renderYAxisCircles(circlesGroup, yLinearScale, chosenYAxis);

                    // updates text in circles  with new x values
                    circlesGroup = renderYAxisCirclesText(circlesGroup, yLinearScale, chosenYAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenxAxis, chosenYAxis, circlesGroup);


                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);

                    } else if (chosenYAxis === "smokes") {
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }

                }
            } else {
                var value = d3.select(this).attr("value");
                if (value !== chosenxAxis) {

                    // replaces chosenxAxis with value
                    chosenxAxis = value;

                    console.log(chosenxAxis)

                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = xScale(journalismData, chosenxAxis);

                    // updates x axis with transition
                    xAxis = renderAxes(xLinearScale, xAxis);

                    // updates circles with new x values
                    circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenxAxis);

                    // updates text in circles  with new x values
                    circlesGroup = renderCirclesText(circlesGroup, xLinearScale, chosenxAxis);

                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenxAxis, chosenYAxis, circlesGroup);

                    // changes classes to change bold text
                    if (chosenxAxis === "poverty") {
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);


                    } else if (chosenxAxis === "age") {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    }
                    else {
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            }

        });

}).catch(function (error) {
    console.log(error);

});



