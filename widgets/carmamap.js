var MapAppGenerator = function(location) {

	var self = this;
	var _configure = function() {
		
		$.getScript("//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js", function() {
			self.init && self.init(location);
		});
	};

	_configure();
};

$.extend(MapAppGenerator.prototype, {

	_tripSearchUrl: "https://api-dev.car.ma/v1/object/trip/searchTrips?originLat=<%= lat %>&originLon=<%= lon %>",
	_map: null,
	_mapLoaded: false,
	_infoWindowTemplate: "<div style=\"min-width: 125px;\"><img style=\"width:50px; height:50px\" src=\"<%= photoUrl %>\" alt=\"<%= alias %>\"/><p style=\"margin-left: 55px;\"><%= alias %><br/>Going to: <%= destination %></p></div>",

	_initializeMap: function(location) {
		var myOptions = {
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			zoom: 12,
			center: new google.maps.LatLng(location.latitude, location.longitude)
		};
		
		this._map = new google.maps.Map(document.getElementById("mapContainer"), myOptions);
	},

	_initEventListeners: function() {
		var self = this;
		google.maps.event.addListener(this._map, "tilesloaded", function() {
			self._mapLoaded = true;
		});
	},

	_carmaApiRequest: function(location) {
		var url = _.template(this._tripSearchUrl, {lat: location.latitude, lon: location.longitude});
		
		$.get(url, this._processCarmaResponse, "JSON");
	},

	_processCarmaResponse: function(data) {
		if (!data.paginator.totalResults) {
			// TODO there are not results so do something
			return;
		}

		var bounds = new google.maps.LatLngBounds(),
			infowindow = new google.maps.InfoWindow(),
			self = this;

		$.each(data.trips, function(index) {

			var trip = data.trips[index],
				marker,
				pos = new google.maps.LatLng(trip.trip.baseTrip.origin.latitude, trip.trip.baseTrip.origin.longitude);

			bounds.extend(pos);
			marker = new google.maps.Marker({
				position: pos,
				map: self._map
			});

			google.maps.event.addListener(marker, "click", function() {
				infowindow.close();
				infowindow.setContent(_.template(self._infoWindowTemplate, {
					alias: trip.owner.alias,
					photoUrl: self._getResizedPhotoUrl(trip.owner.photoUrl),
					destination: trip.trip.baseTrip.destination.address
				}));
				infowindow.open(self._map, marker);
			});
		});
		this._map.fitBounds(bounds);
	},

	_resizeCloudinaryPhoto: function(url, size) {
		var splitIdx = url.indexOf("upload/");
		if (splitIdx > 0) {
			var prefix = url.substring(0, splitIdx + 7), suffix = url.substring(splitIdx + 7);
			url = prefix + "w_" + size.width + ",h_" + size.height + ",c_fill/w_" + size.width + ",h_" + size.height + ",c_crop/" + suffix;
		}
		return url;
	},

	_resizeAPIPhoto: function(url, size) {
		if (url.indexOf("?") > 0) {
			return url += "&width=" + size.width + "&height=" + size.height;
		}
		return url += "?width=" + size.width + "&height=" + size.height;
	},

	_getResizedPhotoUrl: function(url) {
		if (!url) {
			return null;
		}

		var size = { width : 50, height : 50 };
		if (url.indexOf("cloudinary") !== -1) {
			return this._resizeCloudinaryPhoto(url, size);
		}
		return this._resizeAPIPhoto(url, size);
	},

	_jqUpdateSize: function() {
		// Get the dimensions of the viewport
		var height = $("#mapContainer").height();
		var width = $("#mapContainer").width();

		$("#mapContainer").height(width / 2);
	},

	init: function(location) {
		if (!$("#mapContainer").length) {
			alert("No element with id: mapContainer found, please add one to your site and try again");
			return;
		}

		_.bindAll(this, "_processCarmaResponse");

		this._jqUpdateSize();
		this._initializeMap(location);
		this._initEventListeners();
		this._carmaApiRequest(location);

		$(window).resize(this._jqUpdateSize);
	}
});