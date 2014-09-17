/** @jsx React.DOM */

var renderList = (function() {
  var Dagforeldrar = React.createClass({
    render: function() {
      var items = [];
      this.props.model.forEach(function(dagforeldri) {
        items.push(<li>{dagforeldri.nafn}</li>);
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
