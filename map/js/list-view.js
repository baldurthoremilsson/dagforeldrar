/** @jsx React.DOM */

var renderList = (function() {
  var Dagforeldrar = React.createClass({
    render: function() {
      var items = [];
      this.props.model.forEach(function(dagforeldri, i) {
        var lausplass = null;
        var heimilisfang = null;
        var simi = null;
        var netfang = null;
        var heimasida = null;

        if(dagforeldri.lausplass)
          lausplass = <span className='lausplass'>Pláss: {dagforeldri.lausplass}</span>

        if(dagforeldri.address)
          heimilisfang = <span className='heimilisfang'>{dagforeldri.address}</span>

        if(dagforeldri.simi)
          simi = <span className='simi'>{dagforeldri.simi}</span>

        if(dagforeldri.netfang)
          netfang = <span className='netfang'>{dagforeldri.netfang}</span>

        if(dagforeldri.heimasida)
          heimasida = <span className='heimasida'>{dagforeldri.heimasida}</span>

        items.push(
          <li>
            <span className='index'>{i+1}</span>
            <span className='nafn'>{dagforeldri.nafn}</span>
            {lausplass}
            {heimilisfang}
            {simi}
            {netfang}
            {heimasida}
          </li>
        );
      });
      return (
        <ul>{items}</ul>
      );
    },
  });

  return function(dagforeldrar, element) {
    React.renderComponent(
        <Dagforeldrar model={dagforeldrar}/>,
        element
    );
  };
})();
