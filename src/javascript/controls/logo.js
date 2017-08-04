import L from 'leaflet'

L.Control.Logo = L.Control.extend({
    onAdd: function(map) {
        var img = L.DomUtil.create('div')
        this.img = img
        L.DomUtil.addClass(img, 'logo')

        return img
    },
    onRemove: function(map) { }
});

export default function(opts) {
    return new L.Control.Logo(opts);
};