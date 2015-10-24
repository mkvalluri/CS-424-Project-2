function App(){
	this.map = null;
	this.bchartAtlantic = null;
	this.bchartPacific = null;
	this.reducedData = null;

	this.repository = new Repository();
	this.mapFilter = {};
	this.barFilter = {};
	this.listAtlantic = null;
	this.listPacific = null;
}

App.prototype = {
	constructor: App,

	selectLandfallFilter: function(id){
		d3.selectAll(".btn-landfall").classed("btn-primary", false);
		d3.selectAll(".btn-landfall").classed("btn-default", true);

		d3.select(id).classed("btn-primary", true);
		if (id == "btn-landfall-all") mapFilter.landfall = "all";
		else if (id == "btn-landfall-yes") mapFilter.landfall = "yes";
		else if (id == "btn-landfall-no") mapFilter.landfall = "no";
	},

	search: function(){
		var self = this;	

		if ($('#chk-search-name').is(":checked")){
			self.mapFilter.type = "name";
			self.mapFilter.name = $('#hurr-name').val().toUpperCase().trim();
		} else {
			self.mapFilter.type = "other";
			self.mapFilter.initial_date = $('#initial-date').datepicker('getDate');
			self.mapFilter.final_date = $('#final-date').datepicker('getDate');
			self.mapFilter.min_wind = $('#min-wind').val();
			self.mapFilter.max_wind = $('#max-wind').val();
			self.mapFilter.min_pressure = $('#min-pressure').val();
			self.mapFilter.max_pressure = $('#max-pressure').val();
		};

		// Data for filling the list items
<<<<<<< Updated upstream
		var reducedData = self.repository.searchInReducedData(self.reducedData, self.mapFilter);
		var list = new List();
		list.loadFilteredData(null, reducedData);
=======
		self.listAtlantic = new HurricaneList();
		self.listPacific = new HurricaneList();

		self.mapFilter.basin = "AL";
		var reducedDataAL = self.repository.searchInReducedData(self.reducedData, self.mapFilter);
		self.mapFilter.basin = "EP";
		var reducedDataPA = self.repository.searchInReducedData(self.reducedData, self.mapFilter);
		self.listAtlantic.loadFilteredData(reducedDataAL, "#atlanticList");
		self.listPacific.loadFilteredData(reducedDataPA, "#pacificList");

>>>>>>> Stashed changes
		d3.selectAll(".nameLink").on("click", function(d){
			var hurrId = $(this).attr('id');
			var paths = d3.selectAll("." + hurrId).style("opacity",1);
			var dataPoints = d3.selectAll(".waypoints").filter(function(d){ return d.properties.id == hurrId });

			if ($(this).hasClass('linkHideHurricane')){
				paths.style("opacity",1);
				dataPoints.style("opacity",1);
				$(this).removeClass("linkHideHurricane");
			} else {
				paths.style("opacity",0);
				dataPoints.style("opacity",0);
				$(this).addClass("linkHideHurricane");
			}
		});
		
		// Add the data to the maps
		self.map.addHurricane(self.mapFilter);
	},

	play: function(){
		var self = this;

		var status = $('#btnplay').attr('alt');
		if (status == "play"){ 
			$('#btnplay').attr('src', "./resources/pause44white.png");
			$('#btnplay').attr('alt', "pause");
		} else {
			$('#btnplay').attr('src', "./resources/play128white.png");
			$('#btnplay').attr('alt', "play");
		}

		var rate = $("#frame-rate").val().trim();

		var filter = {};
			filter.initial_date = $('#initial-date').datepicker('getDate');
			filter.final_date = $('#final-date').datepicker('getDate');
		self.map.play(filter, rate);
	},

	stop: function(){
		var self = this;

		$('#btnplay').attr('src', "./resources/play128white.png");
		self.map.stop();
	},

	selectFilter: function(id){
		var nameDisabled = false;
		if (id=='#chk-search-others'){
			$('#chk-search-name').prop("checked", false);
			nameDisabled = true;
		}else {
			$('#chk-search-others').prop("checked", false);
		}

		$('#hurr-name').prop('disabled', nameDisabled);
		$('#initial-date').prop('disabled', !nameDisabled);
		$('#final-date').prop('disabled', !nameDisabled);
		$('#btn-landfall-all').prop('disabled', !nameDisabled);
		$('#btn-landfall-yes').prop('disabled', !nameDisabled);
		$('#btn-landfall-no').prop('disabled', !nameDisabled);
		$('#min-wind').prop('disabled', !nameDisabled);
		$('#max-wind').prop('disabled', !nameDisabled);
		$('#min-pressure').prop('disabled', !nameDisabled);
		$('#max-pressure').prop('disabled', !nameDisabled);
	},

	loadDetailedBoundaries: function(data){
		d3.json("./resources/data/africa.geo.json", function(err0, dat0){
			data.push(dat0);
			d3.json("./resources/data/ca-all.geo.json", function(err1, dat1){
				data.push(dat1);
				d3.json("./resources/data/mx-all.geo.json", function(err2, dat2){
					data.push(dat2);
					return data;
				});
			});
		});
		return data;
	},

	init: function(){
		var self = this,
			mainMap = null;

		/* set validations on controls */
		$('#initial-date').datepicker({
		    startDate: "01/01/1851"
		});

		$('#final-date').datepicker({
		    startDate: "01/01/1851"
		});

		d3.select("#frame-rate").on("focusout", function(){
			var val = $(this).val();
			if (val < 20) $(this).val(20);
			else if (val > 1000) $(this).val(1000);
		});

		/* setup the click events on the application buttons */
		d3.selectAll(".btn-landfall")
			.on("click", function(){
				self.selectLandfallFilter("#" + $(this).attr('id'));
			});
		d3.select("#btn-search").on("click", function(){ self.search(); });
		d3.select("#btnplay").on("click", function(){ self.play(); });
		d3.select("#btnstop").on("click", function(){ self.stop(); });
		d3.select("#chk-search-name").on("click", function(){ self.selectFilter("#chk-search-name");});
		d3.select("#chk-search-others").on("click", function(){ self.selectFilter("#chk-search-others");});

		$('.listFilter').change(function(){
			var containerId = "#" + $(this).attr('id').slice(0, -8);
			var sortBy = $(this).val();
			var sortByOrder = $(containerId + "Filter_2").val();

			if (containerId == "#atlanticList")
				self.listAtlantic.filterData(containerId, sortBy, sortByOrder);
			else
				self.listPacific.filterData(containerId, sortBy, sortByOrder);
		});
		
		$('.listFilterBy').change(function(){
			var containerId = "#" + $(this).attr('id').slice(0, -8);
			var sortBy = $(containerId + "Filter_1").val();
			var sortByAsending = $(this).val();
			if (containerId == "#atlanticList")
				self.listAtlantic.filterData(containerId, sortBy, sortByAsending);
			else
				self.listPacific.filterData(containerId, sortBy, sortByAsending);
		});

		/* set the initial filters */
		self.mapFilter.landfall = "all";
		self.mapFilter.initial_date = $('#initial-date').datepicker('getDate');
		self.mapFilter.final_date = $('#final-date').datepicker('getDate');
		self.mapFilter.name = "";
		self.mapFilter.min_wind = $('#min-wind').val();
		self.mapFilter.max_wind = $('#max-wind').val();
		self.mapFilter.min_pressure = $('#min-pressure').val();
		self.mapFilter.max_pressure = $('#max-pressure').val();

		self.barFilter.year_init = 1851;
		self.barFilter.year_end = 2014;
		self.selectFilter("#chk-search-others");

		var boundaries = [];
		d3.json("./resources/geojson/boundaries_admin_1.geojson", function(err0, bData){
			boundaries.push(bData);
			//boundaries = self.loadDetailedBoundaries(boundaries);

			d3.json("./resources/data.json", function(err1, collection){
				if (err1) throw err1;
				mainMap = new Map(collection, boundaries, "map-container", 5);
				mainMap.init();
				self.map = mainMap;

				d3.json("./resources/filteredData.json", function(err2, data) {
					if (err2) throw err2;
					self.bchartAtlantic = new BarChart("#bc-container-nohurrAL", "num-hurricanes", data, self.barFilter, "AL");
					self.bchartPacific = new BarChart("#bc-container-nohurrPA", "num-hurricanes", data, self.barFilter, "PA");

					self.bchartAtlantic.init();
					self.bchartPacific.init();
					self.reducedData = data;

					self.search();	
				});
			});
		});
	}
}