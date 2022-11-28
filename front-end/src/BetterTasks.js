import React from "react";

import Card from "react-bootstrap/Card";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";

/*
 * <TopicEditor topic_num="1" writeup=(writeup) change_writeup=(fn)/>
 */
class TopicEditor extends React.Component {
  constructor(props) {
    super(props);
    this.change_fields = this.change_fields.bind(this);
  }

  change_fields(event) {
    // const target = event.target;
    // const value = target.type === "checkbox" ? target.checked : target.value;
    // const name = target.name;

    // this.props.change_writeup(name, value);
    event.stopPropagation();
    event.preventDefault();
  }

  update_request(index, event) {
    // this.props.change_reqtext(this.props.topic_num, index, event.target.value);
    event.preventDefault();
  }

  delete_request(index, event) {
    // this.props.delete_request(this.props.topic_num, index);
    event.preventDefault();
  }

  add_request(event) {
    // this.props.new_request();
    event.preventDefault();
  }

  render() {
    let event_key = "topic-" + this.props.topic_num;
    const reldocs = [];
    for (let [docid, extent] of this.props.qrels.entries()) {
      reldocs.push(<li>{docid}: {extent.text}</li>);
    }

    let requests = this.props.requests.map((req, index) => {
      const req_reldocs = [];
      for (let [docid, extent] of req.qrels.entries()) {
        req_reldocs.push(<li>{docid}: {extent.text}</li>);
      }

      return (
        <>
          <Button
            onClick={this.props.set_current_request.bind(this, this.props.topic_num, index)}
            variant={(index === this.props.cur_req) ? "primary" : "light"}
          >
            {(index === this.props.cur_req) ? <strong>CURRENT: </strong> : ''}
          Analytic request {index + 1}</Button>
          <dd>
            <b>{req.req_text}</b>
            <div>
              Request-level relevant documents:
          <ul>{req_reldocs}</ul>
            </div>
          </dd>
        </>
      );
    });

    return (
      <Card>
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
            <dl>
              <dt>Task title:</dt>
              <dd> {this.props.writeup.title} </dd>

              <dt>Description:</dt>
              <dd> {this.props.writeup.desc} </dd>

              <dt>Narrative:</dt>
              <dd> {this.props.writeup.narr} </dd>

              <dt>In Scope:</dt>
              <dd> {this.props.writeup.inscope} </dd>

              <dt>Out of Scope:</dt>
              <dd> {this.props.writeup.outscope} </dd>
            </dl>

            <Row>
              <Col><dl>
                {requests}
              </dl></Col>
            </Row>
          </Card.Body>
        </Accordion.Collapse>
      </Card >
    );
  }
}

/*
 * <Topics topics=(list of topics) current_topic=n 
 *  save_topic=(fn) delete_topic=(fn) new_topic=(fn)/>
 */
class BetterTasks extends React.Component {
  render() {
    let topics = this.props.topics;
    let event_key = "topic-" + this.props.cur_topic;

    const topiclist = topics.map((hit, index) => (
      <TopicEditor topic_num={index}
        writeup={hit.writeup}
        qrels={hit.qrels}
        requests={hit.requests}
        current={index === this.props.cur_topic}
        cur_req={(index === this.props.cur_topic) ? this.props.cur_req : -1}
        set_current_topic={this.props.set_current_topic}
        change_writeup={this.props.change_writeup}
        delete_topic={this.props.delete_topic}
        change_reqtext={this.props.change_reqtext}
        set_current_request={this.props.set_current_request}
        delete_request={this.props.delete_request}
        new_request={this.props.new_request} />
    ));

    return (
      <Container>
        <Row className="justify-content-md-center mt-5">
          <Col md={10}>
            <Accordion defaultActiveKey={"topic-" + this.props.cur_topic}>
              {topiclist}
            </Accordion>
          </Col>
        </Row>
      </Container>
    );
  }
}

export { BetterTasks as default };

