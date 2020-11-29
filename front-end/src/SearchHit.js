import React, { useState } from "react";

import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

/** SearchHit: an individual search result.  We render this in a Bootstrap Card. */
function SearchHit(props) {

  const [highlight, setHighlight] = useState(null);
  const [marked, setMarked] = useState(false);
  
  function on_relevant(extent) {
    if (extent) {
      props.on_relevant(props.hitkey, extent);
    } else {
      /* clear relevance judgment */
      props.on_relevant(props.hitkey);
    }
  }

  function hasSelection() {
    return (window.getSelection && !window.getSelection().isCollapsed)
  }

  function getSelectedText() {
    if (window.getSelection) {
      const sel = window.getSelection();
      if (!sel.isCollapsed) {
        const start = Math.min(sel.anchorOffset, sel.focusOffset);
        const end = Math.max(sel.anchorOffset, sel.focusOffset);
        return { "start": start,
                 "length": end - start,
                 "text": sel.toString() };
      }
    }
    return null;
  }

  /**
   * render function
   * @param {Object} this,props.content a JSON object representing a search hit.
   * @param {String} props.hitkey  the docid of the search result.
   * @param {String} props.title   the title of the result.
   *
   * Note use of 'hitkey'.  In React-Bootstrap, the 'key' attribute is special.  Don't
   * use it.
   */

  const doc = props.display_doc(props);
  const event_key = props.hitkey;
  const rel_key = "rel." + props.hitkey;
  
  const entities = new Map();
  if (props.people) {
    for (let p of props.people) {
      entities.set("p_"+p, (<span class="badge badge-info ml-1">{p}</span>));
    }
  }
  if (props.orgs) {
    for (let o of props.orgs) {
      entities.set("o_"+o, (<span class="badge badge-success ml-1">{o}</span>));
    }
  }
  if (props.gpes) {
    for (let g of props.gpes) {
      entities.set("g_"+g, (<span class="badge badge-warning ml-1">{g}</span>));
    }
  }
  
  return (
    <Card docid={props.hitkey}>
      <Modal show={marked} onHide={() => setMarked(false)} backgroup="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Mark relevant?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Do you want to mark this document as relevant with the current highlight?</p>
          {highlight && highlight.text}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMarked(false)}>Cancel</Button>
          <Button variant="primary"
                  onClick={() => {
                    on_relevant(highlight);
                    setMarked(false)
                  }}>Mark relevant</Button>
        </Modal.Footer>
      </Modal>

      <Accordion.Toggle as={Card.Header} eventKey={event_key}>
          <Container fluid>
            <Row className="d-flex justify-content-between">
              <Col>
                {props.seqno + 1}. <strong>{props.title}</strong>{" "}
              </Col>
              <Col>
                {props.rel
                 ? <span className="badge badge-primary">Relevant</span>
                 : ""}
              </Col>
            </Row>
          </Container>
        </Accordion.Toggle>
      <Accordion.Collapse eventKey={event_key}>
        <Card.Body>
          {props.hitkey}
          {props.rel ? <Button className="ml-2"
                               onClick={() => on_relevant(null)}>Clear relevant</Button> : ""}
          <p />
	  {entities.values()} <p />
          <div onMouseUp={(e) => {
                 if (!props.rel && hasSelection()) {
                   setHighlight(getSelectedText());
                   setMarked(true);
                 }
               }}>
            {doc}
          </div>
        </Card.Body>
      </Accordion.Collapse>
    </Card>
  );
}


export { SearchHit as default };
