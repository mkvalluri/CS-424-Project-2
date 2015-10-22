function HurricaneList() {
	this.data = null;
	this.filteredData = null;
	this.hurricaneListNames_AL = null;
	this.hurricaneListNames_PA = null;
}

HurricaneList.prototype = {
	
	/*init: function() {
		d3.json("../resources/filteredData.json", this.loadFilteredData);
	},*/

	//This function is called to populate the container with data.
	//divId = Container ID
	//collection = Data to be loaded 
	loadFilteredData: function (collection, divId) {
		this.hurricaneListNames = collection;
		console.log("Loaded Hurricane List Names");
		var sortedList = this.hurricaneListNames.sort(sortListByName);
		loadDivContainer(sortedList, divId);
	}
}

function loadDivContainer(data, divId) {
	var container = d3.select(divId);
	container.selectAll(".nameLink").remove();

	container.selectAll(".nameLink").data(data)
		.enter().append("div")
		.html(function (d) {
			return "<div class='col-md-4'>" +
				"<a id='" + d.id + "' class='nameLink'>" +
				d.basin + " - " + d.name + " - " + d.year +
				"</a></div>";
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

