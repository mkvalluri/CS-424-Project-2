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
						&& dateRangeOverlaps(filter.initial_date, filter.final_date,
							formatDate(el.startDate), formatDate(el.endDate))
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

function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
    if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
    if (a_start <= b_end   && b_end   <= a_end) return true; // b ends in a
    if (b_start <  a_start && a_end   <  b_end) return true; // a in b
    return false;
}

function formatDate (inputDate) {
	var dateString  = inputDate;
	var year        = dateString.substring(0,4);
	var month       = dateString.substring(4,6);
	var day         = dateString.substring(6,8);

	return new Date(year, month-1, day);
}