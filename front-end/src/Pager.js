import React from "react";
import Pagination from "react-bootstrap/Pagination";

class Pager extends React.Component {
  constructor(props) {
    super(props);
    this.turn_page = this.turn_page.bind(this);
  }

  turn_page(evt) {
    this.props.turn_page(evt.target.id);
  }

  render() {
    let items = [];
    let active = this.props.page;
    let last = this.props.num_pages;

    items.push(<Pagination.First id="1" disabled={active === 1} />);
    items.push(<Pagination.Prev id="-1" disabled={active === 1} />);
    items.push(
      <Pagination.Item id={active} active>
        {active}
      </Pagination.Item>
    );
    items.push(<Pagination.Next id="+1" disabled={active === last} />);
    items.push(<Pagination.Last id={last} disabled={active === last} />);

    return (
      <div>
        <Pagination onClick={this.turn_page}>{items}</Pagination>
      </div>
    );
  }
}

export { Pager as default };
