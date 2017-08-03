import L from 'leaflet'

L.Control.ResetBtn = L.Control.extend({
    onAdd: function(map) {
        var img = L.DomUtil.create('div');
        this.img = img;
        L.DomUtil.addClass(img, "reset-icon");
        img.title = "reset everything";

        map.resetBtnControl = this;
        L.DomEvent.on(img, 'mousedown', function(event) {
            L.DomEvent.stop(event);
        });
        L.DomEvent.on(img, 'mouseup', function(event) {
            map.hardReset()
        })

        return img
    },

    onRemove: function(map) {
        L.DomEvent.off(this.img)
    }
})

export default function(opts) {
    return new L.Control.ResetBtn(opts);
}