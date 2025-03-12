import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Badge,
  Spinner,
} from "react-bootstrap";
import axios from "axios";

export default function Movie() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userId, setUserId] = useState(null);
  const [watchListIds, setWatchlistIds] = useState([]);

  const sendWatchlist = async (movieId, isAddWishlist) => {
    try {
      const token = localStorage.getItem("tokenMovie");
      const userId = JSON.parse(localStorage.getItem("user"))?.id;
      if (!userId) return;

      const optionsPost = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          media_type: "movie",
          media_id: movieId,
          watchlist: !isAddWishlist,
        }),
      };

      const response = await fetch(
        `https://api.themoviedb.org/3/account/${userId}/watchlist`,
        optionsPost
      );
      const data = await response.json();

      let currentUserWatchList = JSON.parse(
        localStorage.getItem(`user_watchList_${userId}`) || "[]"
      );

      if (!isAddWishlist) {
        currentUserWatchList = [
          ...currentUserWatchList,
          { userid: userId, id: movieId },
        ];
      } else {
        currentUserWatchList = currentUserWatchList.filter(
          (obj) => !(obj.userid === userId && obj.id === movieId)
        );
      }

      localStorage.setItem(
        `user_watchList_${userId}`,
        JSON.stringify(currentUserWatchList)
      );
      setWatchlistIds(currentUserWatchList.map((item) => item.id));
      fetchData();
    } catch (err) {
      console.error("Watchlist error:", err);
      fetchData();
    }
  };

  const fetchData = async () => {
    try {
      let token = localStorage.getItem("tokenMovie");
      if (!token) {
        const response = await axios.post("/api/auth/reqToken");
        localStorage.setItem("tokenMovie", response.data.token);
        token = response.data.token;
      }

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const userIdVal = JSON.parse(localStorage.getItem("user"))?.id;
      setUserId(userIdVal);

  
      if (userIdVal) {
        const userWatchList = JSON.parse(
          localStorage.getItem(`user_watchList_${userIdVal}`) || "[]"
        );
        const watchlistIds = userWatchList
          .filter((item) => item.userid === userIdVal)
          .map((item) => item.id);
        setWatchlistIds(watchlistIds);
      }

 
      const movieResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${id}?language=en-US`,
        options
      );
      setMovie(await movieResponse.json());

   
      const reviewsResponse = await fetch(
        `https://api.themoviedb.org/3/movie/${id}/reviews?language=en-US`,
        options
      );
      setReviews((await reviewsResponse.json()).results || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const submitReview = async () => {
    try {
      if (!userId) {
        alert("Please login to submit a review");
        return;
      }
      const token = localStorage.getItem("token");
      let movie = {
        userid: userId,
        id: id,
        review: comment,
        rating: rating,
      };
      let currentRatedMovies = JSON.parse(
        localStorage.getItem("reviewed_movies") || "[]"
      );
      currentRatedMovies.push(movie);
      localStorage.setItem(
        "reviewed_movies",
        JSON.stringify(currentRatedMovies)
      );
      alert("Review submitted successfully!");
    } catch (err) {
      alert("Error submitting review");
    }
  };

  const formatRating = (rating) => (rating / 2).toFixed(1);
  return (
    <Container className="py-5">
      {movie && (
        <>
          <Row className="mb-5 g-4">
            <Col md={4}>
              <div className="position-relative">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="img-fluid rounded-4 shadow-lg"
                />
                {movie.vote_average && (
                  <div className="position-absolute top-0 end-0 m-2">
                    <Badge
                      className="d-flex align-items-center p-2 rounded-pill bg-gradient text-white"
                      style={{
                        background: "linear-gradient(45deg, #6c5ce7, #a8a4e6)",
                      }}
                    >
                      <small className="me-1">⭐</small>
                      <strong>{formatRating(movie.vote_average)}</strong>
                      <small className="ms-1 opacity-75">/5</small>
                    </Badge>
                  </div>
                )}
              </div>
              <div className="mt-4">
                {userId && (
                  <button
                    onClick={() =>
                      sendWatchlist(movie.id, watchListIds.includes(movie.id))
                    }
                    className={`btn w-100 py-2 fw-bold shadow-sm ${
                      watchListIds.includes(movie.id)
                        ? "btn-outline-danger"
                        : "btn-outline-primary"
                    }`}
                  >
                    <i
                      className={`bi me-2 ${
                        watchListIds.includes(movie.id)
                          ? "bi-bookmark-check-fill"
                          : "bi-bookmark-plus"
                      }`}
                    ></i>
                    {watchListIds.includes(movie.id)
                      ? "Remove from Watchlist"
                      : "Add to Watchlist"}
                  </button>
                )}
              </div>
            </Col>
            <Col md={8}>
              <h1 className="display-5 fw-bold mb-2">{movie.title}</h1>
              {movie.tagline && (
                <p className="text-muted fst-italic mb-3 fs-5">
                  "{movie.tagline}"
                </p>
              )}
              <div className="d-flex flex-wrap gap-2 mb-4">
                <Badge
                  bg="light"
                  text="dark"
                  className="rounded-pill px-3 py-2"
                >
                  {movie.release_date}
                </Badge>
                {movie.runtime && (
                  <Badge
                    bg="light"
                    text="dark"
                    className="rounded-pill px-3 py-2"
                  >
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </Badge>
                )}
                <Badge
                  className="rounded-pill px-3 py-2 bg-gradient text-white"
                  style={{
                    background: "linear-gradient(45deg, #6c5ce7, #a8a4e6)",
                  }}
                >
                  ★ {formatRating(movie.vote_average)}/5
                </Badge>
              </div>
              <p className="lead border-start border-4 border-primary ps-3 mb-4">
                {movie.overview}
              </p>

              {movie.genres && (
                <div className="mb-4">
                  <h5 className="text-secondary mb-3">Genres</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <Badge
                        key={genre.id}
                        className="rounded-pill font-monospace border-0 text-white"
                        style={{
                          background:
                            "linear-gradient(45deg, #6c5ce7, #a8a4e6)",
                          padding: "0.5rem 1rem",
                          fontSize: "0.85rem",
                        }}
                      >
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Col>
          </Row>

         
          <div className="my-5">
            <h3 className="mb-4 pb-2 border-bottom">
              <i className="bi bi-star me-2"></i>
              Write a Review
            </h3>

            <Card className="shadow border-0 rounded-4 overflow-hidden mb-5">
              <Card.Body className="p-4">
                <Form>
                  <Row className="align-items-center">
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label className="fw-bold">Your Rating</Form.Label>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-star-fill text-warning me-2"></i>
                          <Form.Select
                            value={rating}
                            onChange={(e) => setRating(e.target.value)}
                            className="rounded-pill py-2 border-0 bg-light"
                          >
                            {[5, 4, 3, 2, 1].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? "Star" : "Stars"}
                              </option>
                            ))}
                          </Form.Select>
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={9}>
                      <Form.Group>
                        <Form.Label className="fw-bold">
                          Your Comment
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="Share your thoughts about this movie..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="rounded-3 border-0 bg-light py-2"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end mt-3">
                    <Button
                      onClick={submitReview}
                      className="rounded-pill px-4 py-2 fw-bold border-0"
                      style={{
                        background: "linear-gradient(45deg, #4e73ff, #6b8dff)",
                      }}
                    >
                      <i className="bi bi-send me-2"></i>
                      Submit Review
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </div>

        
          <div className="mb-5">
            <h3 className="mb-4 pb-2 border-bottom">
              <i className="bi bi-chat-square-text me-2"></i>
              User Reviews {reviews.length > 0 && `(${reviews.length})`}
            </h3>

            {reviews.length > 0 ? (
              reviews.map((review) => (
                <Card
                  key={review.id}
                  className="mb-3 shadow-sm border-0 rounded-4"
                >
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center gap-3">
                        {review.author_details.avatar_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`}
                            alt={review.author}
                            className="rounded-circle"
                            style={{ width: "45px", height: "45px" }}
                          />
                        ) : (
                          <div
                            className="rounded-circle bg-gradient d-flex align-items-center justify-content-center"
                            style={{
                              width: "45px",
                              height: "45px",
                              background:
                                "linear-gradient(45deg, #6c5ce7, #a8a4e6)",
                            }}
                          >
                            <span className="text-white fw-bold">
                              {review.author.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h6 className="mb-0 fw-bold">{review.author}</h6>
                          <small className="text-muted">
                            {new Date(review.created_at).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      {review.author_details.rating && (
                        <Badge
                          bg="light"
                          text="dark"
                          className="rounded-pill px-3 py-2"
                        >
                          ★ {(review.author_details.rating / 2).toFixed(1)}
                        </Badge>
                      )}
                    </div>
                    <p className="mb-0 text-muted">{review.content}</p>
                  </Card.Body>
                </Card>
              ))
            ) : (
              <div className="text-center py-5 bg-light rounded-4">
                <p className="text-muted mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  No reviews yet. Be the first to review!
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {!movie && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Loading movie details...</p>
        </div>
      )}
    </Container>
  );
}
