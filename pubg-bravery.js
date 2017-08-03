var MAP_WIDTH_PX = 5184;
var MAP_WIDTH_METERS = 8000;
var PPM = MAP_WIDTH_PX / MAP_WIDTH_METERS;

var body = document.body,
    html = document.documentElement;

var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight );
document.getElementById('map-erangel').style = "height: " + height + "px";

var map = L.map('map-erangel', {
    crs: L.CRS.Simple,
    attributionControl: false,
    zoomSnap: 0.25,
    minZoom: -2.75,
    zoomDelta: 1
});
var bounds = [[0, 0], [MAP_WIDTH_PX, MAP_WIDTH_PX]];
var image = L.imageOverlay("images/erangel.jpg", bounds).addTo(map);

// make vertical lines
for (var i = 1; i < 8; i++) {
    L.polyline(
        [ [0, i * 1000 * PPM], [MAP_WIDTH_PX, i * 1000 * PPM] ],
        { 
            color: "yellow",
            weight: 1,
        }
    ).addTo(map);
}

// make horizontal lines
for (var i = 1; i < 8; i++) {
    L.polyline(
        [ [i * 1000 * PPM, 0], [i * 1000 * PPM, MAP_WIDTH_PX] ],
        { 
            color: "yellow",
            weight: 1,
        }
    ).addTo(map);
}

// click-drag
var startCircle = null;
var line = null;
var dragging = false;

map.on("mousedown", function(event) {
    map.dragging.disable();
    dragging = true;
    if (startCircle) {
        startCircle.remove();
    }
    if (line) {
        line.remove();
    }
    startCircle = L.circle(event.latlng, { radius: 100, color: "white" });
    startCircle.addTo(map);
});
map.on("mouseup", function(event) {
    var endLat = event.latlng.lat;
    var endLng = event.latlng.lng;
    var startLat = startCircle.getLatLng().lat;
    var startLng = startCircle.getLatLng().lng;

    var slope = (endLat - startLat) / (endLng - startLng);
    var b = endLat - (slope * endLng);

    var leftIntercept = b;
    var rightIntercept = MAP_WIDTH_PX * slope + b;

    var degToRad = function(deg) {
        return deg * Math.PI / 180;
    };
    var radToDeg = function(rad) {
        return rad * 180 / Math.PI;
    };

    var angle = radToDeg(Math.atan2(slope, 1));
    var LONG_RANGE = 2200 * PPM;
    var MED_RANGE = 1300 * PPM;

    var angleX = angle;
    var angleY = 90;
    var angleZ = 180 - angleX - angleY;

    var yLongRangeOffset = LONG_RANGE * Math.sin(degToRad(90)) / Math.sin(degToRad(angleZ));
    var yMedRangeOffset = MED_RANGE * Math.sin(degToRad(90)) / Math.sin(degToRad(angleZ));

    // TODO: conform to map bounds
    var buildPathPolygons = function(yOffset, color) {
        L.polygon(
            [
                [ [leftIntercept, 0], [leftIntercept + yOffset, 0], [rightIntercept + yOffset, MAP_WIDTH_PX], [rightIntercept, MAP_WIDTH_PX], [leftIntercept, 0] ]
            ],
            { color: color }
        ).addTo(map);
        L.polygon(
            [
                [ [leftIntercept, 0], [leftIntercept - yOffset, 0], [rightIntercept - yOffset, MAP_WIDTH_PX], [rightIntercept, MAP_WIDTH_PX], [leftIntercept, 0] ]
            ],
            { color: color }
        ).addTo(map);
    }

    buildPathPolygons(yLongRangeOffset, "blue");
    buildPathPolygons(yMedRangeOffset, "orange");
    L.polyline([[leftIntercept, 0], [rightIntercept, MAP_WIDTH_PX]], { color: "white" }).addTo(map);

    if (startCircle) {
        startCircle.remove();
    }
    if (line) {
        line.remove();
    }

    map.dragging.enable();
    dragging = false;
});
map.on("mousemove", function(event) {
    if (dragging) {
        if (line) {
            line.remove();
        }
        line = L.polyline([startCircle.getLatLng(), event.latlng], { color: "white" });
        line.addTo(map);
    }
});

// pick a zone
var size = 500;
var inc = MAP_WIDTH_METERS / size;

var xZone = Math.floor(Math.random() * inc);
var yZone = Math.floor(Math.random() * inc);

L.geoJSON(
    {
        type: "FeatureCollection",
        features: [
            {
                type: "Feature",
                geometry: {
                    type: "Polygon",
                    coordinates: [ 
                        [ 
                            [xZone * size * PPM, yZone * size * PPM],                        
                            [xZone * size * PPM, (yZone + 1) * size * PPM],
                            [(xZone + 1) * size * PPM, (yZone + 1) * size * PPM],
                            [(xZone + 1) * size * PPM, yZone * size * PPM],
                            [xZone * size * PPM, yZone * size * PPM],                        
                        ]
                    ]
                },
                properties: {
                    color: "red"
                }
            }
        ]
    },
    {
        style: function(feature) {
            return { color: feature.properties.color };
        }
    }
).addTo(map);
map.fitBounds(bounds);
        