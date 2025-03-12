import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

//navbar

const CinerateNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();

    if (window.location.pathname === "/") {
      navigate("/");
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fs-3">
          🎬 Cinerate
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/search">
              🔍 Search
            </Nav.Link>

            {user && (
              <Nav.Link as={Link} to="/watchlist">
                📺 Watchlist
              </Nav.Link>
            )}
          </Nav>

          <Nav className="ms-auto">
            {user ? (
              <NavDropdown
                title={user.username}
                id="basic-nav-dropdown"
                menuVariant="dark"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  👤 Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  🚪 Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="btn btn-secondary">
                  Login
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/register"
                  className="btn btn-secondary"
                >
                  Sign Up
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CinerateNavbar;
