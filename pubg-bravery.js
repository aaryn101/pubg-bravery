var MAP_WIDTH_PX = 5184;
var MAP_WIDTH_METERS = 8000;
var PPM = MAP_WIDTH_PX / MAP_WIDTH_METERS;

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

map.on("click", function(event) {
    L.circle(event.latlng, { radius: 100 }).addTo(map);
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
        