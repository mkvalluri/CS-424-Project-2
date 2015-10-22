function DataAccess()
{
	this.data = null;
	this.filteredData = null;
	this.hurricaneListNames = null;
}

DataAccess.prototype = {
	
	init: function() {
		d3.json("../resources/filteredData.json", this.loadFilteredData);
	},
	
	loadFilteredData: function(error, collection) {
		this.hurricaneListNames = collection;
		console.log("Loaded Hurricane List Names");
		var sortedList = this.hurricaneListNames.sort(sortListByWindSpeed);
		$.each(sortedList, function(key, value) {
			var htmlStr = "<div class='col-md-2'><a id='" + value.id + "' class='nameLink'>" +
						 	value.basin + " - " + value.name + " - " + value.year + "</a></div>";
			//if(value.basin == 'AL')
  				$("#atlanticList").append(htmlStr);
		//	else
		//		$("#pacificList").append(htmlStr);
		}); 
	},
	
	loadDivContainer: function(data) {
		$.each(data, function(key, value) {
			var htmlStr = "<div class='col-md-2'><a id='" + value.id + "' class='nameLink'>" +
						 	value.basin + " - " + value.name + " - " + value.year + "</a></div>";
			$("#atlanticList").append(htmlStr);
		}); 
	}
}

function sortListByYear(a, b) {
	//console.log(b);
	return parseFloat(a.year) - parseFloat(b.year);
}

function sortListByName(a, b) {
	return a.name.localeCompare(b.name);
}

function sortListByWindSpeed(a, b) {
	return parseFloat(a.wind.max) - parseFloat(b.wind.max);
}