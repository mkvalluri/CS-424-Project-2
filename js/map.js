/*
	Creates the map methods for showing the hurricanes paths from 1851 to 2014.
	Map provider: Mapbox
	Base Layers: Greyscale, Blackscale and Streets
	Overlay Layers:
	  - Data Layer: Shows the measurements obtained from the NHC dataset and shown as
	     dots for a given time and position in the North Atlantic and Pacific Oceans.
	  - Path Layer: Shows the hurricane path with different line thickness and color 
	     depending on the hurricane classification.
	  - Heatmap: Shows the heatmap graph of the most convenient places to live based
	     on the historical data.
*/

/* Class constructor and attributes */
function Map(data, boundaries, target, zoomLevel){
	this.chart = {};

	this.chart.data = data;				// Holds all the NHC dataset
	this.chart.filteredData = null;
	this.chart.boundaries = boundaries;

	this.chart.initZoom = zoomLevel;
	this.chart.map = null;				// Leaflet map object
	this.chart.svgDataLayer = null;		// Data overlay layer
	this.chart.svgPathLayer = null;		// Path overlay layer
	this.chart.svgHeatmapLayer = null;	// Heatmap overlay layer
	this.chart.pointInfo = null;		// Data information div shown on the bottom left
	this.chart.time = null;	
	this.chart.filter = null;

	this.chart.tag = target;			// Leaflet target html id

	this.chart.transformation = null;	// Stored for making D3 geo transformation of
	this.chart.path = null;				// Leaflet objects

	this.chart.heatTransformation = null;
	this.chart.heatPath = null;

	this.chart.animStartDate = null;
	this.chart.animEndDate = null;
	this.chart.animCurrDate = null;
	this.chart.animState = 'stop';		// stop, play, pause
	this.chart.playInterval = null;
	this.chart.dimByDate = null;
}

/* Class methods */
Map.prototype = {
	constructor: Map,

	/* Utility function that transforms a GeoJSON coordinate into a 
	   Leaflet coordinate */
	applyLatLngToLayer: function(d){
		var y = d.geometry.coordinates[1]
		var x = d.geometry.coordinates[0]
		return this.chart.map.latLngToLayerPoint(new L.LatLng(y, x));
	}, // end applyLatLngToLayer function

	/* Utility function that classifies a hurricane based on its wind at a 
	   certain point in time speed. */
	getHurricaneCategory: function(speed){
		if (speed >= 137)
			return "H5";
		else if (speed >= 113)
			return "H4";
		else if (speed >= 96)
			return "H3";
		else if (speed >= 83)
			return "H2";
		else if (speed >= 64)
			return "H1";
		else if (speed >= 34)
			return "TS";
		else
			return "TD";
	}, // end getHurricaneCategory function

	/* Returns the number of meters per pixel shown on a map 
	   on a given zoom level */
	getDensityPerZoomLevel: function(zoomLevel){
		if (zoomLevel == 0) return 156412;
		else if (zoomLevel == 1) return 78206;
		else if (zoomLevel == 2) return 39103;
		else if (zoomLevel == 3) return 19551;
		else if (zoomLevel == 4) return 9776;
		else if (zoomLevel == 5) return 4888;
		else if (zoomLevel == 6) return 2444;
		else if (zoomLevel == 7) return 1222;
		else if (zoomLevel == 8) return 610.984;
		else if (zoomLevel == 9) return 305.492;
		else if (zoomLevel == 10) return 152.746;
		else if (zoomLevel == 11) return 76.373;
		else if (zoomLevel == 12) return 38.187;
		else if (zoomLevel == 13) return 19.093;
		else if (zoomLevel == 14) return 9.547;
		else if (zoomLevel == 15) return 4.773;
		else if (zoomLevel == 16) return 2.387;
		else if (zoomLevel == 17) return 1.193;
		else if (zoomLevel == 18) return 0.596;
		else if (zoomLevel == 19) return 0.298;
		else return 0;
	},

	/* Shows an information chart on the bottom left section of the map. The object
	   is stored as a Leaflet Control and updates its information everytime the 
	   user hovers on a data point. */
	createInfoChart: function(){
		var self = this,
			chart = this.chart;

		chart.pointInfo = L.control({position : 'bottomleft'});
		var map = chart.map;

		// default information to show when the map is displayed
		// TODO: Hide?
		chart.pointInfo.onAdd = function(map){
			this._div = L.DomUtil.create('div', 'info');
			this._div.innerHTML = '<h4><span class="default-info">Choose a data point to see path information</span></h4>';
			return this._div;
		};

		/* Shows the following data point information:
		   - Hurricane Name
		   - Category: Based on the Simpson wind scale. Although the NHC dataset has categories
		     for elements below a Tropical Depression (TD), every element below that category is
		     being considered as TD to simplify the visualization.
		   - Timestamp: Date of the measurement. Hour is not considered as being sometimes incomplete
		   - Center Location: Latitude and Longitude of the data point
		   - Wind Speed: Calculated in mph. NHC dataset has the value stored in knots.
		   - Min Pressure: In milibars.
		*/
		chart.pointInfo.update = function(elem){
			var speed = parseFloat(Math.round(elem.properties.maxwind * 1.15078)).toFixed(2);

			this._div.innerHTML = 
				'<div class="row">' +
					'<div class="col-md-12">' + 
						elem.properties.name + " (" + self.getHurricaneCategory(elem.properties.maxwind) + ")" +
						" - " + elem.properties.timestamp.month + "/" + elem.properties.timestamp.day + "/" + elem.properties.timestamp.year +
					'</div>' + 
					'<div class="col-md-12">' + 
						'<div class="col-md-4">' + 
							'<div>Center Location</div>' + 
							'<div>' + elem.properties.latitude + " " + elem.properties.longitude + '</div>' +
						'</div>' + 
						'<div class="col-md-4">' +
							'<div>Wind Speed</div>' + 
							'<div>' + speed + ' mph</div>' +
						'</div>' +
						'<div class="col-md-4">' +
							'<div>Pressure</div>' + 
							'<div>' + elem.properties.minpressure + ' mb</div>'
						'</div>' +
					'</div>' +
				'</div>';
		}

		chart.pointInfo.addTo(map);
	}, // end createInfoChart function

	createTimeControl: function(){
		var self = this,
			chart = this.chart;

		chart.time = L.control({position : 'bottomright'});
		var map = chart.map;

		chart.time.onAdd = function(map){
			this._div = L.DomUtil.create('div', 'time');
			this._div.innerHTML = 
				"<div>"+ 
					"<span class='time-label'></span>" +
				"</div>";

			return this._div;
		};

		chart.time.update = function(date){
			this._div.innerHTML ="<span class='time-label'>" + (date.getMonth() + 1) + "/" + date.getDate() + "/" + date.getFullYear() + "</span>";
		};
		chart.time.addTo(map);
	},

	play: function(filter, rate){
		var self = this,
			chart = this.chart;

		d3.selectAll(".waypoints").style("display", "none");
		d3.selectAll(".lineConnect").style("display", "none");

		if (chart.animState == 'play'){
			chart.animState = 'pause';
			clearInterval(chart.playInterval);
			chart.animStartDate = chart.animCurrDate; 
		} else {
			if (chart.animState == 'stop'){
				chart.animStartDate = filter.initial_date;
				chart.animEndDate = filter.final_date;
				chart.animCurrDate = filter.initial_date;
			} else { 
				// On pause, I guess nothing special happens
			}

			chart.animState = 'play';
			chart.playInterval = setInterval(function() {
	        	chart.time.update(chart.animCurrDate);

	        	/*
	        	var filteredPoints = chart.filteredData.filter(
	        		function(el) { 
	        			return el.properties.timestamp.year == chart.animCurrDate.getFullYear() 
						&& el.properties.timestamp.month == (chart.animCurrDate.getMonth() + 1) 
						&& el.properties.timestamp.day == chart.animCurrDate.getDate();
	        	});*/
	        	// month starts at 0
	        	
	        	var tomorrow = new Date(chart.animCurrDate);
				tomorrow.setDate(chart.animCurrDate.getDate() + 1);

				chart.dimByDate.filterAll();
				chart.dimByDate.filter([chart.animCurrDate, tomorrow]);
				var da = chart.dimByDate.top(Infinity);

	        	var g = chart.svgDataLayer.select("g");
	        	var zoomLevel = chart.map.getZoom();
	        	g.selectAll(".animpoints").remove();
	        	if (da.length > 0){
	        		self.addWindPoints(g, da, "q34", zoomLevel);
	        		self.addWindPoints(g, da, "q50", zoomLevel);
	        		self.addWindPoints(g, da, "q64", zoomLevel);
	        		self.reset();
	        	}
	            chart.animCurrDate.setDate(chart.animCurrDate.getDate() + 1);

	            if (chart.animCurrDate > chart.animEndDate) {
	                clearInterval(chart.playInterval);
	            }
        	}, rate);
		};
	},

	addWindPoints: function(group, data, type, zoomLevel){
		var self = this;
		var w = null;

		group.selectAll("." + type)
			.data(data).enter() 
			 .append("circle")
             .attr("r", function(d){
             	if (type == "q34") w = d.properties.q34;
             	else if (type == "q50") w = d.properties.q50;
             	else if (type == "q64") w = d.properties.q64;
             	avg = (w.ne + w.se + w.nw + w.sw)/4;
             	if (avg == 0) return 5;
             	else{
             		return (avg * 1.82 * 1000)/self.getDensityPerZoomLevel(zoomLevel);
             	}
             })
             .attr("d", function(d){ return d; })
             .attr("class", type)
             .classed("animpoints", true);		
	},

	stop: function(){
		var self = this,
			chart = this.chart;

		chart.animState = 'stop';
		clearInterval(chart.playInterval);
	},

	/* Adds the hurricanes to the different map layers based on the filter control.
	   The data points are inserted as SVG circle elements. The paths are inserted
	   independently between two data points per hurricane as it is needed to show
	   a different thickness or color depending of the current status.
	*/
	addHurricane: function(filter){
		var self = this,
			chart = this.chart,
			map = chart.map;
		var ymdFormat = d3.time.format("%Y-%m-%d");

		/* Remove any existing element in the map */
		var g = chart.svgDataLayer.select("g");

		g.selectAll("circle").remove();
		g.selectAll(".lineConnect").remove();

		var filteredData = chart.data.features.filter(
			function(el) { 
				if (filter.type == "name"){
					return el.properties.name == filter.name;
				}else{
					return  el.properties.timestamp.year >= filter.initial_date.getFullYear() 
							&& el.properties.timestamp.month >= (filter.initial_date.getMonth() + 1) 
							&& el.properties.timestamp.year <= filter.final_date.getFullYear() 
							&& el.properties.timestamp.month <= (filter.final_date.getMonth() + 1)
							&& el.properties.maxwind >= filter.min_wind
							&& el.properties.maxwind <= filter.max_wind
							&& el.properties.minpressure >= filter.min_pressure
							&& el.properties.minpressure <= filter.max_pressure;
				}
			}
		);

		chart.transform = d3.geo.transform({point: projectPoint});
		chart.path = d3.geo.path().projection(chart.transform);

		var hurrPoints = g.selectAll("circle")
		        .data(filteredData).enter()
		            .append("circle")
		            .attr("r", 3)
		            .attr("d", function(d){ return d; })
		            .attr("class", "waypoints")
		            .on("mouseover", function(d){
		            	hurrPoints.attr("r",3);
		            	hurrPoints.attr("waypoints-selected", false);

		            	var p = d3.select(this).attr("r", 10);
		            	p.classed("waypoints-selected", true);
					    chart.pointInfo.update(d);
					})
		            .on("mouseout", function(d){
		            });

		var oldHurricaneId = [];
		var lines = [];

		for(var i = 0; i < filteredData.length - 1; i++){
			id1 = filteredData[i].properties.id;
			id2 = filteredData[i+1].properties.id;

			if (id1 == id2) {
				lines = [];
				lines.push(filteredData[i]);
				lines.push(filteredData[i+1]);
				g.append("path")
				     .datum([lines])
			         .attr("class", "lineConnect");
			}
		}

		chart.filteredData = filteredData;
		// Sort and at dates for animation, check out the hour!!
		chart.filteredData.sort(function(a,b){
			return new Date(a.properties.timestamp.year, a.properties.timestamp.month, a.properties.timestamp.day,a.properties.timestamp.hour,a.properties.timestamp.minute,0,0).getTime() - 
					new Date(b.properties.timestamp.year, b.properties.timestamp.month, b.properties.timestamp.day,b.properties.timestamp.hour,b.properties.timestamp.minute,0,0).getTime();
		});
		chart.filteredData.forEach(function(d){
			d.properties.timestamp.date = ymdFormat.parse(d.properties.timestamp.year + "-" + 
				d.properties.timestamp.month + "-" + d.properties.timestamp.day);
		});
		var cf = crossfilter(chart.filteredData);
		chart.dimByDate = cf.dimension(function(d){
			return d.properties.timestamp.date;
		});

		self.reset();

		function projectPoint(x, y){
			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
			this.stream.point(point.x, point.y);
		};
	}, // end addHurricane function

	addBoundaries: function(){
		var self = this,
			chart = this.chart,
			g = chart.svgDataLayer.select("g"),
			map = chart.map;

		chart.heatTransform = d3.geo.transform({point: projectPoint});
		chart.heatPath = d3.geo.path().projection(chart.heatTransform);

		for (var i = 0; i < chart.boundaries.length; i++){
			g.selectAll(".boundary")
				.data(chart.boundaries[i].features)
				  .enter()
				 .append("path")
				 .attr("class", "boundary");
		}

		function projectPoint(x, y){
			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
			this.stream.point(point.x, point.y);
		};
	},

	reset: function(){
		var self = this,
			chart = this.chart,
			g = chart.svgDataLayer.select("g");

		if (chart.path != null){
			var bounds = chart.path.bounds(chart.data);
			var topLeft = bounds[0],
				bottomRight = bounds[1];

			d3.selectAll(".waypoints").attr("transform",
	            function(d) {
	                return "translate(" +
	                    self.applyLatLngToLayer(d).x + "," +
	                    self.applyLatLngToLayer(d).y + ")";
	        });

			d3.selectAll(".animpoints").attr("transform",
	            function(d) {
	                return "translate(" +
	                    self.applyLatLngToLayer(d).x + "," +
	                    self.applyLatLngToLayer(d).y + ")";
	        });

			chart.svgDataLayer.attr("width", bottomRight[0] - topLeft[0] + 20)
				.attr("height", bottomRight[1] - topLeft[1] + 50)
				.style("left", (topLeft[0]) + "px")
				.style("top", (topLeft[1]) + "px");

			g.attr("transform", "translate(" + -(topLeft[0]) + "," + -(topLeft[1]) + ")");

			var toLine = d3.svg.line()
						.interpolate("linear")
						.x(function(d){ return self.applyLatLngToLayer(d).x; })
						.y(function(d){ return self.applyLatLngToLayer(d).y; });
			
			var paths = g.selectAll(".lineConnect")
					     .each(function(d){
					     	var p = "";
					     	for(var i = 0; i < d.length; i++)
					     		p = p + toLine(d[i]) + ",";
					     	hurrCat = self.getHurricaneCategory(d[0][0].properties.maxwind);
					     	d3.select(this)
					     	  .attr("d", p)
					     	  .classed("line"+hurrCat, true)
					     	  .classed(d[0][0].properties.id, true);
					     });
			g.selectAll(".boundary").attr("d", chart.heatPath);

		}
	}, // end reset function

	init: function(){
		var self = this,
			chart = this.chart;

		var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ';
	
		/* The Overlay classes are created to control the behaviour of D3 selections
		   when a Leaflet overlay is selected and deselected */
		var dataOverlay = L.Class.extend({
			initialize: function(){ return; },
			onAdd: function(map){
				d3.selectAll(".waypoints").style("display", "block");
			},
			onRemove: function(map){
				d3.selectAll(".waypoints").style("display", "none");
			}
		});

		var pathOverlay = L.Class.extend({
			//initialize: function(){ return; },
			onAdd: function(map){
				d3.selectAll(".lineConnect").style("display", "block");
			},
			onRemove: function(map){
				d3.selectAll(".lineConnect").style("display", "none");
			}
		});

		var heatmapOverlay = L.Class.extend({
			//initialize: function(){ return; },
			onAdd: function(map){
				// TODO
			},
			onRemove: function(map){
				// TODO
			}
		});

		var hurrDataOverlay = new dataOverlay();
		var hurrPathOverlay = new pathOverlay();
		var hurrHeatmapOverlay = new heatmapOverlay();

		/* Three LayerGroups are created for storing the overlays. This is
		   needed to allow the overlay checkboxes to start as checked */
		var lGroupData = new L.LayerGroup().addLayer(hurrDataOverlay);
		var lGroupPath = new L.LayerGroup().addLayer(hurrPathOverlay);
		var lGroupHeatmap = new L.LayerGroup().addLayer(hurrHeatmapOverlay);

		/* Set the mapbox base layers */
		var grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
			darkscale = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: mbAttr}),
			streets = L.tileLayer(mbUrl, {id: 'mapbox.streets', attribution: mbAttr});

		chart.map = new L.map(chart.tag, { 
			center: [20.587016, -88.175590], 
			zoom: chart.initZoom,
			layers: [darkscale, lGroupData, lGroupPath] // checked layers
		});

		var baseLayers = {
			"Grayscale": grayscale,
			"Darkscale": darkscale,
			"Streets": streets
		};

		var overlays = {
			"Data Layer": hurrDataOverlay,
			"Paths": hurrPathOverlay,
			"Heatmap": hurrHeatmapOverlay
		};

		L.control.layers(baseLayers, overlays).addTo(chart.map);

		chart.svgDataLayer = d3.select(chart.map.getPanes().overlayPane).append("svg");
		var gData = chart.svgDataLayer.append("g").attr("class", "leaflet-zoom-hide");

		chart.map.on("viewreset", function(){
			self.reset();
		});

		self.createInfoChart();
		self.createTimeControl();
		self.addBoundaries();
	} // end init function
}



		/* tried to disable the propagation on the control but didn't work
		chart.time.initialize = function(map){
			L.DomEvent.disableClickPropagation(char.timet);
		};
		function controlEnter(e) {
		    map.dragging.disable();
		}
		function controlLeave() {
		    map.dragging.enable();
		}

		//chart.time.onmouseover = controlEnter;
		//chart.time.onmouseout = controlLeave;*/


		/*
		for(var i = 0; i < filteredData.length; i++){
			id = filteredData[i].properties.id;
			if (id != oldHurricaneId){
				if (lines.length > 0)
					g.append("path")
				     .datum([lines])
			         .attr("class", "lineConnect");

		        lines = [];
		        oldHurricaneId = id;
			}
			lines.push(filteredData[i]);
		}*/

		/*
		if (lines.length > 0)
			g.append("path")
				     .datum([lines])
			         .attr("class", function(d){
			         	console.log(d);
			         	return "lineConnect";
			         });*/