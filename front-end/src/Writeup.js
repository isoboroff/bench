import React from "react";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";


class Writeup extends React.Component {
  constructor(props) {
	super(props);
	this.state = { questions: [] };
	this.addQuestion = this.addQuestion.bind(this);
	this.removeQuestion = this.removeQuestion.bind(this);
  }

  addQuestion(event) {
	var qs = this.state.questions;
	qs.push("New question");
	this.setState({ questions: qs} );
	event.preventDefault();
  }

  removeQuestion(event) {
	var qs = this.state.questions;
	qs.splice(event.target.id, 1);
	this.setState({ questions: qs} );
  }

  renderQuestions() {
	var questions = this.state.questions.map((input, index) => (
	  <Form.Group controlId="question-{index}">
		<Form.Label>Analytic request {index}</Form.Label>
		<div class="d-flex">
		  <Form.Control className="mr-1" type="text" key={index} placeholder={input} />
		  <button class="btn btn-primary" id={index} onClick={this.removeQuestion}>remove</button>
		</div>
	  </Form.Group>
	));

	questions.push(
	  <button class="btn btn-primary" onClick={this.addQuestion}>Add a question</button>
	);

	return questions;
  }

  render() {
    return (
      <Container>
        <Row className="justify-content-md-center mt-5">
          <Col md={10}>
              <Form.Group controlId="title">
                <Form.Label>Task title</Form.Label>
                <Form.Control type="text" placeholder="title" />
                <Form.Text className="text-muted">
                  A brief title for your analytic task write-up.
                </Form.Text>
              </Form.Group>

              <Form.Group controlId="link">
                <Form.Label>Background link</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="https://en.wikipedia.org/useful-background-page/"
                />
                <Form.Text className="text-muted">
                  A Wikipedia page providing useful background on the analytic
                  task.
                </Form.Text>
              </Form.Group>

              <Form.Group controlId="desc">
                <Form.Label>Analytic task</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="A sentence-length description of the analytic task."
                />
                <Form.Text className="text-muted">
                  A single sentence describing the analytic task.
                </Form.Text>
              </Form.Group>
			  
              <Form.Group controlId="narr">
                <Form.Label>Task narrative</Form.Label>
                <Form.Control
                  as="textarea"
                  rows="5"
                  placeholder="A narrative paragraph."
                />
                <Form.Text className="text-muted">
                  An expanded description of the information need, including
                  gray areas/areas of interpretation and scoping rules, and how you interpreted
                  them as the user.
                </Form.Text>
              </Form.Group>

			  <div>
				{this.renderQuestions()}
			  </div>
          </Col>
        </Row>
      </Container>
    );
  }
}

export { Writeup as default };
