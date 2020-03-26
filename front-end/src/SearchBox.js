import React from "react";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";

/** SearchBox class: takes a query from the user. */
export default class SearchBox extends React.Component {
  /**
   * Constructor.
   * @param {Function} onSearch a callback to call with the results of a search
   */
  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.handle_update_event = this.handle_update_event.bind(this);
    this.handle_submit_event = this.handle_submit_event.bind(this);
  }

  // The HTML implements this with a form; when the user presses return
  // it causes the form to submit.  However, we aren't running a normal
  // form submission... we intercept it using the Form onSubmit event, and
  // send the form content directly back to the SearchTab through the on_search
  // callback we got through props.

  /**
   * handleChange: update the state if the query changes.
   * @param {Object} event the browser event.
   */
  handle_update_event(event) {
    this.setState({ value: event.target.value });
  }

  /**
   * handleSubmit: Send the query up to the SearchTab.
   * @param {Object} event the browser event.
   */
  handle_submit_event(event) {
    this.props.on_search(this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <Form onSubmit={this.handle_submit_event}>
        <Form.Group as={Col} controlID="searchBox">
          <Form.Control
            placeholder="Enter your query here"
            value={this.state.value}
            onChange={this.handle_update_event}
          />
        </Form.Group>
      </Form>
    );
  }
}
