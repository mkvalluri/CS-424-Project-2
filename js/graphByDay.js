/* global $ */
/* global svg */
/* global d3 */

/*
	Bar chart for showing the number of hurricanes per year in a basin
*/

function LineChartByDay(target, type, data, filter, basin) {
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
	this.chart.filter = filter;
	this.chart.filteredData = null;
	this.chart.basin = basin;

	this.chart.xScale = null;
	this.chart.yScale = null;
	this.chart.xAxis = null;
	this.chart.yAxis = null;

	this.chart.maxYValue = -1;

	this.chart.barPadding = 1;
}

LineChartByDay.prototype = {
	constructor: LineChartByDay,

	filterData: function () {
		var self = this,
			bar = this.chart;

		var jsonArr = [];
		$.each(bar.data, function (index, obj) {
			var t = obj.data.filter(function (d) {
				if (bar.basin == "both")
					return d.wind.min >= bar.filter.max_wind.min && d.wind.max <= bar.filter.max_wind.max
						&& d.pressure.min >= bar.filter.min_pressure.min && d.pressure.max <= bar.filter.min_pressure.max;
				else
					return d.basin == bar.basin
						&& d.wind.min >= bar.filter.max_wind.min && d.wind.max <= bar.filter.max_wind.max
						&& d.pressure.min >= bar.filter.min_pressure.min && d.pressure.max <= bar.filter.min_pressure.max;
			});
			jsonArr.push({ "month": obj.month, "data": t });
		});

		bar.filteredData = jsonArr;
		bar.maxYValue = -1;
		$.each(bar.filteredData, function (index, obj) {
			if (bar.maxYValue < obj.data.length) {
				bar.maxYValue = obj.data.length;
			}
		});

	},

	setTitle: function () {
		var bar = this.chart;

		if (bar.type == "num-hurricanes") {
			bar.title = "Hurricanes per Date in the ";
			if (bar.basin == "AL")
				bar.title = bar.title + " Atlantic Ocean";
			else
				bar.title = bar.title + " North East Pacific Ocean";
		} else if (bar.type == "max-wind")
			bar.title = "Max. Wind Speed per Date";
		else if (bar.type == "min-pressure")
			bar.title = "Min. Pressure per Date";
		else
			bar.title = "Unknown";
		bar.title = bar.title + " (" + bar.filter.year_init + " - " + bar.filter.year_end + ")";

		bar.svg.append("g")
			.append("text")
			.attr("transform", "translate(" + (bar.width / 2) + "," + (bar.margin.top / 2) + ")")
			.attr("text-anchor", "middle")
			.attr("class", "chart-title")
			.text(bar.title);
	},

	createTooltip: function () {
		var bar = this.chart;

		bar.tooltip = d3.select(bar.tag)
			.append("div")
			.attr("class", "chart-tooltip");
		bar.tooltip.append("span")
			.attr("class", "tooltip-year");
		bar.tooltip.append("span")
			.attr("class", "tooltip-total");
	},

	create: function () {
		var self = this,
			bar = this.chart;

		//self.filterData();
		// Configure scales and axis
		//bar.xScale.domain([new Date(2011, 6, 1), new Date(2012, 4, 31)]);
		bar.xScale.domain([0, d3.max(bar.data, function (d) { return d.dayOfYear; })]);

		bar.yScale.domain([d3.max(bar.data, function (d) { return getData(bar.type, d, 0); }), 0]);

		bar.xAxis = d3.svg.axis()
			.scale(bar.xScale)
			.orient("bottom")
			.ticks(12);

		bar.yAxis = d3.svg.axis()
			.scale(bar.yScale)
			.orient("left")
			.tickPadding(10);

		var line = d3.svg.line()
			.interpolate("basis")
			.x(function (d) {
				return bar.xScale(d.dayOfYear);
			})
			.y(function (d) {
				return getData(bar.type, d, 0);
			});

		bar.svg.append("path")
			.data([bar.data])
			.attr("d", line)
			.attr('stroke', 'green')
			.attr('stroke-width', 2)
			.attr('fill', 'none');
		// Bind bars (svg rectangles) to data
		/*	bars.enter().append("rect")
			.attr({
					x: function(d, i) { return i * (bar.width / bar.filteredData.length)  },
					y: function(d) { return bar.yScale(d.data.length); },
					width: bar.width / bar.filteredData.length - bar.barPadding,
					height: function(d) {
						return bar.height - bar.yScale(d.data.length); },
					class: "bar_rect"
			});
	
		bars.exit().transition().duration(500).remove();
	
		bars.on("mouseover", function(d){
			var x = (d3.event.pageX);
			bar.tooltip.select(".tooltip-year").html(getMonth(d.month) + ": ");
			bar.tooltip.select(".tooltip-total").html(d.data.length + " events");
			bar.tooltip.style("top", (d3.event.pageY) + "px");
			if (x < bar.width/2)
				bar.tooltip.style("left", (d3.event.pageX) + "px");
			else 
				bar.tooltip.style("left", (d3.event.pageX) - 110 + "px");
			bar.tooltip.style("display", "block");
		});
		bars.on("mouseout", function(d){
			bar.tooltip.style("display", "none");
		});*/
		
		
		// Append the xAxis and yAxis to the bar chart
		bar.svg.append("g")
			.call(bar.xAxis)
			.attr("class", "x axis")
			.attr("transform", "translate(0," + bar.height + ")")
			.selectAll("text")
			.attr("transform", "translate(20,0)")
			.style("text-anchor", "middle");

		bar.svg.append("g")
			.call(bar.yAxis)
			.attr("class", "y axis")
			.attr("transform", "translate(-10,0)");

	},

	keys: function (d) {
		return d.year;
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

		bar.svg.select(".x.axis")
			.call(bar.xAxis.orient("bottom"))
			.attr("transform", "translate(0," + bar.height + ")");
		svg.select(".y.axis").call(bar.yAxis.orient("left"));

		svg.selectAll(".bar_rect").attr({
			x: function (d, i) { return i * (bar.width / bar.filteredData.length) },
			y: function (d) { return bar.yScale(d.total); },
			width: bar.width / bar.filteredData.length - bar.barPadding,
			height: function (d) { return bar.height - bar.yScale(d.total); }
		});

	},

	update: function (filter, basin) {
		var self = this,
			bar = this.chart;

		bar.filter = filter;
		bar.basin = basin;
		d3.selectAll(".bar_rect").remove();

		d3.select(".y.axis").remove();
		d3.select(".x.axis").remove();

		self.create();
	},

	init: function () {
		var self = this,
			bar = this.chart,
			canvasWidth = d3.select(bar.tag).style("width"),
			canvasHeight = d3.select(bar.tag).style("height");

		/* Set the canvas size based on mbostock's best practices */
		bar.width = parseInt(canvasWidth) - bar.margin.left - bar.margin.right,
		bar.height = parseInt(canvasHeight) - bar.margin.top - bar.margin.bottom;

		/* Create the bar:onhover information tooltip */
		self.createTooltip();

		/* Set the scale values based on the canvas size */
		bar.xScale = d3.scale.linear().range([0, bar.width]);
		bar.yScale = d3.scale.linear().range([0, bar.height]);

		/* Set the svg container and create the graph */
		bar.svg = d3.select(bar.tag).append("svg")
			.attr({
				width: bar.width + bar.margin.left + bar.margin.right,
				height: bar.height + bar.margin.top + bar.margin.bottom
			})
			.append("g")
			.attr("transform", "translate(" + bar.margin.left + "," + bar.margin.top + ")");
		self.create();
		//self.setTitle();
	}

}
function getData(type, d, i) {
	console.log(d);
	console.log(i);
	console.log(type);
	if (type == "max-wind") {
		if (i == 0)
			return d.wind.min;
		else if (i == 1)
			return d.wind.max;
		else if (i == 2)
			return d.wind.avg;
	}
	if (type == "max-pressure") {
		if (i == 0)
			return d.pressure.min;
		else if (i == 1)
			return d.pressure.max;
		else if (i == 2)
			return d.pressure.avg;
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