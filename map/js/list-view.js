/** @jsx React.DOM */

var renderList = (function() {
  var Dagforeldrar = React.createClass({
    mouseEnter: function(dagforeldri) {
      return function() {
        if(dagforeldri.marker === undefined)
          return;
        dagforeldri.marker.openPopup();
      };
    },
    mouseLeave: function(dagforeldri) {
      return function() {
        if(dagforeldri.marker === undefined)
          return;
        dagforeldri.marker.closePopup();
      };
    },
    mouseClick: function(dagforeldri) {
      var map = this.props.map;
      return function() {
        if(dagforeldri.marker === undefined)
          return;
        map.setView(dagforeldri, 17);
      };
    },
    render: function() {
      var refs = this.refs;
      var items = [];
      this.props.model.forEach(function(dagforeldri, i) {
        var distance = null;
        var lausplass = null;
        var heimilisfang = null;
        var simi = null;
        var netfang = null;
        var heimasida = null;
        var className = null;

        if(dagforeldri.distance) {
          if(dagforeldri.distance > 1000) {
            var d = dagforeldri.distance;
            d = (d - d % 100) / 1000; // Rounde to 100m
            d = d.toString().replace('.', ',');
            distance = <span className='distance'>{d} km</span>
          } else
            distance = <span className='distance'>{dagforeldri.distance} m</span>
        }

        if(dagforeldri.lausplass)
          lausplass = <span className='lausplass'>Pláss: {dagforeldri.lausplass}</span>

        if(dagforeldri.heimilisfang)
          heimilisfang = <span className='heimilisfang'>{dagforeldri.heimilisfang}</span>

        if(dagforeldri.simi)
          simi = <span className='simi'>{dagforeldri.simi}</span>

        if(dagforeldri.netfang)
          netfang = <span className='netfang'>{dagforeldri.netfang}</span>

        if(dagforeldri.heimasida)
          heimasida = <span className='heimasida'>{dagforeldri.heimasida}</span>

        if(dagforeldri.active)
          className = 'active';

        dagforeldri.scrollIntoView = function() {
          var node = refs[this.id].getDOMNode();
          node.scrollIntoView();
        };

        items.push(
          <li ref={dagforeldri.id} key={dagforeldri.id} className={className} onMouseEnter={this.mouseEnter(dagforeldri)} onMouseLeave={this.mouseLeave(dagforeldri)} onClick={this.mouseClick(dagforeldri)}>
            <span className='index'>{i+1}</span>
            <span className='nafn'>{dagforeldri.nafn}</span>
            {distance}
            {lausplass}
            {heimilisfang}
            {simi}
            {netfang}
            {heimasida}
          </li>
        );
      }.bind(this));
      return (
        <ul>{items}</ul>
      );
    },
  });

  return function(dagforeldrar, map, element) {
    React.renderComponent(
        <Dagforeldrar model={dagforeldrar} map={map}/>,
        element
    );
  };
})();
