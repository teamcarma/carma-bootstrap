function MapAppGenerator(location) {

	var _tripSearchUrl = "https://api-dev.car.ma/v1/object/trip/searchTrips?originLat=<%= lat %>&originLon=<%= lon %>",
		_map = null,
		_mapLoaded = false,
		_infoWindowTemplate = "<div style=\"min-width: 125px;\"><img style=\"width:50px; height:50px\" src=\"<%= photoUrl %>\" alt=\"<%= alias %>\"/><p style=\"margin-left: 55px;\"><%= alias %><br/>Going to: <%= destination %></p></div>";

	var _initializeMap = function() {
		var myOptions = {
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			zoom: 12,
			center: new google.maps.LatLng(location.latitude, location.longitude)
		};
		
		_map = new google.maps.Map(document.getElementById("mapContainer"), myOptions);
	};

	var _initEventListeners = function() {
		google.maps.event.addListener(_map, "tilesloaded", function() {
			// $("#mapLoader").css("display", "none");
			_mapLoaded = true;
		});
	};

	var _carmaApiRequest = function() {
		var url = _.template(_tripSearchUrl, {lat: location.latitude, lon: location.longitude});
		
		$.get(url, _processCarmaResponse, "JSON");
	};

	var _processCarmaResponse = function(data) {
		if (!data.paginator.totalResults) {
			// TODO there are not results so do something
			return;
		}

		var bounds = new google.maps.LatLngBounds(),
			infowindow = new google.maps.InfoWindow();

		$.each(data.trips, function(index) {

			var trip = data.trips[index],
				marker,
				pos = new google.maps.LatLng(trip.trip.baseTrip.origin.latitude, trip.trip.baseTrip.origin.longitude);

			bounds.extend(pos);
			marker = new google.maps.Marker({
				position: pos,
				map: _map
			});

			google.maps.event.addListener(marker, "click", function() {
				infowindow.close();
				infowindow.setContent(_.template(_infoWindowTemplate, {
					alias: trip.owner.alias,
					photoUrl: _getResizedPhotoUrl(trip.owner.photoUrl),
					destination: trip.trip.baseTrip.destination.address
				}));
				infowindow.open(_map, marker);
			});
		});
		_map.fitBounds(bounds);
	};

	var _resizeCloudinaryPhoto = function(url, size) {
		var splitIdx = url.indexOf("upload/");
		if (splitIdx > 0) {
			var prefix = url.substring(0, splitIdx + 7), suffix = url.substring(splitIdx + 7);
			url = prefix + "w_" + size.width + ",h_" + size.height + ",c_fill/w_" + size.width + ",h_" + size.height + ",c_crop/" + suffix;
		}
		return url;
	};

	var _resizeAPIPhoto = function(url, size) {
		if (url.indexOf("?") > 0) {
			return url += "&width=" + size.width + "&height=" + size.height;
		}
		return url += "?width=" + size.width + "&height=" + size.height;
	};

	var _getResizedPhotoUrl = function(url) {
		if (!url) {
			return null;
		}

		var size = { width : 50, height : 50 };
		if (url.indexOf("cloudinary") !== -1) {
			return _resizeCloudinaryPhoto(url, size);
		}
		return _resizeAPIPhoto(url, size);
	};

	var _jqUpdateSize = function() {
		// Get the dimensions of the viewport
		var height = $("#mapContainer").height();
		var width = $("#mapContainer").width();

		$("#mapContainer").height(width / 2);
	};

	var _init = function() {
		if (!$("#mapContainer").length) {
			alert("No element with id: mapContainer found, please add one to your site and try again");
			return;
		}

		$.getScript("//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.6.0/underscore-min.js");
		_jqUpdateSize();
		_initializeMap();
		_initEventListeners();
		_carmaApiRequest();

		$(window).resize(_jqUpdateSize);
	};

	_init();
}