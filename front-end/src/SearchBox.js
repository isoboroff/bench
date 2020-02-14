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
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // The HTML implements this with a form; when the user presses return
  // it causes the form to submit.  However, we aren't running a normal
  // form submission... we intercept it using the Form onSubmit event, and
  // send the form content directly back to the App through the onSearch
  // callback we got through props.

  /**
   * handleChange: update the state if the query changes.
   * @param {Object} event the browser event.
   */
  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  /**
   * handleSubmit: Send the query up to the App.
   * @param {Object} event the browser event.
   */
  handleSubmit(event) {
    this.props.onSearch(this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <Form onSubmit={this.handleSubmit}>
        <Form.Group as={Col} controlID="searchBox">
          <Form.Control
            placeholder="Enter your query here"
            value={this.state.value}
            onChange={this.handleChange}
          />
        </Form.Group>
      </Form>
    );
  }
}
