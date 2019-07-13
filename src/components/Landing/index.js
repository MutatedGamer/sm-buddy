import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import "./index.css"

const App = () => (
  <div>
    <h1>App</h1>
    <Row className="align-items-center">
      <Col xs={6} className="mx-auto">
        <div class="jumbotron">
          <Card className="card-video">
            <Card.Body className="p-0">
              <div className="embed-responsive embed-responsive-16by9">
                <iframe className="embed-responsive-item" src={"https://www.youtube.com/embed/VW5qEiCC42A"} allowFullScreen></iframe>
              </div>
            </Card.Body>
          </Card>
          </div>
      </Col>
    </Row>
  </div>
);

export default App;
