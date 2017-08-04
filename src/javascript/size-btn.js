import L from 'leaflet'

L.Control.SizeBtn = L.Control.extend({
    onAdd: function(map) {
        var container = L.DomUtil.create('div', 'size-container')
        var m150Btn = L.DomUtil.create('div', 'size-btn', container)
        var m250Btn = L.DomUtil.create('div', 'size-btn selected', container)
        var m500Btn = L.DomUtil.create('div', 'size-btn', container)

        m150Btn.innerHTML = '150m'
        m250Btn.innerHTML = '250m'
        m500Btn.innerHTML = '500m'

        var setupEvents = function(btn, size, others) {            
            L.DomEvent.on(btn, 'mousedown', function(event) {
                L.DomEvent.stop(event);
            })
            L.DomEvent.on(btn, 'mouseup', function(event) {
                map.dropSize = size;
                L.DomUtil.addClass(btn, 'selected')
                
                for (var i = 0; i < others.length; i++) {
                    L.DomUtil.removeClass(others[i], 'selected')
                }
            })
        }

        setupEvents(m150Btn, 150, [m250Btn, m500Btn])
        setupEvents(m250Btn, 250, [m150Btn, m500Btn])
        setupEvents(m500Btn, 500, [m150Btn, m250Btn])

        return container
    },
    onRemove: function(map) { 
    }
});

export default function(opts) {
    return new L.Control.SizeBtn(opts);
};