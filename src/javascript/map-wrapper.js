import Erangel from '../images/erangel.jpg'
import Logo from './controls/logo'
import ResetBtn from './controls/reset-btn'
import RollBtn from './controls/roll-btn'
import SizeBtn from './controls/size-btn'
import HelpText from './controls/help-text'

// map constants
const MAP_WIDTH_PX = 5184
const MAP_WIDTH_METERS = 8000
const PPM = MAP_WIDTH_PX / MAP_WIDTH_METERS
const BOUNDS = [[0, 0], [MAP_WIDTH_PX, MAP_WIDTH_PX]]

// manually created polygon that approximates the land area of the map
const VALID_DROP_ZONES = L.polygon(
    [
        [ 
            [2000 * PPM, 800 * PPM], [3000 * PPM, 300 * PPM], [4000 * PPM, 700 * PPM], 
            [5300 * PPM, 700 * PPM], [5500 * PPM, 1400 * PPM], [6500 * PPM, 300 * PPM], 
            [7200 * PPM, 300 * PPM], [7200 * PPM, 4000 * PPM], [7800 * PPM, 5500 * PPM], 
            [7500 * PPM, 7000 * PPM], [4100 * PPM, 7200 * PPM], [4100 * PPM, 7600 * PPM],
            [3200 * PPM, 7600 * PPM], [2500 * PPM, 6500 * PPM], [2900 * PPM, 5900 * PPM],
            [2700 * PPM, 5600 * PPM], [2000 * PPM, 6400 * PPM], [700 * PPM, 6000 * PPM],
            [600 * PPM, 3500 * PPM], [1600 * PPM, 2600 * PPM], [2200 * PPM, 3000 * PPM], 
            [2000 * PPM, 2300 * PPM], [1400 * PPM, 1600 * PPM]
        ]
    ]
)

var startCircle = null
var dragLine = null
var pathLine = null
var dragging = false
var longRangePolygons = null
var medRangePolygons = null
var dropCircle = null
var markerLines = []

var buildMap = function(containerId) {
    var map = L.map(containerId, {
        crs: L.CRS.Simple,
        attributionControl: false,
        zoomSnap: 0.25,
        minZoom: -2.75,
        zoomDelta: 1
    })
    map.getRenderer(map).options.padding = 1

    var overlay = L.imageOverlay(Erangel, BOUNDS)
    overlay.addTo(map)

    map.on('mousedown', _onMouseDown)
    map.on('mouseup', _onMouseUp)
    map.on('mousemove', _onMouseMove)
    map.isPathSelected = _isPathSelected.bind(map)
    map.disableClickAndDrag = _disableClickAndDrag.bind(map)
    map.enableClickAndDrag = _enableClickAndDrag.bind(map)
    map.rollDropZone = _rollDropZone.bind(map)
    map.softReset = _softReset.bind(map)
    map.hardReset = _hardReset.bind(map)    
    map.showMarkerLines = _showMarkerLines.bind(map)
    map.hideMarkerLines = _hideMarkerLines.bind(map)
    map.showHelpText = _showHelpText.bind(map)
    map.hideHelpText = _hideHelpText.bind(map)
    map.dropSize = 250

    map.showHelpText()
    map.enableClickAndDrag()
    new Logo({ position: 'bottomleft' }).addTo(map)
    new ResetBtn({ position: 'topleft' }).addTo(map)
    new SizeBtn({ position: 'topright' }).addTo(map)

    var attribution = L.control.attribution({
        prefix: '<div id="attribution"><p>Created by <a href="https://github.com/aaryn101">aaryn101</a></p>' +
            '<p>PLAYERUNKNOWN\'S BATTLEGROUNDS, logo, map & text are the property of Bluehole, Inc.</p></div>'
    })
    attribution.addTo(map)

    map.showMarkerLines()
    map.fitBounds(BOUNDS)

    return map
}

var _isPathSelected = function() {
    return !!longRangePolygons
}

var _disableClickAndDrag = function() {
    this._enableClickAndDrag = false
}

var _enableClickAndDrag = function() {
    this._enableClickAndDrag = true
}

var _showMarkerLines = function() {
    var map = this

    if (markerLines.length === 0) {
        // make vertical lines
        for (var i = 1; i < 8; i++) {
            var line = L.polyline([ [0, i * 1000 * PPM], [MAP_WIDTH_PX, i * 1000 * PPM] ],
                { color: "yellow", weight: 1 })
            line.addTo(map)
            markerLines.push(line)
        }

        // make horizontal lines
        for (var i = 1; i < 8; i++) {
            var line = L.polyline([ [i * 1000 * PPM, 0], [i * 1000 * PPM, MAP_WIDTH_PX] ],
                { color: "yellow", weight: 1 })
            line.addTo(map)
            markerLines.push(line)
        }
    }
}

var _hideMarkerLines = function() {
    for (var i = 0; i < markerLines.length; i++) {
        markerLines[i].remove()
    }
    markerLines = []
}

var _showHelpText = function() {
    var map = this

    if (map.helpText) {
        map.helpText.show()
    }
    else {
        new HelpText({ position: 'topright' }).addTo(map)
    }
}

var _hideHelpText = function() {
    var map = this

    if (map.helpText) {
        map.helpText.hide()
    }
}

var _rollDropZone = function() {
    var map = this

    var polygonContainsPoint = function(point, polygon) {
        var x = point[0]
        var y = point[1]
        var polyPoints = polygon.getLatLngs()[0]

        var contains = false

        for (var i = 0, j = polyPoints.length - 1; i < polyPoints.length; j = i++) {
            var xi = polyPoints[i].lat, yi = polyPoints[i].lng
            var xj = polyPoints[j].lat, yj = polyPoints[j].lng

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
            if (intersect) contains = !contains
        }

        return contains
    }
    var getRandomPoint = function(polygons) {
        var x = Math.floor(Math.random() * MAP_WIDTH_PX)
        var y = Math.floor(Math.random() * MAP_WIDTH_PX)

        if (polygonContainsPoint([y, x], VALID_DROP_ZONES) &&
            (polygonContainsPoint([y, x], polygons[0]) || polygonContainsPoint([y, x], polygons[1]))) {
            return [y, x]
        }
        else {
            return getRandomPoint(polygons)
        }
    }
    
    var randomPoint = getRandomPoint(longRangePolygons)
    dropCircle = L.circle(randomPoint, { radius: map.dropSize * PPM, color: "red" })
    dropCircle.addTo(map)

    return randomPoint
}

var _onMouseDown = function(event) {
    var map = this

    if (!map._enableClickAndDrag) {
        return
    }

    map.dragging.disable()
    dragging = true

    if (startCircle) {
        startCircle.remove()
    }

    if (dragLine) {
        dragLine.remove()
    }

    startCircle = L.circle(event.latlng, { radius: 100, color: "white" })
    startCircle.addTo(map)
}

var _onMouseUp = function(event) {
    var map = this

    if (!map._enableClickAndDrag || !dragging) {
        return
    }
    var endLat = event.latlng.lat
    var endLng = event.latlng.lng
    var startLat = startCircle.getLatLng().lat
    var startLng = startCircle.getLatLng().lng

    var slope = (endLat - startLat) / (endLng - startLng)
    var b = endLat - (slope * endLng)

    var leftIntercept = b
    var rightIntercept = MAP_WIDTH_PX * slope + b

    var degToRad = function(deg) {
        return deg * Math.PI / 180
    }
    var radToDeg = function(rad) {
        return rad * 180 / Math.PI
    }

    var angle = radToDeg(Math.atan2(slope, 1))
    var LONG_RANGE = 2200 * PPM
    var MED_RANGE = 1300 * PPM

    var angleX = angle
    var angleY = 90
    var angleZ = 180 - angleX - angleY

    var yLongRangeOffset = LONG_RANGE * Math.sin(degToRad(90)) / Math.sin(degToRad(angleZ))
    var yMedRangeOffset = MED_RANGE * Math.sin(degToRad(90)) / Math.sin(degToRad(angleZ))

    // TODO: conform to map bounds
    var buildPathPolygons = function(yOffset, color) {
        var north = L.polygon(
            [
                [ [leftIntercept, 0], [leftIntercept + yOffset, 0], [rightIntercept + yOffset, MAP_WIDTH_PX], [rightIntercept, MAP_WIDTH_PX] ]
            ],
            { 
                color: color,
                weight: 1,
            }
        )
        north.addTo(map)
        
        var south = L.polygon(
            [
                [ [leftIntercept, 0], [leftIntercept - yOffset, 0], [rightIntercept - yOffset, MAP_WIDTH_PX], [rightIntercept, MAP_WIDTH_PX] ]
            ],
            { 
                color: color,
                weight: 1
            }
        )
        south.addTo(map)

        return [north, south]
    }

    longRangePolygons = buildPathPolygons(yLongRangeOffset, "blue")
    medRangePolygons = buildPathPolygons(yMedRangeOffset, "orange")
    pathLine = L.polyline([[leftIntercept, 0], [rightIntercept, MAP_WIDTH_PX]], { color: "white" })
    pathLine.addTo(map)

    var randomPoint = map.rollDropZone()
    map.setView(randomPoint, -2, { animate: true, duration: 0.5 })
    map.hideMarkerLines()
    map.hideHelpText()
    map.disableClickAndDrag()

    if (!map.rollBtnControl) {
        new RollBtn({ position: 'topleft' }).addTo(map)
    }

    if (startCircle) {
        startCircle.remove()
        startCircle = null
    }
    if (dragLine) {
        dragLine.remove()
        dragLine = null
    }

    map.dragging.enable()
    dragging = false
}

var _onMouseMove = function(event) {
    var map = this
    
    if (dragging) {
        if (dragLine) {
            dragLine.remove()
        }
        dragLine = L.polyline([startCircle.getLatLng(), event.latlng], { color: "white" })
        dragLine.addTo(map)
    }
}

var _softReset = function() {
    var map = this

    if (startCircle) {
        startCircle.remove()
        startCircle = null
    }
    if (dragLine) {
        dragLine.remove()
        dragLine = null
    }
    if (dropCircle) {
        dropCircle.remove()
        dropCircle = null
    }
    dragging = false
}

var _hardReset = function() {
    var map = this

    if (startCircle) {
        startCircle.remove()
        startCircle = null
    }
    if (dragLine) {
        dragLine.remove()
        dragLine = null
    }
    if (pathLine) {
        pathLine.remove()
        pathLine = null
    }
    if (longRangePolygons) {
        longRangePolygons[0].remove()
        longRangePolygons[1].remove()
        longRangePolygons = null
    }
    if (medRangePolygons) {
        medRangePolygons[0].remove()
        medRangePolygons[1].remove()
        medRangePolygons = null
    }
    if (dropCircle) {
        dropCircle.remove()
        dropCircle = null
    }
    if (map.rollBtnControl) {
        map.rollBtnControl.remove()
    }

    map.showMarkerLines()
    map.showHelpText()
    map.enableClickAndDrag()
    dragging = false
    map.fitBounds(BOUNDS)
}

export default buildMap