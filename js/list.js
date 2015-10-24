function HurricaneList() {
	this.data = null;
	this.sortBy = "name";
	this.sortByAscending = "true";
}

HurricaneList.prototype = {
	
	//This function is called to populate the container with data.
	//divId = Container ID
	//collection = Data to be loaded 
	loadFilteredData: function (collection, divId) {
		this.data = collection;
		this.filterData(divId, this.sortBy, this.sortByAscending);
	},
	
	filterData : function (divId, sortBy, sortByAscending)
	{
		var sortedList = null;
		console.log(divId);
		console.log(sortBy);
		console.log(sortByAscending);
		if(sortBy == "name")
			sortedList = this.data.sort(sortListByName);
		else if(sortBy == "year")
			sortedList = this.data.sort(sortListByYear);
		else if(sortBy == "wind")
			sortedList = this.data.sort(sortListByWindSpeed);
		if(sortByAscending != "true")
			sortedList.reverse();
		loadDivContainer(sortedList, divId);
	}
	
}

function loadDivContainer(data, divId) {
	$(divId).html("");

	$.each(data, function (key, value) {
		var htmlStr = "<div class='col-md-4'><a id='" + value.id + "' class='nameLink'>" +
			value.name + " - " + value.year + "</a></div>";
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

