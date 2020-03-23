import React from "react";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import { saveAs } from 'file-saver';

class Writeup extends React.Component {
  constructor(props) {
    super(props);
    this.state = { state_is_live: false, title: "", desc: "", narr: "", questions: [] };

	this.restore_state = this.restore_state.bind(this);
	this.save_state = this.save_state.bind(this);
    this.addQuestion = this.addQuestion.bind(this);
    this.updateQuestion = this.updateQuestion.bind(this);
    this.removeQuestion = this.removeQuestion.bind(this);
    this.changeFields = this.changeFields.bind(this);
	this.save = this.save.bind(this);
	this.clear = this.clear.bind(this);
	this.print = this.print.bind(this);
  }

  restore_state() {
	let writeup_state = localStorage.getItem('writeup_state');
	if (writeup_state) {
	  let new_state = JSON.parse(writeup_state);
	  new_state.state_is_live = true;
	  this.setState(new_state);
	}
  }

  save_state() {
	let writeup_state = JSON.stringify(this.state);
	localStorage.setItem('writeup_state', writeup_state);
  }
  
  addQuestion(event) {
    let qs = this.state.questions;
    qs.push("");
    this.setState({ questions: qs });
    event.preventDefault();
  }

  removeQuestion(index, event) {
    let qs = this.state.questions;
    qs.splice(index, 1);
    this.setState({ questions: qs });
  }

  updateQuestion(index, event) {
    let qs = this.state.questions;
    qs[index] = event.target.value;
    this.setState({ questions: qs });
  }

  renderQuestions() {
    let questions = this.state.questions.map((input, index) => (
      <Form.Group controlId="question-{index}">
        <Form.Label>Analytic request {index + 1}</Form.Label>
        <div class="d-flex">
          <Form.Control
            className="mr-1"
            type="text"
            value={this.state.questions[index]}
            placeholder={input}
            onChange={this.updateQuestion.bind(this, index)}
          />
          <Button
            variant="primary"
            onClick={this.removeQuestion.bind(this, index)}
          >
            remove
          </Button>
        </div>
        <Form.Text className="text-muted">
          Enter a sentence-length information request related to the analytic
          task.
        </Form.Text>
      </Form.Group>
    ));

    questions.push(
      <Button variant="primary" onClick={this.addQuestion}>
        Add a request
      </Button>
    );

    return questions;
  }

  changeFields(event) {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  async save(event) {
    let data =  this.state;
	data.qrels = [];
	for (let k of this.props.qrels.keys()) {
	  data.qrels.push(k);
	}

	// First, toss the save object back to the server for safe-keeping
	fetch(window.location.href + 'save', {
	  method: 'POST',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  body: JSON.stringify(data)
	}).then((response) => response.json())
      .then((data) => {
		console.log('Backend save ok');
	  })
	  .catch((error) => {
		console.error('Backend save not ok');
	  });

	// Then, send a save object to the browser.
	let filename = data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
	let blob = new Blob([JSON.stringify(data)], {type: "application/json;charset=utf-8"});
	saveAs(blob, filename + ".json");
  }

  clear(event) {
	this.setState({ state_is_live: true, title: "", desc: "", narr: "", questions: [] },
				  /* then, do */ this.props.clearState);
	this.save_state();
  }

  print(event) {
	window.print();
  }
  
  componentDidUpdate() {
	this.save_state();
  }
	
  render() {
	if (!this.state.state_is_live) {
	  this.restore_state();
	}
	
    const reldocs = [];
    for (let key of this.props.qrels.keys()) {
      reldocs.push(<li>{key}</li>);
    }

    return (
      <Container>
        <Row className="justify-content-md-center mt-5">
          <Col md={10}>
            <div class="mb-3 d-md-flex">
              <Button variant="primary" className="mx-1" onClick={this.save}>
                Save
              </Button>
              <Button variant="primary" className="mx-1" onClick={this.print}>
                Print
              </Button>
              <Button variant="primary" className="mx-1" onClick={this.clear}>
                Clear
              </Button>
            </div>
            <Form.Group controlId="title">
              <Form.Label>Task title</Form.Label>
              <Form.Control
                type="text"
                placeholder="title"
                name="title"
				value={this.state.title}
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
				value={this.state.desc}
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
				value={this.state.narr}
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
