var pinColor = "33B5E5";
var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
    new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34));

var pinMyImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|333333",
        new google.maps.Size(21, 34),
    new google.maps.Point(0,0),
    new google.maps.Point(10, 34));
var pinShadow = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_shadow",
    new google.maps.Size(40, 37),
    new google.maps.Point(0, 0),
    new google.maps.Point(12, 35));
var _myMarker;
var infowindow = new google.maps.InfoWindow();

var filters = [];

$(document).ready(init);


function init(e){
						   
    $(window).resize(resizeHandler);

    // To initially run the function:
    resizeHandler();

    $('#eventsGrid').masonry({
        itemSelector: 'article',
        isAnimated: true,
        animationOptions: {
            duration: 200
        }
    });

    //generate big background map
    if(document.getElementById('bg_map_canvas')){
        initializeBackgroundMap();
    }

    // check if filters are active
    // filters: city, region & tags
    if(getUrlParameter("tag")){
        //alert(getUrlParameter("tag"));
    }
    if(getUrlParameter('city')||getUrlParameter('region')){
        filter.push();
    }

    //generate normal content map
    if(document.getElementById('map_canvas')){
        drawMap()
    }


    // Event handlers


    //hide map first
    $("#map_canvas").addClass("hidden");
    $("#hidemapButton").click(function(){
        $("#map_canvas").toggleClass('hidden');
        if($("#map_canvas").className != "hidden"){
            drawMap();
        }
        return false;
    });
};

function drawMap(){
    initializeMap();
    getGeoLocation();
    loadThemEvents();
    loadThemRegions();
}



function getGeoLocation(){
    if(Modernizr.geolocation){
        navigator.geolocation.getCurrentPosition(geoSuccess, geoError, {
            timeout:10000,
            enableHighAccuracy:true
        })
    }
    else{
        //fallback
    }
}

function geoSuccess(position){
    var coordinates = position.coords;
    _myGeoMarker = new google.maps.Marker({
        position: new google.maps.LatLng(coordinates.latitude, coordinates.longitude),
        map: map,
        title: "my current location",
        icon: pinMyImage
    });
}

function geoError(error){
    console.log(error);
}

var bgmap;
function initializeBackgroundMap() {

    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(51.056635, 3.719979),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
    };
    var styles = [
        {
            "stylers": [
                { "invert_lightness": true },
                { "lightness": 10 },
                { "saturation": -50 },
                { "gamma" : 5},
                { "hue": "#33b5e5" }
            ]
        }
    ];

    bgmap = new google.maps.Map(document.getElementById('bg_map_canvas'),
        mapOptions);
    bgmap.setOptions({styles: styles});



}

var map;
function initializeMap() {

    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(51.056635, 3.719979),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true
    };
    var styles = [
        {
            "stylers": [
                { "invert_lightness": true },
                { "lightness": 10 },
                { "saturation": -20 },
                { "gamma" : 5},
                { "hue": "#33b5e5" }
            ]
        }
    ]

    map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);
    map.setOptions({styles: styles});



}

function loadThemEvents(){

    $.ajax({
        url: 'http://data.appsforghent.be/UitInGent/Events.json',
        dataType: 'jsonp',
        contentType: 'application/json',
        cache:false,
        success: function(data) {

            for (res in data['Events']) {
                addMarkerToMap(data['Events'][res]["latitude"],data['Events'][res]["longitude"],data['Events'][res]["title"],data['Events'][res]["shortdescription"],data['Events'][res]["thumbnail"]);
            }

        },
        error: errorHandler
    });
}

function loadThemRegions(){
    $.ajax({
        url: 'http://data.appsforghent.be/poi/wijken.json',
        dataType: 'jsonp',
        contentType: 'application/json',
        cache:false,
        success: function(data) {

            for (res in data['wijken']) {
                //drawMyRegion(data["wijken"][res]["coords"]);
                drawMyRegion(data['wijken'][res]["coords"],data['wijken'][res]["naam"],data['wijken'][res]["wijk"],data['wijken'][res]["wijknr"]);
            }

        },
        error: errorHandler
    })
}

function errorHandler(bla,ble){
    console.log("error");
}

function addMarkerToMap(lat,long,title,shortdescription,thumbnail){


    _myMarker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        description: shortdescription,
        map: map,
        title: title,
        icon: pinImage,
        shadow: pinShadow,
        content: "<img src='"+thumbnail+"'><h1>"+title+"</h1><p>"+ shortdescription +"</p>"
    });

    var marker = _myMarker;

    google.maps.event.addListener(_myMarker, 'click', function() {

        infowindow.setContent(marker.content);
        infowindow.open(map,marker);
    });

}

function drawMyRegion(coords,naam,wijk,wijknr){
    //console.log("region: "+naam +" " +wijk);
    var regionCoords = [];

    var coordsArray = coords.split(' ');
    for(var i=0;i<coordsArray.length;i++){
        //console.log(coordsArray[i]);
        if(coordsArray[i]!= null && coordsArray[i]!= "" && coordsArray[i]!= " "){
            var coordArr = coordsArray[i].split(',');
            var coordinates = new google.maps.LatLng(coordArr[1],coordArr[0]);
            regionCoords.push(coordinates);
        }
    }
    drawRegion(regionCoords,naam,wijk,wijknr);

}

var $tooltip = $('<div/>').css({
    position: 'absolute',
    background: 'white',
    border: '1px solid black',
    padding: '10px',
    zIndex: 999,
    display: 'none'
}).appendTo('body');

function drawRegion(regionCoords,naam,wijk,wijknr){
   var myRegion = new google.maps.Polygon({
        paths: regionCoords,
        strokeColor: "#335a5e",
        strokeOpacity: 0.5,
        strokeWeight: 2,
        fillColor: "#335a5e",
        fillOpacity: 0.25,
        naam :naam,
        wijk :wijk,
        wijknr :wijknr
    });

    attachPolygonInfoWindow(myRegion, myRegion.wijk+" in "+myRegion.naam);

    myRegion.setMap(map);
}

function myRegionClick(region){
    alert(region.wijk+" in "+region.naam);
}

function getUrlParameter(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

function resizeHandler(){
    $('.centered').css({
        position:'absolute',
        left: ($(window).width() - $('.centered').outerWidth())/2,
        top: ($(window).height() - $('.centered').outerHeight())/2
    });
}

function attachPolygonInfoWindow(polygon, html)
{
    polygon.infoWindow = new google.maps.InfoWindow({
        content: html,
    });
    google.maps.event.addListener(polygon, 'mouseover', function(e) {
        var latLng = e.latLng;
        this.setOptions({fillOpacity:0.1});
        polygon.infoWindow.setPosition(latLng);
        polygon.infoWindow.open(map);
    });
    google.maps.event.addListener(polygon, 'mouseout', function() {
        this.setOptions({fillOpacity:0.35});
        polygon.infoWindow.close();
    });
}

