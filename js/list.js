function DataAccess()
{
	this.data = null;
	this.filteredData = null;
	this.hurricaneListNames_AL = null;
	this.hurricaneListNames_PA = null;
}

DataAccess.prototype = {
	
	init: function() {
		d3.json("../resources/filteredData.json", this.loadFilteredData);
	},
	
	loadFilteredData: function(error, collection) {
		this.hurricaneListNames = collection;
		console.log("Loaded Hurricane List Names");
		var sortedList = this.hurricaneListNames.sort(sortListByName);

		/*
		$.each(sortedList, function(key, value) {
			var htmlStr = "<div class='col-md-4'><a id='" + value.id + "' class='nameLink'>" +
							value.basin + " - " + value.name + " - " + value.year + "</a></div>";
			//if(value.basin == 'AL')
  				$("#atlanticList").append(htmlStr);
		//	else
		//		$("#pacificList").append(htmlStr);
		}); */



		loadDivContainer(sortedList);
	}	
}

function loadDivContainer(data) {
			var container = d3.select("#atlanticList");
		container.selectAll(".nameLink").remove();

		container.selectAll(".nameLink").data(data)
			.enter().append("div")
			.html(function(d){
				return "<div class='col-md-4'>" +
						"<a id='" + d.id + "' class='nameLink'>" +
							d.basin + " - " + d.name + " - " + d.year + 
						"</a></div>";
			});

/*	$.each(data, function(key, value) {
			var htmlStr = "<div class='col-md-3'><a id='" + value.id + "' class='nameLink'>" +
						 	value.basin + " - " + value.name + " - " + value.year + "</a></div>";
			$("#atlanticList").append(htmlStr);
		});
*/
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

