import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Nav from "react-bootstrap/Nav";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";

class SearchBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    const url = window.location.href + "search?q=" + this.state.value;
    const escaped_query = encodeURI(url);
    fetch(escaped_query)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.props.onSearch(data);
      })
      .catch(err => {
        // do something on an error here.
      });
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

class SearchHit extends React.Component {
  render() {
    // return <li key={this.props.key}>{this.props.children}</li>;
    const doc = this.props.content;
    return (
      <Card>
        <Accordion.Toggle
          as={Card.Header}
          variant="link"
          eventKey={this.props.hitkey}
        >
          {this.props.title}
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={this.props.hitkey}>
          <Card.Body>
            {doc.first_date} {this.props.hitkey} <p />
            <div style={{ whiteSpace: "pre-wrap" }}>{doc.text}</div>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  }
}

class SearchResults extends React.Component {
  render() {
    const hits = this.props.results.hits ? this.props.results.hits.hits : [];
    if (hits.length > 0) {
      const hitlist = hits.map(hit => (
        <SearchHit
          hitkey={hit._source.uuid}
          title={hit._source.text.split("\n")[0]}
          content={hit._source}
        />
      ));
      return (
        <div>
          {this.props.results.hits.total.value} Results Found. <p />
          <Accordion defaultActiveKey={hits[0]._source.uuid}>
            {hitlist}
          </Accordion>
        </div>
      );
    } else {
      return <i>nothing found</i>;
    }
  }
}

class Facet extends React.Component {
  render() {
    var switches = [];
    for (var o of this.props.facetdata) {
      switches = switches.concat(
        <li>
          {o.key} ({o.doc_count})
        </li>
      );
    }
    return (
      <React.Fragment>
        <dt>{this.props.facetkey}</dt>
        <dd>
          <ul>{switches}</ul>
        </dd>
      </React.Fragment>
    );
  }
}

class FacetView extends React.Component {
  render() {
    const facets = this.props.facets;
    var facetlist = Object.entries(facets).map(([key, data]) => (
      <Facet facetkey={key} facetdata={data.buckets} />
    ));
    return <dl>{facetlist}</dl>;
  }
}

class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = { results: "" };
    this.updateResults = this.updateResults.bind(this);
  }

  updateResults(hits) {
    this.setState({ results: hits });
  }

  render() {
    const results = this.state.results;
    const facets = results ? results.aggregations : "";

    return (
      <Container fluid="true">
        <Row className="justify-content-md-center mt-5">
          <Col sm="8">
            <SearchBox onSearch={this.updateResults} />
          </Col>
        </Row>
        <Row>
          <Col sm="2">
            <FacetView facets={facets} />
          </Col>
          <Col sm="8">
            <SearchResults results={results} />
          </Col>
        </Row>
      </Container>
    );
  }
}

ReactDOM.render(<Layout />, document.getElementById("root"));
