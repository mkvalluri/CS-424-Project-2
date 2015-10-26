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

		if (bar.type == "num-hurricanes") {
			bar.title = "Hurricanes per month in the ";
			if (bar.basin == "AL")
				bar.title = bar.title + " Atlantic Ocean";
			else
				bar.title = bar.title + " North East Pacific Ocean";
		} else if (bar.type == "max-wind")
			bar.title = "Max. Wind Speed per Year";
		else if (bar.type == "min-pressure")
			bar.title = "Min. Pressure per Year";
		else
			bar.title = "Unknown";
		bar.title = bar.title + " (" + bar.filter.year_init + " - " + bar.filter.year_end + ")";

		bar.svg.append("g")
			.append("text")
			.attr("transform", "translate(" + (bar.width / 2) + "," + (bar.margin.top / 2) + ")")
			.attr("text-anchor", "middle")
			.attr("class", "gmchart-title")
			.text(bar.title);
	},

	create: function () {
		var self = this,
			line = this.chart;

		// Configure scales and axis

		var color = d3.scale.category10();

		line.xAxis = d3.svg.axis()
						  .scale(line.xScale)
						  .orient("bottom");

		line.yAxis = d3.svg.axis()
						.scale(line.yScale)
						.orient("left");
						
						
		var lineT = d3.svg.line()
			.interpolate("basis")
			.x(function(d) { return line.xScale(d.date); })
			.y(function(d) { return line.yScale(d.temperature); });
		
		var text = "";
		if(line.type == "wind")
			text = "Maximum Wind Speed";
		else
			text = "Minimum Pressure";
			
		 color.domain(d3.keys(line.data[0])
    	  .filter(function(key) { 
        	if(line.type == "wind")
          		return key !== "date" && key !== "numberOfSamples" && key !== "pressureMax"; 
        	else 
          		return key !== "date" && key !== "numberOfSamples" && key !== "windAvg";
       		})
     	);
		 
		var cities = color.domain().map(function(name) {
			return {
				name: name,
				values: line.data.map(function(d) {
					return {date: d.date, temperature: +d[name]};
				})
			};
		});
		
		line.xScale.domain(d3.extent(line.data, function(d) {return d.date;}));

		line.yScale.domain([
			d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
			d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
		]);

		var city = line.svg.selectAll(".city")
					.data(cities)
					.enter().append("g")
					.attr("class", "city");
					
					city.append("path")
					.attr("class", "line")
					.attr("d", function(d) {return lineT(d.values);})
					.style("stroke", function(d) {return color(d.name);});
	
		// Append the xAxis and yAxis to the bar chart
		line.svg.append("g")
				.call(line.xAxis)
					.attr("class", "x axis")
					.attr("transform", "translate(0," + line.height + ")")
				.selectAll("text")
					.attr("transform", "translate(20,0)");

		line.svg.append("g")
				.attr("class", "y axis")
				.call(line.yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text(text);
					
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
		line.width = parseInt(canvasWidth) - line.margin.left - line.margin.right,
		line.height = parseInt(canvasHeight) - line.margin.top - line.margin.bottom;

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
			.attr("transform", "translate(" + line.margin.left + "," + line.margin.top + ")");
		self.create();
		//self.setTitle();
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