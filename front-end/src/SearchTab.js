import React from "react";

import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

import SearchBox from "./SearchBox";
import FacetView from "./Facet";
import SearchResults from "./SearchResults";

class SearchTab extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      query: "",
      page: 1,
      facets: new Map(),
      results: "",
    };

    this.update_query = this.update_query.bind(this);
    this.update_facets = this.update_facets.bind(this);
    this.clear_facets = this.clear_facets.bind(this);
    this.turn_page = this.turn_page.bind(this);
    this.mark_relevant = this.mark_relevant.bind(this);
  }

  update_search() {
    this.do_search();
  }

  update_query(query_box_contents) {
    this.setState({ query: query_box_contents, page: 1 }, /* then, do */ this.update_search);
  }

  /**
   * update_facets
   * When the user checks or unchecks the radio buttons, this callback updates
   * the App state, and triggers a search update.
   */
  update_facets(facetkey, checked) {
    let facetmap = this.state.facets;
    if (checked) {
      facetmap.set(facetkey, checked);
    } else {
      facetmap.delete(facetkey);
    }
    this.setState({ facets: facetmap, page: 1 }, /* then, do */ this.update_search);
  }

  /*
   * If you have facets checked, then modify the query such that the results do not have
   * that facet, then you can't clear it with the checkbox.  So here is a method
   * to clear out the facets.
   */
  clear_facets() {
    this.setState({ facets: new Map(), page: 1 }, /* then, do */ this.update_search);
  }

  mark_relevant(docid, extent) {
    if (extent) {
      this.props.add_relevant(docid, extent);
    } else {
      this.props.remove_relevant(docid);
    }
  }

  turn_page(change) {
    const num_pages = this.state.results
      ? Math.floor(this.state.results.hits.total.value / 10)
      : 0;
    let this_page = this.state.page;

    if (change === "+1") {
      this_page += 1;
    } else if (change === "-1") {
      this_page -= 1;
    } else if (change.match(/^[0-9]+$/)) {
      this_page = parseInt(change);
    }

    if (this_page > num_pages) {
      this_page = num_pages;
    }
    if (this_page < 1) {
      this_page = 1;
    }

    this.setState({ page: this_page }, /* then, do */ this.do_search);
  }

  /**
   * build_query
   * Take the textual query and the facet filters and assemble the query to send
   * to the back-end.  Note that this is just a simple URL form... the back-end
   * builds this into the query for ElasticSearch.
   */
  build_query() {
    let query_string = "u=" + this.props.username +
      "&index=" + this.props.index +
      "&q=" + this.state.query +
      "&page=" + this.state.page;
    if (this.props.search_facets) {
      const aggs_string = Object.entries(this.props.search_facets)
        .map(([agg, field]) => agg + ":" + field.field).join(",");
      query_string += "&aggs=" + aggs_string;
    }
    const facet_string = Array.from(this.state.facets.keys()).join(",");
    if (facet_string.length > 0) {
      query_string += "&facets=" + facet_string;
    }
    // The query needs to be escaped before fetching.
    query_string = encodeURI(query_string);
    return query_string;
  }

  /**
   * do_search: send the search query to the backend, catch the result, and update state.
   */
  do_search() {
    const url = window.location.href + "search?" + this.build_query();

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


  render() {
    let qrels = null;
    if (this.props.cur_topic !== -1) {
      const topic = this.props.topics[this.props.cur_topic];

      if (this.props.cur_req !== -1) {
        qrels = topic.requests[this.props.cur_req].qrels;
      } else {
        qrels = topic.qrels;
      }
    }
    return (
      <Container fluid="true">
        <Row className="justify-content-md-center mt-5">
          <Col>
            <SearchBox index={this.props.index} on_search={this.update_query} />
          </Col>
        </Row>
        <Row>
          <Col xs={2}>
            <Button variant="primary" className="mb-3" onClick={this.clear_facets}>Clear facets</Button>
            <FacetView
              facets={this.props.search_facets}
              aggs={this.state.results ? this.state.results.aggregations : ""}
              checked={this.state.facets}
              onCheck={this.update_facets}
            />
          </Col>
          <Col xs={10}>
            <SearchResults
              display_doc={this.props.display_doc}
              direction={this.props.direction}
              results={this.state.results}
              qrels={qrels}
              on_relevant={this.mark_relevant}
              page={this.state.page}
              turn_page={this.turn_page}
              cur_topic={this.props.cur_topic}
              cur_req={this.props.cur_req}
            />
          </Col>
        </Row >
      </Container >
    );
  }
}

export { SearchTab as default };
