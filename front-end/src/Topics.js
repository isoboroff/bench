import React from "react";

import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";

/*
 * <TopicEditor topic_num="1" writeup=(writeup) change_writeup=(fn)/>
 */
class TopicEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = { copied_to_clipboard: false };
    this.change_fields = this.change_fields.bind(this);
    this.copy_to_clipboard = this.copy_to_clipboard.bind(this);
  }

  change_fields(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.props.change_writeup(name, value);
  }

  /* Copy the current event to the clipboard, in a way that makes it easy for
     the user to paste it into the Google Sheet. */
  copy_to_clipboard() {
    const counts = { 'fas': 0, 'rus': 0, 'zho': 0 };
    this.props.qrels.forEach((value, key) => {
      counts[value.index]++;
    });

    const pasteup = [
      this.props.username,
      this.props.writeup.title,
      this.props.writeup.desc,
      this.props.writeup.narr,
      (counts['fas'] > 0) ? counts['fas'] : '',
      (counts['fas'] > 0) ? this.props.username : '',
      (counts['rus'] > 0) ? counts['rus'] : '',
      (counts['rus'] > 0) ? this.props.username : '',
      (counts['zho'] > 0) ? counts['zho'] : '',
      (counts['zho'] > 0) ? this.props.username : ''
    ].join('\t');

    navigator.clipboard.writeText(pasteup)
      .then(() => {
        this.setState({ copied_to_clipboard: true });
      }, () => {
        alert('Could not write to clipboard.');
      });
  }

  render() {
    let event_key = "topic-" + this.props.topic_num;
    const reldocs = [];
    this.props.qrels.forEach((value, key) => {
      reldocs.push(<li>[{value.index}] {key}</li>);
    });

    return (
      <Card>
        <Modal show={this.state.copied_to_clipboard}
          backdrop="static" keyboard={false}>
          <Modal.Header>
            <Modal.Title>Topic Copied!</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>The topic has been copied to the clipboard.</p>
            <p>Click this link to <a target="_blank" rel="noreferrer noopener" href="https://docs.google.com/spreadsheets/d/1213dNsCxTwuYcLDgsS1wQI6iwirawiqRVKzoA7fX3mo/edit#gid=0">open the topic spreadsheet</a> in a new tab.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary"
              onClick={() => { this.setState({ copied_to_clipboard: false }) }}>
              Ok
            </Button>
          </Modal.Footer>
        </Modal>

        <Accordion.Toggle as={Card.Header}
          variant="link"
          eventKey={event_key}
          onClick={this.props.set_current_topic.bind(this, this.props.topic_num)}>

          {this.props.current
            ? <strong>CURRENT TOPIC: </strong>
            : ''}
          {this.props.writeup.title}
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={event_key}>
          <Card.Body>
            <Form.Group controlId="title">
              <Form.Label>Task title</Form.Label>
              <Form.Control
                type="text"
                placeholder="title"
                name="title"
                value={this.props.writeup.title}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                A brief title for your topic, two to four key words.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="langs">
              <Form.Label>Languages</Form.Label>
              <Form.Row><Col>
                <Form.Check inline
                  type="checkbox"
                  name="fas"
                  id="fas-check"
                  label="Farsi"
                  value={this.props.writeup.fas}
                  checked={this.props.writeup.fas}
                  onChange={this.change_fields}
                />
                <Form.Check inline
                  type="checkbox"
                  name="rus"
                  id="rus-check"
                  label="Russian"
                  value={this.props.writeup.rus}
                  checked={this.props.writeup.rus}
                  onChange={this.change_fields}
                />
                <Form.Check inline
                  type="checkbox"
                  name="zho"
                  id="zho-check"
                  label="Chinese"
                  value={this.props.writeup.zho}
                  checked={this.props.writeup.zho}
                  onChange={this.change_fields}
                />
              </Col></Form.Row>
            </Form.Group>

            <Form.Group controlId="desc">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="A sentence-length description of the information need."
                name="desc"
                value={this.props.writeup.desc}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                A single sentence describing the information need.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="narr">
              <Form.Label>Narrative</Form.Label>
              <Form.Control
                as="textarea"
                rows="5"
                placeholder="A narrative paragraph."
                name="narr"
                value={this.props.writeup.narr}
                onChange={this.change_fields}
              />
              <Form.Text className="text-muted">
                An expanded description of the information need, including gray
                areas/areas of interpretation and scoping rules, and how you
                interpreted them as the user.
              </Form.Text>
            </Form.Group>

            <Row className="mt-3">
              <Col md={10}>
                Relevant documents:
                <ul>{reldocs}</ul>
              </Col>
            </Row>

            <Row>
              <Button variant="primary" className="mt-3 mx-2"
                onClick={this.copy_to_clipboard}>
                Copy to Clipboard
              </Button>
              <Button variant="primary" className="mt-3 mx-2"
                onClick={this.props.delete_topic.bind(this, this.props.topic_num)}>
                Delete
              </Button>
            </Row>


          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  }
}

/*
 * <Topics topics=(list of topics) current_topic=n 
 *  save_topic=(fn) delete_topic=(fn) new_topic=(fn)/>
 */
class Topics extends React.Component {
  render() {
    let topics = this.props.topics;
    let event_key = "topic-" + this.props.cur_topic;

    const topiclist = topics.map((hit, index) => (
      <TopicEditor topic_num={index}
        username={this.props.username}
        writeup={hit.writeup}
        qrels={hit.qrels}
        current={index === this.props.cur_topic}
        set_current_topic={this.props.set_current_topic}
        change_writeup={this.props.change_writeup}
        delete_topic={this.props.delete_topic} />
    ));

    return (
      <Container>
        <Row className="justify-content-md-center mt-5">
          <Col md={10}>
            <Button variant="primary" onClick={this.props.new_topic}>Create new topic</Button>
            <Accordion defaultActiveKey={event_key}>
              {topiclist}
            </Accordion>
          </Col>
        </Row>
      </Container>
    );
  }
}

export { Topics as default };

