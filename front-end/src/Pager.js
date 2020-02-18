import React from "react";
import Pagination from "react-bootstrap/Pagination";

class Pager extends React.Component {
  constructor(props) {
    super(props);
    this.turn_page = this.turn_page.bind(this);
  }

  turn_page(evt) {
    this.props.turnPage(evt.target.id);
  }

  render() {
    var items = [];
    var active = this.props.page;
    var last = this.props.num_pages;

    items.push(<Pagination.Prev id="-1" disabled={active === 1} />);
    if (active === last) {
      items.push(
        <Pagination.Item id={active - 2}>{active - 2}</Pagination.Item>
      );
    }
    if (active - 1 > 0) {
      items.push(
        <Pagination.Item id={active - 1}>{active - 1}</Pagination.Item>
      );
    }
    items.push(
      <Pagination.Item id={active} active>
        {active}
      </Pagination.Item>
    );
    items.push(<Pagination.Item id={active + 1}>{active + 1}</Pagination.Item>);
    if (active === 1) {
      items.push(
        <Pagination.Item id={active + 2}>{active + 2}</Pagination.Item>
      );
    }
    items.push(<Pagination.Next id="+1" disabled={active === last} />);

    return (
      <div>
        <Pagination onClick={this.turn_page}>{items}</Pagination>
      </div>
    );
  }
}

export { Pager as default };
