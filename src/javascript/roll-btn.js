import L from 'leaflet'

L.Control.RollBtn = L.Control.extend({
    onAdd: function(map) {
        var img = L.DomUtil.create('div')
        this.img = img
        L.DomUtil.addClass(img, 'roll-icon')
        img.title = 're-roll drop zone'

        map.rollBtnControl = this
        L.DomEvent.on(img, 'mousedown', function(event) {
            L.DomEvent.stop(event);
        })
        L.DomEvent.on(img, 'mouseup', function(event) {
            map.softReset()
            var randomPoint = map.rollDropZone()
            window.setTimeout(function() {
                map.setView(randomPoint, -2, { animate: true, duration: 1.0 });
            }, 500)
        })

        return img
    },
    onRemove: function(map) { 
        map.rollBtnControl = null;
        L.DomEvent.off(this.img);
    }
});

export default function(opts) {
    return new L.Control.RollBtn(opts);
};