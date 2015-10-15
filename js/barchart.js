/*
	Bar chart for showing the number of hurricanes per year in a basin
*/
function BarChart(target, type, data, filter, basin){
	this.chart = {};
	this.chart.margin = {top: 50, right: 20, bottom: 40, left: 80};
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

	this.chart.barPadding = 1;
}

BarChart.prototype = {
	constructor: BarChart,

	filterData: function(){
		var self = this,
			bar  = this.chart;

		if (bar.filter.year_init == "") bar.filter.year_init = 1851;
		if (bar.filter.year_end == "") bar.filter.year_end = 2015;

		var jsonArr = [];
		for (var i = bar.filter.year_init; i <= bar.filter.year_end; i++){
			bar.filteredData = bar.data.filter(
				function(el) { return el.year == i } //&& el.basin == basin 
			);
			jsonArr.push({
        		year: i,
        		total: bar.filteredData.length
    		});
		}

		bar.filteredData = jsonArr;
	},

	setTitle: function(){
		var bar = this.chart;

		if (bar.type == "num-hurricanes"){
			bar.title = "Hurricanes per year in the ";
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
				 .attr("transform", "translate(" + (bar.width/2) + "," + 0 +")")
				 .attr("text-anchor", "middle")
				 .attr("class", "chart-title")
				 .text(bar.title);
	},

	createTooltip: function(){
		var bar = this.chart;

		bar.tooltip = d3.select(bar.tag)
						.append("div")
						.attr("class", "chart-tooltip");
		bar.tooltip.append("span")
				   .attr("class","tooltip-year");
		bar.tooltip.append("span")
				   .attr("class","tooltip-total");
	},

	create: function(){
		var self = this,
			bar = this.chart;

		self.filterData();

		// Configure scales and axis
		var maxY = d3.max(bar.filteredData, function(d) { return d.total; });

		bar.xScale.domain([new Date(bar.filter.year_init,0,1), new Date(bar.filter.year_end,0,1)]);
		bar.yScale.domain([maxY,0]);

		bar.xAxis = d3.svg.axis()
						.scale(bar.xScale)
						.orient("bottom");

		bar.yAxis = d3.svg.axis()
						.scale(bar.yScale)
						.orient("left")
						.ticks(10)
						.tickFormat(function(d){ return d });

		// Bind bars (svg rectangles) to data
		var barContainer = bar.svg.append("g").attr("class", "bar");
		var bars = barContainer.selectAll("rect")
					  .data(bar.filteredData, this.keys);
		bars.enter().append("rect")
			  .attr({
			  		x: function(d, i) { return i * (bar.width / bar.filteredData.length)  },
			  		y: function(d) { return bar.yScale(d.total); },
			  		width: bar.width / bar.filteredData.length - bar.barPadding,
			  		height: function(d) { return bar.height - bar.yScale(d.total); },
			  		class: "bar_rect"
			  });

		bars.exit().transition().duration(500).remove();
		bars.on("mouseover", function(d){
			var x = (d3.event.pageX);

			bar.tooltip.select(".tooltip-year").html(d.year + ": ");
			bar.tooltip.select(".tooltip-total").html(d.total + " events");
			bar.tooltip.style("top", (d3.event.pageY) + "px");
			if (x < bar.width/2)
				bar.tooltip.style("left", (d3.event.pageX) + "px");
			else 
				bar.tooltip.style("left", (d3.event.pageX) - 110 + "px");
			bar.tooltip.style("display", "block");
		});
		bars.on("mouseout", function(d){
			bar.tooltip.style("display", "none");
		});

		// Append the xAxis and yAxis to the bar chart
		bar.svg.append("g")
				.call(bar.xAxis)
					.attr("class", "x axis")
					.attr("transform", "translate(0," + bar.height + ")")
				.selectAll("text")
    				.style("text-anchor", "middle");
		bar.svg.append("g")
				.call(bar.yAxis)
					.attr("class", "y axis")
					.attr("transform", "translate(-10,0)");
	},

	keys: function(d){
		return d.year;
	},

	resize: function(){
		var self = this,
			bar = this.chart,
			canvasWidth  = d3.select(bar.tag).style("width"),
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
	  		x: function(d, i) { return i * (bar.width / bar.filteredData.length)  },
	  		y: function(d) { return bar.yScale(d.total); },
	  		width: bar.width / bar.filteredData.length - bar.barPadding,
	  		height: function(d) { return bar.height - bar.yScale(d.total); }
		});

	},

	update: function(filter){
		var self = this,
			bar = this.chart;

		d3.select(".chart-title").remove();

		bar.filter = filter;
		d3.selectAll(".bar_rect").remove();

		d3.select(".y.axis").remove();
		d3.select(".x.axis").remove();

		self.create();
		self.setTitle();
		/*
		bar.filter = filter;
		self.filterData();

		var maxY = d3.max(bar.filteredData, function(d) { return d.total; });
		bar.xScale.domain([new Date(bar.filter.year_init,0,1), new Date(bar.filter.year_end,0,1)]);
		bar.yScale.domain([maxY,0]);

		d3.select(".y.axis")
					.transition()
					.duration(500)
					.call(bar.yAxis.orient("left"));
		d3.selectAll(".bar_rect").remove();
		d3.selectAll(".bar_rect")
				.data(bar.filteredData, self.keys)
				.transition()
				.duration(500)
				.attr({
			  		x: function(d, i) { return i * (bar.width / bar.filteredData.length)  },
			  		y: function(d) { return bar.yScale(d.total); },
			  		width: bar.width / bar.filteredData.length - bar.barPadding,
			  		height: function(d) { return bar.height - bar.yScale(d.total); }
				});*/
	},

	init: function(){
		var self = this,
			bar  = this.chart,
			canvasWidth  = d3.select(bar.tag).style("width"),
		    canvasHeight = d3.select(bar.tag).style("height");

		/* Set the canvas size based on mbostock's best practices */
		bar.width = parseInt(canvasWidth) - bar.margin.left - bar.margin.right,
		bar.height = parseInt(canvasHeight) - bar.margin.top - bar.margin.bottom;

		/* Create the bar:onhover information tooltip */
		self.createTooltip();

		/* Set the scale values based on the canvas size */
		bar.xScale = d3.time.scale().range([0, bar.width]);
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
		self.setTitle();
	}

}