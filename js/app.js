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
	this.tooltip = null;
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

		if (!$('#chk-search-others').is(":checked")){
			self.mapFilter.type = "name";
			self.mapFilter.name = $('#hurr-name').val().toUpperCase().trim();
		} else {
			self.mapFilter.type = "other";
			self.mapFilter.name = $('#hurr-name').val().toUpperCase().trim();
			self.mapFilter.initial_date = $('#initial-date').datepicker('getDate');
			self.mapFilter.final_date = $('#final-date').datepicker('getDate');
			self.mapFilter.windunit = $('#cb-wind-speed').val();
			self.mapFilter.min_wind = $('#min-wind').val();
			self.mapFilter.max_wind = $('#max-wind').val();
			if (self.mapFilter.windunit == 'kph'){
				self.mapFilter.min_wind = self.mapFilter.min_wind * 0.621371;
				self.mapFilter.max_wind = self.mapFilter.max_wind * 0.621371;
			}
			self.mapFilter.pressureunit = $('#cb-pressure').val();
			self.mapFilter.min_pressure = $('#min-pressure').val();
			self.mapFilter.max_pressure = $('#max-pressure').val();
			if (self.mapFilter.pressureunit == 'psi'){
				self.mapFilter.min_pressure = self.mapFilter.min_pressure * 68.9476;
				self.mapFilter.max_pressure = self.mapFilter.max_pressure * 68.9476;
			}
			self.mapFilter.top = parseInt($('#top-filter').val());
		};

		// Data for filling the list items
		self.listAtlantic = new HurricaneList(self.mapFilter.windunit, self.mapFilter.pressureunit);
		self.listPacific = new HurricaneList(self.mapFilter.windunit, self.mapFilter.pressureunit);

		self.mapFilter.basin = "AL";
		var reducedDataAL = self.repository.searchInReducedData(self.reducedData, self.mapFilter);
		self.mapFilter.basin = "EP";
		var reducedDataPA = self.repository.searchInReducedData(self.reducedData, self.mapFilter);
		self.listAtlantic.loadFilteredData(reducedDataAL, "#atlanticList");
		self.listPacific.loadFilteredData(reducedDataPA, "#pacificList");

		if (reducedDataAL == undefined)
			$("#cant-atlantic").html("&nbsp;(0 Results)");
		else
			$("#cant-atlantic").html("&nbsp;(" + reducedDataAL.length + " Results)");

		if (reducedDataPA == undefined)
			$("#cant-pacific").html("&nbsp;(0 Results)");
		else
			$("#cant-pacific").html("&nbsp;(" + reducedDataPA.length + " Results)");

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

	reset: function(){
		var self = this;

		$('#hurr-name').val('');
		$('#initial-date').datepicker("update", new Date(2014,04,01));
		$('#final-date').datepicker("update", new Date(2014,11,01));
		$('#min-wind').val(0);
		$('#max-wind').val(200);
		$('#cb-pressure').val("mph");
		$('#cb-pressure').val("mbar");
		$('#min-pressure').val(0);
		$('#max-pressure').val(1000);
		$('#top-filter').val(100);
		self.selectLandfallFilter("#btn-landfall-all");
		$("#chk-search-others").prop("checked",true);

		self.search();
	},

	selectFilter: function(){
		var enableOthers = true;

		if ($('#chk-search-others').is(":checked"))
			enableOthers = false;

		$('#initial-date').prop('disabled', enableOthers);
		$('#final-date').prop('disabled', enableOthers);
		$('#btn-landfall-all').prop('disabled', enableOthers);
		$('#btn-landfall-yes').prop('disabled', enableOthers);
		$('#btn-landfall-no').prop('disabled', enableOthers);
		$('#min-wind').prop('disabled', enableOthers);
		$('#max-wind').prop('disabled', enableOthers);
		$('#min-pressure').prop('disabled', enableOthers);
		$('#cb-wind-speed').prop('disabled', enableOthers);
		$('#cb-pressure').prop('disabled', enableOthers);
		$('#top-filter').prop('disabled', enableOthers);
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

	createHurrTooltip: function(){
		var self = this;

		self.tooltip = d3.select("#hurr-tooltip")
						.append("div")
						.attr("class", "hurr-tooltip");
		var divTitle = self.tooltip.append("div").attr("class","h-tool-title");
		divTitle.append("span").attr("class", "tname");
		divTitle.append("span").attr("class", "tyear");

		var divCat = self.tooltip.append("div").attr("class","h-tool-category");
		divCat.append("span").attr("class", "tlabel").html("Category: ");
		divCat.append("span").attr("class", "tcategory tvalue");
		
		var divStart = self.tooltip.append("div").attr("class","h-tool-start");
		divStart.append("span").attr("class", "tlabel").html("Start Date: ");
		divStart.append("span").attr("class", "tstart tvalue");

		var divEnd = self.tooltip.append("div").attr("class","h-tool-end");
		divEnd.append("span").attr("class", "tlabel").html("End Date: ");
		divEnd.append("span").attr("class", "tend tvalue");

		var divMaxWind = self.tooltip.append("div").attr("class","h-tool-maxwind");
		divMaxWind.append("span").attr("class", "tlabel").html("Max Wind: ");
		divMaxWind.append("span").attr("class", "tmaxwind tvalue");

		var divMindWind = self.tooltip.append("div").attr("class","h-tool-minwind");
		divMindWind.append("span").attr("class", "tlabel").html("Min Wind: ");
		divMindWind.append("span").attr("class", "tminwind tvalue");

		var divAvgWind = self.tooltip.append("div").attr("class","h-tool-avgwind");
		divAvgWind.append("span").attr("class", "tlabel").html("Avg Wind: ");
		divAvgWind.append("span").attr("class", "tavgwind tvalue");

		var divMaxPressure = self.tooltip.append("div").attr("class","h-tool-maxpressure");
		divMaxPressure.append("span").attr("class", "tlabel").html("Max Pressure: ");
		divMaxPressure.append("span").attr("class", "tmaxpressure tvalue");

		var divMinPressure = self.tooltip.append("div").attr("class","h-tool-minpressure");
		divMinPressure.append("span").attr("class", "tlabel").html("Min Pressure: ");
		divMinPressure.append("span").attr("class", "tminpressure tvalue");

		var divAvgPressure = self.tooltip.append("div").attr("class","h-tool-avgpressure");
		divAvgPressure.append("span").attr("class", "tlabel").html("Avg Pressure: ");
		divAvgPressure.append("span").attr("class", "tavgpressure tvalue");
	},

	createBarLegendTooltip: function(){
		var self = this;

		var tooltip = d3.select("#bar-tooltip")
						.append("div")
						.attr("class", "bar-tooltip");
		tooltip.append("div").attr("class", "bt-title")
				.html("Technologies Available");
		var list = tooltip.append("ul");
		var li1850 = list.append("li").attr("class", "bt-1850");
		li1850.append("span").style("background-color", "rgba(255,245,240,1)");
		li1850.append("span").attr("class", "bt-info").html("< 1914: Observations");

		var li1914 = list.append("li").attr("class", "bt-1914");
		li1914.append("span").style("background-color","rgba(254,224,210,1)");
		li1914.append("span").attr("class", "bt-info").html("> 1914: Reconnaissance Aircraft");

		var li1957 = list.append("li").attr("class", "bt-1957");
		li1957.append("span").style("background-color","rgba(252,187,161,1)");
		li1957.append("span").attr("class", "bt-info").html("> 1957: Radars");	

		var li1960 = list.append("li").attr("class", "bt-1960");
		li1960.append("span").style("background-color","rgba(252,146,114,1)");
		li1960.append("span").attr("class", "bt-info").html("> 1960: Satellites");

		var li1990 = list.append("li").attr("class", "bt-1990");
		li1990.append("span").style("background-color","rgba(251,106,74,1)");
		li1990.append("span").attr("class", "bt-info").html("> 1990: Doppler Radar");

		var li2002 = list.append("li").attr("class", "bt-2002");
		li2002.append("span").style("background-color","rgba(239,59,44,1)");
		li2002.append("span").attr("class", "bt-info").html("> 2002: Microwave sounding units");

		var li2013 = list.append("li").attr("class", "bt-2013");
		li2013.append("span").style("background-color","rgba(203,24,29,1)");
		li2013.append("span").attr("class", "bt-info").html("> 2013: Dual polarization");

		d3.selectAll(".barlegend")
			.on("mouseover", function(){
				var tooltip = d3.select("#bar-tooltip");

				var elem = $(this);
				if (elem.hasClass("leg0")){
					d3.select(".bt-1914").style("display", "none");
					d3.select(".bt-1957").style("display", "none");
					d3.select(".bt-1960").style("display", "none");
					d3.select(".bt-1990").style("display", "none");
					d3.select(".bt-2002").style("display", "none");
					d3.select(".bt-2013").style("display", "none");
				} else if(elem.hasClass("leg1")){
					d3.select(".bt-1957").style("display", "none");
					d3.select(".bt-1960").style("display", "none");
					d3.select(".bt-1990").style("display", "none");
					d3.select(".bt-2002").style("display", "none");
					d3.select(".bt-2013").style("display", "none");
				} else if(elem.hasClass("leg2")){
					d3.select(".bt-1960").style("display", "none");
					d3.select(".bt-1990").style("display", "none");
					d3.select(".bt-2002").style("display", "none");
					d3.select(".bt-2013").style("display", "none");
				} else if(elem.hasClass("leg3")){
					d3.select(".bt-1990").style("display", "none");
					d3.select(".bt-2002").style("display", "none");
					d3.select(".bt-2013").style("display", "none");
				} else if(elem.hasClass("leg4")){
					d3.select(".bt-2002").style("display", "none");
					d3.select(".bt-2013").style("display", "none");
				} else if(elem.hasClass("leg5")){
					d3.select(".bt-2013").style("display", "none");
				}

				var height = parseInt(tooltip.style("height"));
				var width = parseInt(tooltip.style("width"));
				var containerWidth = parseInt(d3.select("#bar-tooltip").style("width"));
				if (d3.event.pageX > containerWidth/2)
					x = d3.event.pageX - containerWidth/2 + 20;


				tooltip.style("top", (d3.event.pageY + 20) + "px");
				tooltip.style("left", x + "px");
				tooltip.style("display","block");
			})
			.on("mouseout", function(){
				d3.select(".bt-1914").style("display", "block");
				d3.select(".bt-1957").style("display", "block");
				d3.select(".bt-1960").style("display", "block");
				d3.select(".bt-1990").style("display", "block");
				d3.select(".bt-2002").style("display", "block");
				d3.select(".bt-2013").style("display", "block");

				var tooltip = d3.select("#bar-tooltip");
				tooltip.style("display","none");
			});
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
		d3.select("#btn-reset").on("click", function(){ self.reset(); });

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

		$('.filter-gm').change(function(){
			var speedUnit = $('#gm-cb-wind-speed').val();
			var pressureUnit = $('#gm-cb-pressure').val();

			var basin = $('#gm-cb-basin').val();
			var maxwind =  {};
			maxwind.min = $('#gm-min-wind').val();
			maxwind.max = $('#gm-max-wind').val();
			if(maxwind.min == "")
				maxwind.min = 0;
			if(maxwind.max == "")
				maxwind.max = 999999;
			var minpres = {};
			minpres.min = $('#gm-min-pressure').val();
			minpres.max = $('#gm-max-pressure').val();
			if(minpres.min == "")
				minpres.min = 0;
			if(minpres.max == "")
				minpres.max = 999999;

			if (speedUnit == 'kph'){
				maxwind.min = maxwind.min * 1.60934;
				maxwind.max = maxwind.max * 1.60934;
			}

			if (pressureUnit == 'psi'){
				minpres.min = minpres.min * 0.0145038;
				minpres.max = minpres.max * 0.0145038;
			}
			
			var filter = {};
			filter.max_wind = {};
			filter.min_pressure = {};
			filter.max_wind.min = parseFloat(maxwind.min);
			filter.max_wind.max = parseFloat(maxwind.max);
			filter.min_pressure.min = parseFloat(minpres.min);
			filter.min_pressure.max = parseFloat(minpres.max);
			barChart.update(filter, basin);
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

		self.createHurrTooltip();
		self.createBarLegendTooltip();

		var boundaries = [];
		d3.json("./resources/heatmapData.json", function(err0, heatmapData){
		//	boundaries.push(bData);

			d3.json("./resources/data.json", function(err1, collection){
				if (err1) throw err1;
				mainMap = new Map(collection, boundaries, "map-container", 5, heatmapData);
				mainMap.init();
				self.map = mainMap;

				d3.json("./resources/filteredData.json", function(err2, data) {
					if (err2) throw err2;
					self.bchartAtlantic = new BarChart("#bc-container-nohurrAL", "num-hurricanes", data, self.barFilter, "AL");
					self.bchartPacific = new BarChart("#bc-container-nohurrPA", "num-hurricanes", data, self.barFilter, "PA");

					self.bchartAtlantic.init();
					self.bchartPacific.init();
					self.reducedData = data;

					d3.json("./resources/filteredDatav1.json", function(err2, datav1) {
						var filter = {};
						filter.max_wind = {};
						filter.max_wind.min = 0;
						filter.max_wind.max = 999999;
						filter.min_pressure = {};
						filter.min_pressure.min = 0;
						filter.min_pressure.max = 999999;
						barChart = new BarChartByMonth("#graph-by-month", "num-hurricanes", datav1, filter, "both");
						barChart.init();

						self.search();
					});	
				});
			});
		});
	}
}