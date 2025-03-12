import React from "react";
import { Container, Alert, Button } from "react-bootstrap";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {

    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {

    console.error("Uncaught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  handleReset = () => {

    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
 
      return (
        <Container className="mt-5 text-center">
          <Alert variant="danger">
            <h2>Something went wrong.</h2>
            <p>We're sorry, but an unexpected error occurred.</p>

            {this.state.error && (
              <details style={{ whiteSpace: "pre-wrap" }}>
                {this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </details>
            )}

            <Button
              variant="primary"
              onClick={this.handleReset}
              className="mt-3"
            >
              Try Again
            </Button>

            <Button
              variant="secondary"
              className="mt-3 ms-2"
              onClick={() => (window.location.href = "/")}
            >
              Return to Home
            </Button>
          </Alert>
        </Container>
      );
    }

  
    return this.props.children;
  }
}

export default ErrorBoundary;
