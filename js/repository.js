function Repository(){
	this.filter = null;
}

Repository.prototype = {
	constructor: Repository,

	getGeoData: function(){

	},

	//TODO: missing month filter
	searchInReducedData: function(data, filter){
		var self = this;

		var filteredData = data.filter(function(el) { 
			if (filter.type == "name"){
				return el.name == filter.name && el.basin == filter.basin;
			}else{
				var fName = true;
				var fLandFall = true;
				if (filter.name != '')
					fName = (el.name == filter.name);

				if(filter.landfall != 'all') {
					if(filter.landfall == 'yes')
						fLandFall = (el.land == 'L');
					else
						fLandFall = (el.land == '');
				}

				return  fName
						&& el.year >= filter.initial_date.getFullYear() 
						&& el.year <= filter.final_date.getFullYear()
						&& el.basin == filter.basin
						&& el.wind.avg <= filter.max_wind
						&& el.wind.avg >= filter.min_wind
						&& el.pressure.avg >= filter.min_pressure
						&& el.pressure.avg <= filter.max_pressure
						&& fLandFall;
			}
		});

		filteredData = self.sortByWindSpeed(filteredData);
		if (filteredData.length > filter.top)
			return filteredData.slice(0, filter.top);
		else
			return filteredData;
	},

	sortByWindSpeed: function(data){
		return data.sort(sortWind);

		function sortWind(a, b) {
			return parseFloat(a.wind.max) - parseFloat(b.wind.max);
		};
	}
}