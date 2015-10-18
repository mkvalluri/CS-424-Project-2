function Map(data, target){
	this.chart = {};

	this.chart.data = data;
	this.chart.map = null;
	this.chart.svg = null;
	this.chart.pointInfo = null;

	this.chart.tag = target;

	this.chart.transformation = null;
	this.chart.path = null;
}

Map.prototype = {
	constructor: Map,

	applyLatLngToLayer: function(d){
		var y = d.geometry.coordinates[1]
		var x = d.geometry.coordinates[0]
		return this.chart.map.latLngToLayerPoint(new L.LatLng(y, x));
	},

	createTooltip: function(){
		var self = this,
			chart = this.chart;

		/*
		var tooltip = chart.svg.select("g").append("div")
						 .attr("class", "hurricane-info")
						 .attr("x", 50).attr("y", 50);
		tooltip.append("div").attr("class", "hurr-name");
		tooltip.append("div").attr("class", "hurr-date");
		tooltip.append("div").attr("class", "hurr-wind");
		tooltip.append("div").attr("class", "hurr-pressure");
		tooltip.html("TEEEEEST");*/


		chart.pointInfo = L.control({position : 'bottomleft'});
		var map = chart.map;

		chart.pointInfo.onAdd = function(map){
			this._div = L.DomUtil.create('div', 'info');
			this._div.innerHTML = '<h4>Path Information</h4>';
			return this._div;
		};

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
	},

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
	},

	addHurricane: function(filter){
		var self = this,
			chart = this.chart,
			map = chart.map;

		/* Remove any existing element in the map */
		var g = chart.svg.select("g");

		g.selectAll("circle").remove();
		g.selectAll(".lineConnect").remove();

		var filteredData = chart.data.features.filter(
			function(el) { 
				dateFilter = el.properties.timestamp.year >= filter.initial_date.getFullYear() 
						&& el.properties.timestamp.month >= (filter.initial_date.getMonth() + 1) 
						&& el.properties.timestamp.year <= filter.final_date.getFullYear() 
						&& el.properties.timestamp.month <= (filter.final_date.getMonth() + 1);
				if (filter.name != '') 
					return dateFilter && el.properties.name == filter.name;
				else
					return dateFilter;
			} //&& el.basin == basin 
		);

		/* 
		*/

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
		}/*
		if (lines.length > 0)
			g.append("path")
				     .datum([lines])
			         .attr("class", function(d){
			         	console.log(d);
			         	return "lineConnect";
			         });*/

		self.reset();

		function projectPoint(x, y){
			var point = map.latLngToLayerPoint(new L.LatLng(y, x));
			this.stream.point(point.x, point.y);
		};
	},

	reset: function(){
		var self = this,
			chart = this.chart,
			g = chart.svg.select("g");

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

			chart.svg.attr("width", bottomRight[0] - topLeft[0] + 20)
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
					     	d3.select(this).attr("d", p);
					     	d3.select(this).classed("line"+hurrCat, true);
					     })
		}
	},

	init: function(){
		var self = this,
			chart = this.chart;

		var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IjZjNmRjNzk3ZmE2MTcwOTEwMGY0MzU3YjUzOWFmNWZhIn0.Y8bhBaUMqFiPrDRW9hieoQ';
	
		/* create mapbox map */
		var grayscale = L.tileLayer(mbUrl, {id: 'mapbox.light', attribution: mbAttr}),
			darkscale = L.tileLayer(mbUrl, {id: 'mapbox.dark', attribution: mbAttr}),
			streets = L.tileLayer(mbUrl, {id: 'mapbox.streets', attribution: mbAttr});

		chart.map = new L.map(chart.tag, { 
			center: [29.224568, -67.862114], 
			zoom: 4,
			layers: [grayscale]
		});

		var baseLayers = {
			"Grayscale": grayscale,
			"Darkscale": darkscale,
			"Streets": streets
		};

		L.control.layers(baseLayers, null).addTo(chart.map);

		chart.svg = d3.select(chart.map.getPanes().overlayPane).append("svg");
		var g = chart.svg.append("g").attr("class", "leaflet-zoom-hide");

		chart.map.on("viewreset", function(){
			self.reset();
		});

		self.createTooltip();
	}
}