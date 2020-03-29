import React from "react";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";

class Writeup extends React.Component {
  constructor(props) {
    super(props);
    this.changeFields = this.changeFields.bind(this);
  }

  changeFields(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

	this.props.change_writeup(name, value);
  }

  render() {
    const reldocs = [];
    for (let key of this.props.qrels.keys()) {
      reldocs.push(<li>{key}</li>);
    }

    return (
      <Container>
        <Row className="justify-content-md-center mt-5">
          <Col md={10}>
            <div class="mb-3 d-md-flex">
              <Button variant="primary" className="mx-1">
                Save
              </Button>
              <Button variant="primary" className="mx-1">
                Print
              </Button>
              <Button variant="primary" className="mx-1">
                Clear
              </Button>
            </div>
            <Form.Group controlId="title">
              <Form.Label>Task title</Form.Label>
              <Form.Control
                type="text"
                placeholder="title"
                name="title"
				value={this.props.writeup.title}
                onChange={this.changeFields}
              />
              <Form.Text className="text-muted">
                A brief title for your topic, two to four key words.
              </Form.Text>
            </Form.Group>

            <Form.Group controlId="task">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="A sentence-length description of the analytic task."
                name="desc"
				value={this.props.writeup.desc}
                onChange={this.changeFields}
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
                onChange={this.changeFields}
              />
              <Form.Text className="text-muted">
                An expanded description of the information need, including gray
                areas/areas of interpretation and scoping rules, and how you
                interpreted them as the user.
              </Form.Text>
            </Form.Group>

            {/* <div>{this.renderQuestions()}</div> */}
          </Col>
        </Row>
        <Row className="justify-content-md-center mt-3">
          <Col md={10}>
            Relevant documents:
            <ul>{reldocs}</ul>
          </Col>
        </Row>
      </Container>
    );
  }
}

export { Writeup as default };
