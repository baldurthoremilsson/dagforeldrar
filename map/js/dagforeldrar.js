var BASEURL = BASEURL || '';
var CENTER = [64.135491, -21.896149];

var ICONS = [
  L.icon({iconUrl: 'img/marker-icon-red.png'}),
  L.icon({iconUrl: 'img/marker-icon-orange.png'}),
  L.icon({iconUrl: 'img/marker-icon-yellow.png'}),
  L.icon({iconUrl: 'img/marker-icon-green.png'}),
  L.icon({iconUrl: 'img/marker-icon-cyan.png'}),
  L.icon({iconUrl: 'img/marker-icon.png'}),
];


function getColor(routeId) {
  var iId = parseInt(routeId);
  if(isNaN(iId))
    return 'blue';
  if(iId < 10)
    return 'red';
  if(iId < 20)
    return 'green';
  if(iId < 50)
    return 'cyan';
  return 'blue';
}


function getIcon(routeId) {
  return ICONS[getColor(routeId)];
}


var AboutPopup = L.Popup.extend({
  content:
    '<h1>BusPlot</h1>' +
    '<p>Þessi síða birtir staðsetningu strætisvagna síðustu vikuna. ' +
    'Hún velur 500 hnit af handahófi á hverri leið og teiknar inn á kortið. ' +
    'Gögnin koma frá <a href="http://www.straeto.is">Strætó</a>, en síðan ' +
    'tengist Strætó bs. ekki að öðru leiti.</p>' +
    '<p>Höfundur er <a href="mailto:baldur@baldur.biz">Baldur Þór Emilsson</a> ' +
    'og kóðann á bakvið síðuna má finna á ' +
    '<a href="https://github.com/baldurthoremilsson/busplot">GitHub</a>.</p>',

  loading: function() {
    this.setContent(this.content +
      '<p>Sæki gögn <img src="img/spinner.gif"></p>');
  },

  loaded: function() {
    this.setContent(this.content);
  },

  loadingFailed: function(callback) {
    var div = L.DomUtil.create('div');
    div.innerHTML = this.content;

    var span = L.DomUtil.create('span', '', div);
    span.innerHTML = 'Gat ekki náð í gögnin. ';

    var button = L.DomUtil.create('a', '', div);
    button.innerHTML = 'Reyna aftur';
    button.href = '#';
    L.DomEvent
      .on(button, 'mousedown dblclick', L.DomEvent.stopPropagation)
      .on(button, 'click', L.DomEvent.stop)
      .on(button, 'click', callback, this);

    this.setContent(div);
  },

  onAdd: function(map) {
    this.visible = true;
    L.Popup.prototype.onAdd.call(this, map);
  },

  onRemove: function(map) {
    this.visible = false;
    L.Popup.prototype.onRemove.call(this, map);
  },

  _createButton: L.Control.Zoom.prototype._createButton,
});


var AboutControl = L.Control.extend({
  options: {
    position: 'topleft',
  },

  initialize: function() {
    this.popup = new AboutPopup();
    L.Control.prototype.initialize.call(this);
  },

  onAdd: function(map) {
    this.map = map;
    this.openPopup();

    var container = L.DomUtil.create('div', 'leaflet-bar');
    var button = this._createButton('?', 'Um síðuna', '', container, this.togglePopup.bind(this));
    return container;
  },

  openPopup: function() {
    this.popup.setLatLng(this.map.getCenter());
    this.popup.openOn(this.map);
  },

  closePopup: function() {
    this.map.closePopup(this.popup);
  },

  togglePopup: function() {
    if(this.popup.visible)
      this.closePopup();
    else
      this.openPopup();
  },

  _createButton: L.Control.Zoom.prototype._createButton,
});


function loadData(map, aboutControl, callback) {
  aboutControl.popup.loading();
  $.getJSON(BASEURL + 'points.php', function(dagforeldrar) {
    var layer = L.layerGroup();
    dagforeldrar.forEach(function(dagforeldri) {
      if(dagforeldri.lat === null || dagforeldri.lon === null)
        return;
      var marker = L.marker(dagforeldri);
      marker.addTo(layer);
      marker.on('click', function() { console.log('click', dagforeldri) });
      dagforeldri.marker = marker;
    });
    map.addLayer(layer);
    aboutControl.popup.loaded();
    callback(dagforeldrar);
  }).fail(function() {
    aboutControl.popup.loadingFailed(function() {
      loadRoutes(map, aboutControl);
    })
  });

}

window.addEventListener('load', function() {
  // create a map in the "map" div, set the view to a given place and zoom
  var map = L.map('map').setView(CENTER, 12);
  var dagforeldrar = null;
  var listElement = document.getElementById('list');

  // add an OpenStreetMap tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var aboutControl = new AboutControl();
  map.addControl(aboutControl);

  var meMarker = L.marker(CENTER, {
    icon: L.icon({iconUrl: 'img/memarker.png'}),
      draggable: true,
  });
  meMarker.addTo(map);
  meMarker.on('dragend', function() {
    var myPosition = this.getLatLng();
    sortDagforeldrar(myPosition);
  });

  var sortDagforeldrar = function(myPosition) {
    if(!dagforeldrar)
      return;
    dagforeldrar.sort(function(a,b) {
      var one = Number.MAX_VALUE;
      var two = Number.MAX_VALUE;

      if(a.lat != null && a.lon != null)
        one = myPosition.distanceTo(a);
      if(b.lat != null && b.lon != null)
        two = myPosition.distanceTo(b);

      return one - two;
    });
    dagforeldrar.forEach(function(dagforeldri, i) {
      if(!dagforeldri.marker)
        return;
      dagforeldri.marker.setIcon(ICONS[Math.min(i, ICONS.length-1)]);
    });
    renderList(dagforeldrar, listElement);
  };

  loadData(map, aboutControl, function(data) {
    dagforeldrar = data;
    sortDagforeldrar(meMarker.getLatLng());
    renderList(dagforeldrar, listElement);
  });
});
