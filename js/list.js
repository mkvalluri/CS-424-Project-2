function HurricaneList() {
	this.data = null;
	this.filteredData = null;
	this.hurricaneListNames_AL = null;
	this.hurricaneListNames_PA = null;
}

HurricaneList.prototype = {
	
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
	$(divId).html("");

	$.each(data, function (key, value) {
		var htmlStr = "<div class='col-md-2'><a id='" + value.id + "' class='nameLink'>" +
			value.basin + " - " + value.name + " - " + value.year + "</a></div>";
		$(divId).append(htmlStr);
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

