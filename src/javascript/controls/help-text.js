import L from 'leaflet'

L.Control.HelpText = L.Control.extend({
    onAdd: function(map) {
        var text = L.DomUtil.create('div', 'help-text')
        text.innerHTML = '<p>Click and drag on the map to begin.</p>' + 
                         '<p>You can change the drop zone size using the controls on the right.</p>'

        map.helpText = this
        this.el = text
        return text
    },
    onRemove: function(map) { },
    show: function() {
        L.DomUtil.removeClass(this.el, 'hidden')
    },
    hide: function() {
        L.DomUtil.addClass(this.el, 'hidden')
    }
})

export default function(opts) {
    return new L.Control.HelpText(opts);
}