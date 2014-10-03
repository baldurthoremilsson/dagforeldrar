var BASEURL = BASEURL || '';
var CENTER = [64.135491, -21.896149];
var ZOOMLEVEL = 12;
var CENTER_OFFSET = [-340, 0];

var ICONS = [
  L.icon({iconUrl: 'img/marker-icon-red.png', popupAnchor: [1, -34]}),
  L.icon({iconUrl: 'img/marker-icon-orange.png', popupAnchor: [1, -34]}),
  L.icon({iconUrl: 'img/marker-icon-yellow.png', popupAnchor: [1, -34]}),
  L.icon({iconUrl: 'img/marker-icon-green.png', popupAnchor: [1, -34]}),
  L.icon({iconUrl: 'img/marker-icon-cyan.png', popupAnchor: [1, -34]}),
  L.icon({iconUrl: 'img/marker-icon.png', popupAnchor: [1, -34]}),
];


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


function loadData(map, aboutControl, render, callback) {
  aboutControl.popup.loading();
  $.getJSON(BASEURL + 'points.php', function(dagforeldrar) {
    var layer = L.layerGroup();
    dagforeldrar.forEach(function(dagforeldri, i) {
      dagforeldri.active = false;
      if(dagforeldri.lat === null || dagforeldri.lon === null)
        return;
      var marker = L.marker([dagforeldri.lat, dagforeldri.lon]);
      marker.addTo(layer)
      var popup = L.popup({autoPan: false}).setContent('<p>' + dagforeldri.nafn + '</p>');
      marker.bindPopup(popup);
      dagforeldri.marker = marker;

      marker.on('mousedown', function() {
        dagforeldri.active = true;
        render();
        dagforeldri.scrollIntoView();
      });
      marker.on('mouseover', function() {
        dagforeldri.active = true;
        render();
      });
      marker.on('mouseout', function() {
        dagforeldri.active = false;
        render();
      });
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
  L.Map.prototype._getCenterLayerPoint = function() {
    return this.containerPointToLayerPoint(this.getSize().add(CENTER_OFFSET)._divideBy(2));
  };
  L.Map.prototype._getNewTopLeftPoint = function(center, zoom) {
    var viewHalf = this.getSize().add(CENTER_OFFSET)._divideBy(2);
    return this.project(center, zoom)._subtract(viewHalf)._round();
  };
  // create a map in the "map" div, set the view to a given place and zoom
  var map = L.map('map').setView(CENTER, ZOOMLEVEL);
  var dagforeldrar = null;
  var listElement = document.getElementById('list');

  var render = function() {
    renderList(dagforeldrar, map, listElement);
  };

  // add an OpenStreetMap tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  var aboutControl = new AboutControl();
  //map.addControl(aboutControl);

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
      var distA = Number.MAX_VALUE;
      var distB = Number.MAX_VALUE;

      if(a.lat != null && a.lon != null)
        distA = myPosition.distanceTo(a);
      if(b.lat != null && b.lon != null)
        distB = myPosition.distanceTo(b);

      a.distance = parseInt(distA);
      b.distance = parseInt(distB);

      return distA - distB;
    });
    dagforeldrar.forEach(function(dagforeldri, i) {
      if(!dagforeldri.marker)
        return;
      dagforeldri.marker.setIcon(ICONS[Math.min(i, ICONS.length-1)]);
    });
    render();
  };

  loadData(map, aboutControl, render, function(data) {
    dagforeldrar = data;
    sortDagforeldrar(meMarker.getLatLng());
  });
});
