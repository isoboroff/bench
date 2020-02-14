import React from "react";

import Form from "react-bootstrap/Form";

/** Facet a search facet, a.k.a. an ElasticSearch aggregation. */
export default class Facet extends React.Component {
  constructor(props) {
    super(props);
    this.onFacetCheck = this.onFacetCheck.bind(this);
  }
  onFacetCheck(event) {
    this.props.onCheck(event.target.id, event.target.checked);
  }
  render() {
    const switches = this.props.aggdata.map(o => (
      <Form.Check
        type="checkbox"
        id={`${this.props.aggkey}-${o.key}`}
        label={`${o.key} (${o.doc_count})`}
        onClick={this.onFacetCheck}
        checked={!!this.props.checked.has(this.props.aggkey + "-" + o.key)}
      />
    ));
    return (
      <React.Fragment>
        <dt>{this.props.aggkey}</dt>
        <dd>{switches}</dd>
      </React.Fragment>
    );
  }
}

/** FacetView unpacks the aggregation facets into a HTML dl. */
export class FacetView extends React.Component {
  render() {
    const aggs = this.props.aggs;
    const forder = {
      persons: 1,
      gpes: 2,
      orgs: 3,
      events: 4
    };
    var agglist = Object.entries(aggs).sort(
      (a, b) => forder[a[0]] - forder[b[0]]
    );
    var facetlist = agglist.map(([key, data]) => (
      <Facet
        aggkey={key}
        aggdata={data.buckets}
        onCheck={this.props.onCheck}
        checked={this.props.checked}
      />
    ));
    return <dl>{facetlist}</dl>;
  }
}
