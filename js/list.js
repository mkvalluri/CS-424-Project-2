function HurricaneList(speedUnit, pressureUnit) {
	this.data = null;
	this.sortBy = "name";
	this.sortByAscending = "true";
	this.speedUnit = speedUnit;
	this.pressureUnit = pressureUnit;
	this.target = null;
}

HurricaneList.prototype = {

	constructor: HurricaneList,
	
	//This function is called to populate the container with data.
	//divId = Container ID
	//collection = Data to be loaded 
	loadFilteredData: function (collection, divId) {
		this.data = collection;
		this.target = divId;
		this.filterData(divId, this.sortBy, this.sortByAscending);
	},
	
	filterData : function (divId, sortBy, sortByAscending)
	{
		var sortedList = null;
		if(sortBy == "name")
			sortedList = this.data.sort(sortListByName);
		else if(sortBy == "year")
			sortedList = this.data.sort(sortListByYear);
		else if(sortBy == "wind")
			sortedList = this.data.sort(sortListByWindSpeed);
		if(sortByAscending != "true")
			sortedList.reverse();
		this.loadDivContainer(sortedList, divId);

			function sortListByYear(a, b) {
				return parseFloat(a.year) - parseFloat(b.year);
			};

			function sortListByName(a, b) {
				return a.name.localeCompare(b.name);
			};

			function sortListByWindSpeed(a, b) {
				return parseFloat(a.wind.max) - parseFloat(b.wind.max);
			};
	},

	loadDivContainer: function(data, divId){
		var self = this;

		$(divId).html("");

		$.each(data, function (key, value) {
			var htmlStr = "<div class='col-md-4'><a id='" + value.id + "' class='nameLink cat" + self.getHurricaneCategory(value.wind.max) + "''>" +
				value.name + " - " + value.year + "</a></div>";
			$(divId).append(htmlStr);
		});

		d3.select(self.target).selectAll(".nameLink")
			.on("mouseover", function(){
				var id = $(this).attr('id');
				var hurr = self.data.filter(function(el){ return el.id == id; });
				hurr = hurr[0];

				/* hightlight line */
				d3.selectAll("." + id).classed("lineHighlight", true);

				/* show tooltip information */
				var cat = self.getHurricaneCategory(hurr.wind.max);
				if (self.speedUnit == 'kph'){
					hurr.wind.max = parseFloat(Math.round(hurr.wind.max * 1.60934)).toFixed(0);
					hurr.wind.min = parseFloat(Math.round(hurr.wind.min * 1.60934)).toFixed(0);
					hurr.wind.avg = parseFloat(Math.round(hurr.wind.avg * 1.60934)).toFixed(0);
				} else {
					hurr.wind.max = parseFloat(Math.round(hurr.wind.max)).toFixed(0);
					hurr.wind.min = parseFloat(Math.round(hurr.wind.min)).toFixed(0);
					hurr.wind.avg = parseFloat(Math.round(hurr.wind.avg)).toFixed(0);
				}

				if (self.pressureUnit == 'psi'){
					hurr.pressure.max = parseFloat(Math.round(hurr.pressure.max * 0.0145038)).toFixed(2);
					hurr.pressure.min = parseFloat(Math.round(hurr.pressure.min * 0.0145038)).toFixed(2);
					hurr.pressure.avg = parseFloat(Math.round(hurr.pressure.avg * 0.0145038)).toFixed(2);
				} else {
					hurr.pressure.max = parseFloat(Math.round(hurr.pressure.max)).toFixed(2);
					hurr.pressure.min = parseFloat(Math.round(hurr.pressure.max)).toFixed(2);
					hurr.pressure.avg = parseFloat(Math.round(hurr.pressure.max)).toFixed(2);
				}

				var tooltip = d3.select(".hurr-tooltip");
				var height = parseInt(tooltip.style("height"));
				var width = parseInt(tooltip.style("width"));
				tooltip.select(".tname").html(hurr.name + " (" + hurr.year + ")");
				tooltip.select(".tcategory").html(cat);
				tooltip.select(".tstart").html("");
				tooltip.select(".tend").html("");
				tooltip.select(".tmaxwind").html(hurr.wind.max + " " + self.speedUnit);
				tooltip.select(".tminwind").html(hurr.wind.min + " " + self.speedUnit);
				tooltip.select(".tavgwind").html(hurr.wind.avg + " " + self.speedUnit);
				tooltip.select(".tmaxpressure").html(hurr.pressure.max + " " + self.pressureUnit);
				tooltip.select(".tminpressure").html(hurr.pressure.min + " " + self.pressureUnit);
				tooltip.select(".tavgpressure").html(hurr.pressure.avg + " " + self.pressureUnit);

				tooltip.style("top", (d3.event.pageY - height) + "px");
				tooltip.style("left", (d3.event.pageX - width + 30) + "px");
				tooltip.style("display", "block");

			})
			.on("mouseout", function(){
				var id = $(this).attr('id');
				d3.selectAll("." + id).classed("lineHighlight", false);
				var tooltip = d3.select(".hurr-tooltip");
				tooltip.style("display", "none");
			});		
	},

	getHurricaneCategory: function(speed){
		if (speed >= 137)
			return "H5";
		else if (speed >= 113)
			return "H4";
		else if (speed >= 96)
			return "H3";
		else if (speed >= 83)
			return "H2";
		else if (speed >= 64)
			return "H1";
		else if (speed >= 34)
			return "TS";
		else
			return "TD";
	}
}


/*
function loadDivContainer(data, divId) {
	var self = this;
	self.data = data;

	$(divId).html("");

	$.each(data, function (key, value) {
		var htmlStr = "<div class='col-md-4'><a id='" + value.id + "' class='nameLink'>" +
			value.name + " - " + value.year + "</a></div>";
		$(divId).append(htmlStr);
	});

	d3.selectAll(".nameLink")
		.on("mouseover", function(){
			var id = $(this).attr('id');
			var hurr = self.data.filter(function(el){ return el.id == id; });
			hurr = hurr[0];

			if (self.speedUnit == 'kph'){
				hurr.wind.max = parseFloat(Math.round(hurr.wind.max * 1.60934)).toFixed(0);
				hurr.wind.min = parseFloat(Math.round(hurr.wind.min * 1.60934)).toFixed(0);
				hurr.wind.avg = parseFloat(Math.round(hurr.wind.avg * 1.60934)).toFixed(0);
			} else {
				hurr.wind.max = parseFloat(Math.round(hurr.wind.max)).toFixed(0);
				hurr.wind.min = parseFloat(Math.round(hurr.wind.min)).toFixed(0);
				hurr.wind.avg = parseFloat(Math.round(hurr.wind.avg)).toFixed(0);
			}

			if (self.pressureUnit == 'psi'){
				hurr.pressure.max = parseFloat(Math.round(hurr.pressure.max * 0.0145038)).toFixed(2);
				hurr.pressure.min = parseFloat(Math.round(hurr.pressure.min * 0.0145038)).toFixed(2);
				hurr.pressure.avg = parseFloat(Math.round(hurr.pressure.avg * 0.0145038)).toFixed(2);
			} else {
				hurr.pressure.max = parseFloat(Math.round(hurr.pressure.max)).toFixed(2);
				hurr.pressure.min = parseFloat(Math.round(hurr.pressure.max)).toFixed(2);
				hurr.pressure.avg = parseFloat(Math.round(hurr.pressure.max)).toFixed(2);
			}

			var tooltip = d3.select(".hurr-tooltip");
			var height = parseInt(tooltip.style("height"));
			tooltip.select(".tname").html(hurr.name + " (" + hurr.year + ")");
			tooltip.select(".tcategory").html("Category: ");
			tooltip.select(".tstart").html("");
			tooltip.select(".tend").html("");
			tooltip.select(".tmaxwind").html(hurr.wind.max + " " + self.speedUnit);
			tooltip.select(".tminwind").html(hurr.wind.min + " " + self.speedUnit);
			tooltip.select(".tavgwind").html(hurr.wind.avg + " " + self.speedUnit);
			tooltip.select(".tmaxpressure").html(hurr.pressure.max + " " + self.pressureUnit);
			tooltip.select(".tminpressure").html(hurr.pressure.min + " " + self.pressureUnit);
			tooltip.select(".tavgpressure").html(hurr.pressure.avg + " " + self.pressureUnit);

			tooltip.style("top", (d3.event.pageY - height) + "px");
			tooltip.style("left", (d3.event.pageX - 50) + "px");
			tooltip.style("display", "block");

		})
		.on("mouseout", function(){
			var tooltip = d3.select(".hurr-tooltip");
			tooltip.style("display", "none");
		});
};

function sortListByYear(a, b) {
	return parseFloat(a.year) - parseFloat(b.year);
};

function sortListByName(a, b) {
	return a.name.localeCompare(b.name);
};

function sortListByWindSpeed(a, b) {
	return parseFloat(a.wind.max) - parseFloat(b.wind.max);
};
*/
