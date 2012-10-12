/**
 * Club Camper Furgovw's Mobile App
 * Copyright (C) 2012, Club Camper Furgovw (furgovw.org)
 * Created by Javier Montes (@mooontes - http://mooontes.com)
 */
var furgovw = {};
var map;

(function($) {

    furgovw.deviceready = function() {

        console.log('furgovw: Device ready...');

        $('#fvw_logo')
            .on('click', function() {
            furgovw.main();
        });

        $('#map').on('pageshow', function() {
            furgovw.loadMap();
        });

        $('#map').on('pagebeforehide', function() {
            furgovw.userLatitude  = furgovw.marker.position.lat();
            furgovw.userLongitude = furgovw.marker.position.lng();

            furgovw.loadSpots();

            $('a#fvw_user_location_button')
                .attr('href', '#spots-list');

            furgovw.geocoder.geocode({
                'latLng': furgovw.marker.position
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results[1]) {
                        var reverse_geo = results[1];
                        $('#fvw_user_location_button .ui-btn-text')
                            .html(
                        reverse_geo.address_components[0].long_name + ', ' + reverse_geo.address_components[1].long_name);
                    }
                }
            });
        });

        furgovw.geocoder = new google.maps.Geocoder();

        furgovw.main();
    };

    furgovw.main = function() {

        console.log("Connection: " + navigator.network.connection.type);

        //If there's no internet connection
        if (navigator.network.connection.type == 'none') {
            popErrorMessage('Lo siento, esta aplicación necesita que tengas conexión a internet');
            return;
        }

        //Get user location
        console.log('Starting to get location...');
        navigator.geolocation.getCurrentPosition(

            // onSuccess
            function(p) {

                console.log('located at: ' + p.coords.latitude + ',' + p.coords.longitude);

                furgovw.userLatitude  = p.coords.latitude;
                furgovw.userLongitude = p.coords.longitude;

                furgovw.latLng = new google.maps.LatLng(
                    p.coords.latitude,
                    p.coords.longitude);

                if (furgovw.geocoder) {
                    furgovw.geocoder.geocode({
                        'latLng': furgovw.latLng
                    }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            if (results[1]) {
                                var reverse_geo = results[1];
                                $('#fvw_user_location_button .ui-btn-text')
                                    .html(
                                reverse_geo.address_components[0].long_name + ', ' + reverse_geo.address_components[1].long_name);
                            }
                        }
                    });
                }

                furgovw.loadSpots();
                $('a#fvw_user_location_button')
                    .attr('href', '#spots-list');
            },

            // onError
            function() {
                popErrorMessage('Lo siento, no consigo encontrar tu localización');
            },

            // Options
            {
                maximumAge: 999999,
                timeout: 5000,
                enableHighAccuracy: false
            });
    };

    furgovw.loadSpots = function() {

        $('#spots_list_list')
            .empty();

        $.ajaxSetup({
            scriptCharset: "utf-8",
            contentType: "application/json; charset=utf-8"
        });

        mapApiUrl =
            'http://www.furgovw.org/api.php' +
            '?latitude=' + encodeURIComponent(furgovw.userLatitude) +
            '&longitude=' + encodeURIComponent(furgovw.userLongitude);

        $.jsonp({
            url: mapApiUrl,
            callbackParameter: 'callback',
            success: function(spots) {
                console.log('furgovw: Loaded data from api');
                furgovw.spots = spots;

                $.each(spots, function(index, spot) {
                    $('#spots_list_list')
                        .append('<li><a onclick="furgovw.fillDetailPage(' + spot.id + ');" href="#spot-detail' + '">' + '<h3>' + spot.nombre + '</h3>' + '<p>' + parseFloat(spot.distance)
                        .toFixed(1) + ' kms</p>' + '<img class="spots_list_picture" src="http://www.furgovw.org/tt.php?src=' + encodeURIComponent(spot.imagen) + '&w=80&h=80"></a></li>');
                });

                $('#spots_list_list')
                    .listview('refresh', true);
                $('#fvw_user_location_button')
                    .attr('href', '#spots-list');
                },
            error: function() {
                popErrorMessage('Lo siento, parece que hay un problema con la conexión a furgovw.org');
                return;
                }
            });
    };

    furgovw.fillDetailPage = function(id) {
        furgovw.id = id;
        $.each(furgovw.spots, function(index, spot) {
            if (spot.id == furgovw.id) {
                $('img#fvw_spot_picture')
                    .attr('src', spot.imagen);
                $('#fvw_spot_name')
                    .text(spot.nombre);
                $('#fvw_spot_distance')
                    .text(parseFloat(spot.distance)
                    .toFixed(1) + ' kms');
                if (spot.link) {
                    $('a#fvw_spot_forum_link')
                        .attr('href', spot.link);
                    $('a#fvw_spot_forum_link')
                        .show();
                } else $('a#fvw_spot_forum_link')
                    .hide();
                $('a#fvw_spot_forum_link span span')
                    .html('Enlace al foro');
                $('p#fvw_spot_author')
                    .html('Autor: <strong>' + spot.autor + '</strong>');
                $('p#fvw_spot_msg_body')
                    .html(spot.body);
            }
        });
    };

    furgovw.loadMap = function() {
        if (typeof furgovw.marker == 'undefined') {
            if (furgovw.userLatitude && furgovw.userLongitude) {
                var latlng =
                    new google.maps.LatLng(furgovw.userLatitude, furgovw.userLongitude);
            } else {
                var latlng =
                    new google.maps.LatLng("40.41153868","-3.70362707");
            }

            var myOptions = {
                zoom: 5,
                center: latlng,
                overviewMapControl: true,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.SMALL,
                    position: google.maps.ControlPosition.LEFT_TOP
                },
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById("map_container"), myOptions);
            var mapdiv = document.getElementById("map_container");
            mapdiv.style.width = '100%';
            mapdiv.style.height = '100%';
            mapdiv.style.padding = '0';

            furgovw.marker = new google.maps.Marker({ position: latlng, title:"Centrar aquí" });
            furgovw.marker.setMap(map);

            google.maps.event.addListener(map, 'click', function(event) {
                furgovw.marker.setPosition(event.latLng);
            });
        }

    };

    function popErrorMessage(errorMessage) {

        $("<div class='ui-loader ui-overlay-shadow ui-body-e ui-corner-all error-message'><h1>" + errorMessage + "</h1></div>")
            .css({
            "display": "block",
            "opacity": 0.96,
            "left":"5%",
            "width":"90%",
            "top": $(window)
                .scrollTop() + 100
        })
            .appendTo($.mobile.pageContainer)
            .delay(4000)
            .fadeOut(400, function() {
            $(this)
                .remove();
        });

    }

})(jQuery);