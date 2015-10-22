function Repository(){
	this.filter = null;
}

Repository.prototype = {
	constructor: Repository,

	getGeoData: function(){

	},

	searchInReducedData: function(data, filter){
		return data.filter(function(el) { 
			if (filter.type == "name"){
				return el.name == filter.name;
			}else{
				var x = 1;
				return  el.year >= filter.initial_date.getFullYear() 
						&& el.year <= filter.final_date.getFullYear();
						//&& el.maxwind >= filter.min_wind
						//&& el.maxwind <= filter.max_wind;
						//&& el.properties.minpressure >= filter.min_pressure
						//&& el.properties.minpressure <= filter.max_pressure;
			}
		});
	}
}