import React from "react";

import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";

/** SearchHit: an individual search result.  We render this in a Bootstrap Card. */
class SearchHit extends React.Component {
  constructor(props) {
    super(props);
    this.on_relevant = this.on_relevant.bind(this);
  }

  on_relevant(event) {
    this.props.on_relevant(this.props.hitkey, event.target.checked);
  }

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
    const doc = this.props.display_doc(this.props);
    const event_key = this.props.hitkey;
    const rel_key = "rel." + this.props.hitkey;
    const date = new Date(this.props.date).toDateString();

    const entities = new Map();
    if (this.props.people) {
      for (let p of this.props.people) {
	entities.set("p_"+p, (<span class="badge badge-info ml-1">{p}</span>));
      }
    }
    if (this.props.orgs) {
      for (let o of this.props.orgs) {
	entities.set("o_"+o, (<span class="badge badge-success ml-1">{o}</span>));
      }
    }
    if (this.props.gpes) {
      for (let g of this.props.gpes) {
	entities.set("g_"+g, (<span class="badge badge-warning ml-1">{g}</span>));
      }
    }
        
    return (
      <Card docid={this.props.hitkey}>
        <Accordion.Toggle as={Card.Header} variant="link" eventKey={event_key}>
          {this.props.seqno + 1}. <strong>{this.props.title}</strong> ({date}){" "}
          <div class="custom-control custom-switch float-right">
            <input
              class="custom-control-input"
              type="checkbox"
              id={rel_key}
              checked={this.props.rel}
              onClick={this.on_relevant}
              data-toggle="button"
              aria-pressed={this.props.rel}
            />
            <label class="custom-control-label" for={rel_key}>
              Rel
            </label>
          </div>{" "}
          <br />
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={event_key}>
          <Card.Body>
            {this.props.hitkey} <p />
	    {entities.values()} <p />
	    {/* don't need dangerouslySet and renderToStatic anymore, just doc, I think */}
            <div style={{ whiteSpace: "pre-wrap" }}>
              {doc}
            </div>
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  }
}

export { SearchHit as default };
