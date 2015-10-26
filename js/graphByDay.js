/* global $ */
/* global svg */
/* global d3 */
/*
	Line chart for showing the number of hurricanes per day for all the years
	*/
	function LineChartByDay(target, type, data) {
		this.chart = {};
		this.chart.margin = { top: 50, right: 20, bottom: 40, left: 80 };
		this.chart.height = 0;
		this.chart.width = 0;

		this.chart.svg = null;
		this.chart.tooltip = null;
		this.chart.svg = null;
		this.chart.tag = target;
		this.chart.type = type;
		this.chart.title = "";

		this.chart.data = data;

		this.chart.xScale = null;
		this.chart.yScale = null;
		this.chart.xAxis = null;
		this.chart.yAxis = null;

		this.chart.barPadding = 1;
	}

	LineChartByDay.prototype = {
		constructor: LineChartByDay,

		setTitle: function () {
			var bar = this.chart;

			bar.title = "Max. Wind Speed per day over an year";
			if (bar.type == "pressure")
				bar.title = "Min. Pressure per day over an Year";
			
			bar.svg.append("g")
			.append("text")
			.attr("transform", "translate(" + (bar.width / 2) + "," + (bar.margin.top / 2 - 25) + ")")
			.attr("text-anchor", "middle")
			.attr("class", "gdbchart-title")
			.text(bar.title);
		},

		create: function () {
			var self = this,
			line = this.chart;

		// Configure scales and axis

		var color = d3.scale.category10();

		line.xAxis = d3.svg.axis()
		.scale(line.xScale)
		.orient("bottom").tickFormat(d3.time.format('%b'));

		line.yAxis = d3.svg.axis()
		.scale(line.yScale)
		.orient("left");


		var lineT = d3.svg.line()
		.interpolate("basis")
		.x(function(d) { return line.xScale(d.date); })
		.y(function(d) { return line.yScale(d.value); });
		
		var text = "";
		if(line.type == "wind")
			text = "Max Wind Speed (MPH)";
		else
			text = "Min Pressure (MBAR)";

		color.domain(d3.keys(line.data[0])
			.filter(function(key) { 
				if(line.type == "wind")
					return key !== "date" && key !== "numberOfSamples" && key !== "pressureMax"; 
				else 
					return key !== "date" && key !== "numberOfSamples" && key !== "windAvg";
			})
			);

		var ds = color.domain().map(function(name) {
			return {
				name: name,
				values: line.data.map(function(d) {
					return {date: d.date, value: +d[name]};
				})
			};
		});
		
		line.xScale.domain(d3.extent(line.data, function(d) {return d.date;}));

		line.yScale.domain([
			d3.min(ds, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
			d3.max(ds, function(c) { return d3.max(c.values, function(v) { return v.value; }); })
			]);

		var lineContainer = line.svg.selectAll(".lineData")
		.data(ds)
		.enter().append("g")
		.attr("class", "gbdlineData");

		lineContainer.append("path")
		.attr("class", "gbdline")
		.attr("d", function(d) {return lineT(d.values);});

		// Append the xAxis and yAxis to the bar chart
		line.svg.append("g")
		.call(line.xAxis)
		.attr("class", "x gbdaxis")
		.attr("transform", "translate(0," + line.height + ")")
		.selectAll("text")
		.attr("transform", "translate(20,0)");

		line.svg.append("g")
		.attr("class", "y gbdaxis")
		.call(line.yAxis)
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(text);

		var focus = line.svg.append("g")
		.attr("class", "focus")
		.style("display", "none");

		focus.append("circle")
		.attr("r", 4.5);

		focus.append("text")
		.attr("x", 9)
		.attr("dy", ".35em");

		line.svg.append("rect")
		.attr("class", "gbdoverlay")
		.attr("width", line.width)
		.attr("height", line.height)
		.on("mouseover", function() { focus.style("display", null); })
		.on("mouseout", function() { focus.style("display", "none"); })
		.on("mousemove", mousemove);

		var bisectDate = d3.bisector(function(d) { return d.date; }).left;

		function mousemove() {
			var x0 = line.xScale.invert(d3.mouse(this)[0]),
			i = bisectDate(line.data, x0, 1),
			d0 = line.data[i - 1],
			d1 = line.data[i],
			d = x0 - d0.date > d1.date - x0 ? d1 : d0;
			var displayValue = null;
			if(line.type == "wind") 
				displayValue = parseFloat(d.windAvg).toFixed(2);
			else
				displayValue = parseFloat(d.pressureMax).toFixed(2);
			focus.attr("transform", "translate(" + line.xScale(d.date) + "," + line.yScale(displayValue) + ")");
			focus.select("text").text(displayValue);
		}

		line.svg.selectAll("line.y")
			.data(line.yScale.ticks(10))
			 .enter().append("line")
			 .attr("class", "y")
			 .attr("x1", 0)
			 .attr("x2", line.width)
			 .attr("y1", line.yScale)
			 .attr("y2", line.yScale)
			 .style("stroke", "#ccc");

	},

	resize: function () {
		var self = this,
		bar = this.chart,
		canvasWidth = d3.select(bar.tag).style("width"),
		canvasHeight = d3.select(bar.tag).style("height");

		/* Update the canvas size */
		bar.width = parseInt(canvasWidth) - bar.margin.left - bar.margin.right,
		bar.height = parseInt(canvasHeight) - bar.margin.top - bar.margin.bottom;

		/* Resize the scales */
		bar.xScale = d3.time.scale().range([0, bar.width]);
		bar.yScale = d3.scale.linear().range([0, bar.height]);

		bar.svg.attr({
			width: bar.width + bar.margin.left + bar.margin.right,
			height: bar.height + bar.margin.top + bar.margin.bottom
		});

		bar.svg.select(".gmx.gmaxis")
		.call(bar.xAxis.orient("bottom"))
		.attr("transform", "translate(0," + bar.height + ")");
		svg.select(".gmy.gmaxis").call(bar.yAxis.orient("left"));

		svg.selectAll(".gmbar_rect").attr({
			x: function (d, i) { return i * (bar.width / bar.filteredData.length) },
			y: function (d) { return bar.yScale(d.total); },
			width: bar.width / bar.filteredData.length - bar.barPadding,
			height: function (d) { return bar.height - bar.yScale(d.total); }
		});

	},

	init: function () {
		var self = this,
		line = this.chart,
		canvasWidth = d3.select(line.tag).style("width"),
		canvasHeight = d3.select(line.tag).style("height");

		/* Set the canvas size based on mbostock's best practices */
		line.width = parseInt(canvasWidth) - line.margin.left - line.margin.right - 10,
		line.height = parseInt(canvasHeight) - line.margin.top - line.margin.bottom - 20;

		/* Create the bar:onhover information tooltip */
		//self.createTooltip();

		/* Set the scale values based on the canvas size */
		line.xScale = d3.time.scale().range([0, line.width]);
		line.yScale = d3.scale.linear().range([line.height, 0]);

		/* Set the svg container and create the graph */
		line.svg = d3.select(line.tag).append("svg")
		.attr({
			width: line.width + line.margin.left + line.margin.right,
			height: line.height + line.margin.top + line.margin.bottom
		})
		.append("g")
		.attr("transform", "translate(" + (line.margin.left + 10) + "," + line.margin.top + ")");
		self.create();
		self.setTitle();
	}

}

function getMonth(d) {
	var month = new Array();
	month[0] = "January";
	month[1] = "February";
	month[2] = "March";
	month[3] = "April";
	month[4] = "May";
	month[5] = "June";
	month[6] = "July";
	month[7] = "August";
	month[8] = "September";
	month[9] = "October";
	month[10] = "November";
	month[11] = "December";
	return month[d - 1];
}