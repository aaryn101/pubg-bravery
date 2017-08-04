import '../../node_modules/leaflet/dist/leaflet.css'
import L from 'leaflet'
import '../css/index.css'
import MapWrapper from './map-wrapper'

var body = document.body,
    html = document.documentElement
var height = Math.max( body.scrollHeight, body.offsetHeight, 
                       html.clientHeight, html.scrollHeight, html.offsetHeight )
var mapContainer = document.createElement('div')
mapContainer.id = 'map-erangel'
mapContainer.style = "height: " + height + "px"
body.appendChild(mapContainer)

var map = MapWrapper(mapContainer.id)
