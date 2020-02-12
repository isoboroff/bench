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

/** SearchBox class: takes a query from the user and runs the search. */
class SearchBox extends React.Component {
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

/** SearchHit: an individual search result.  We render this in a Bootstrap Card. */
class SearchHit extends React.Component {
  /**
   * render function
   * @param {Object} this,props.content a JSON object representing a search hit.
   * @param {String} this.props.hitkey  the docid of the search result.
   * @param {String} this.props.title   the title of the result.
   *
   * Note use of 'hitkey'.  In React-Bootstrap, the 'key' attribute is special.  Don't
   * use it.
   */
  render() {
    const doc = this.props.content;
    return (
      <Card>
        <Accordion.Toggle
          as={Card.Header}
          variant="link"
          eventKey={this.props.hitkey}
        >
          {this.props.seqno + 1}. {this.props.title} <br />
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={this.props.hitkey}>
          <Card.Body>
            {doc.first_date} {this.props.hitkey} <p />
            <div
              style={{ whiteSpace: "pre-wrap" }}
              dangerouslySetInnerHTML={{ __html: doc.text }}
            />
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  }
}

/** SearchResults this is the list of search hits.  Using a Bootstrap Accordion. */
class SearchResults extends React.Component {
  /**
   * @param {Object} this.props.results the result object from ElasticSearch, see https://www.elastic.co/guide/en/elasticsearch/reference/current/getting-started-search.html
   */
  render() {
    const hits = this.props.results.hits ? this.props.results.hits.hits : [];
    if (hits.length > 0) {
      // This is a common React pattern: if you have an array of things to render,
      // use map() to convert it to a list of JSX things, then use that directly
      // in the JSX rendering.  (Otherwise JSX would need loop primitives, yuck)
      // An equivalent approach is to declare an empty list and push() things onto it.
      const hitlist = hits.map((hit, index) => (
        <SearchHit
          seqno={index}
          hitkey={hit._source.uuid}
          title={hit._source.text.split("\n")[0]}
          content={hit.highlight}
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

/** Facet a search facet, a.k.a. an ElasticSearch aggregation. */
class Facet extends React.Component {
  constructor(props) {
    super(props);
    this.onFacetCheck = this.onFacetCheck.bind(this);
  }
  onFacetCheck(event) {
    this.props.onCheck(event.target.id, event.target.checked);
  }
  render() {
    const switches = this.props.facetdata.map(o => (
      <Form.Check
        type="checkbox"
        id={`${this.props.facetkey}-${o.key}`}
        label={`${o.key} (${o.doc_count})`}
        onClick={this.onFacetCheck}
      />
    ));
    return (
      <React.Fragment>
        <dt>{this.props.facetkey}</dt>
        <dd>{switches}</dd>
      </React.Fragment>
    );
  }
}

/** FacetView unpacks the aggregation facets into a HTML dl for now. */
class FacetView extends React.Component {
  render() {
    const facets = this.props.facets;
    var facetlist = Object.entries(facets).map(([key, data]) => (
      <Facet
        facetkey={key}
        facetdata={data.buckets}
        onCheck={this.props.onCheck}
      />
    ));
    return <dl>{facetlist}</dl>;
  }
}

/** Layout the main app */
class App extends React.Component {
  /**
   * constructor
   * @param {Object} this.state.results a set of search results.  The updateResults callback manipulates this.
   */
  constructor(props) {
    super(props);
    this.state = { query: "", facets: new Map(), results: "" };

    // remove
    // this.do_search = this.do_search.bind(this);
    this.update_query = this.update_query.bind(this);
    this.updateFilters = this.updateFilters.bind(this);
    // to here
  }

  update_query(query_box_contents) {
    this.setState({ query: query_box_contents }, /* then, do */ this.do_search);
  }

  build_query() {
    let query_string = "q=" + this.state.query;
    const facet_string = Array.from(this.state.facets.keys()).join(",");
    if (facet_string.length > 0) {
      query_string += "&facets=" + facet_string;
    }
    query_string = encodeURI(query_string);
    return query_string;
  }

  /**
   * updateResults - put search hits into the state
   */
  do_search() {
    const url = window.location.href + "search?" + this.build_query();
    // The query needs to be escaped before fetching.
    // const escaped = encodeURI(url);

    fetch(url)
      .then(response => {
        return response.json(); // ElasticSearch returns JSON data
      })
      .then(data => {
        this.setState({ results: data }); // Update the search results
      })
      .catch(err => {
        // do something on an error here.
      });
  }

  updateFilters(facetkey, checked) {
    this.setState({ facets: { facetkey: checked } });
  }

  render() {
    const results = this.state.results;
    const facets = results ? results.aggregations : "";

    return (
      <Container fluid="true">
        <Row className="justify-content-md-center mt-5">
          <Col sm="8">
            <SearchBox onSearch={this.update_query} />
          </Col>
        </Row>
        <Row>
          <Col sm="2">
            <FacetView facets={facets} onCheck={this.updateFilters} />
          </Col>
          <Col sm="10">
            <SearchResults results={results} />
          </Col>
        </Row>
      </Container>
    );
  }
}

ReactDOM.render(<App />, document.getElementById("root"));
