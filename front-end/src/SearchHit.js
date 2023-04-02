import React, { useState } from "react";

import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
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
        return {
          "start": start,
          "length": end - start,
          "text": sel.toString()
        };
      }
    }
    return null;
  }

  function cardHeader(seqno, title, direction) {
    let dir = '';
    let cname = '';

    if (direction && direction === 'rtl') {
      dir = 'rtl';
      cname = 'text-right';
    }

    return <span dir={dir} className={cname}>
      {seqno + 1}. <strong>{title}</strong>{" "}
    </span>
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
      entities.set("p_" + p, (<span class="badge badge-info ml-1">{p}</span>));
    }
  }
  if (props.orgs) {
    for (let o of props.orgs) {
      entities.set("o_" + o, (<span class="badge badge-success ml-1">{o}</span>));
    }
  }
  if (props.gpes) {
    for (let g of props.gpes) {
      entities.set("g_" + g, (<span class="badge badge-warning ml-1">{g}</span>));
    }
  }

  let title = props.title;
  if (!title) {
    title = props.content.text.substring(0, 60) + "...";
  }

  let row_class = 'd-flex';
  let hdr_class = 'd-flex';
  if (props.direction && props.direction === 'rtl') {
    row_class += ' flex-row-reverse';
    hdr_class += ' justify-content-end';
  }
  return (
    <Accordion.Item eventKey={props.hitkey}>
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

      <Accordion.Header>
        <Container fluid>
          <Row className={row_class}>
            <Col className={hdr_class}>
              {cardHeader(props.seqno, title, props.direction)}
            </Col>
            <Col>
              {props.rel
                ? <Badge pill bg="warning" text="dark">Relevant</Badge>
                : ""}
            </Col>
          </Row>
        </Container>
      </Accordion.Header>
      <Accordion.Body>
        {props.hitkey}
        <p />
        {entities.values()} <p />
        <div>
          {doc}
        </div>
      </Accordion.Body>
    </Accordion.Item>
  );
}


export { SearchHit as default };
