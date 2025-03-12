import React, { useEffect, useState } from "react";
import {
  ListGroup,
  Card,
  Spinner,
  Row,
  Col,
  Alert,
  Badge,
  Container,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Profile() {
  const [user, setUser] = useState({});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [watchlist, setWatchlistData] = useState([]);


  const getWatchList = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("tokenMovie") || null;
      if (!token) {
        const response = await axios.post("/api/auth/reqToken");
        console.log("Token response:", response.data);
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
      const userId = JSON.parse(localStorage.getItem("user")).id;

      console.log("userId", userId);

      fetch(
        `https://api.themoviedb.org/3/account/${userId}/watchlist/movies?language=en-US&page=1&sort_by=created_at.asc`,
        options
      )
        .then((res) => res.json())
        .then((res) => {
          console.log(res);
          setUser(JSON.parse(localStorage.getItem("user")));
          let currentUserWatchList = [];
          let userProperWatchList = [];
          if (localStorage.getItem(`user_watchList_${userId}`)) {
            currentUserWatchList = JSON.parse(
              localStorage.getItem(`user_watchList_${userId}`)
            );
          }
         
          if (currentUserWatchList.length > 0) {
            currentUserWatchList.map((movie) => {
              res.results.map((movie2) => {
                if (movie.userid === userId && movie.id === movie2.id) {
                  userProperWatchList.push(movie2);
                  console.log(userProperWatchList);
                }
              });
            });
          }
          getMovieGenre(options, userProperWatchList);
          if (localStorage.getItem("reviewed_movies")) {
            fetchReviewedMovie(
              JSON.parse(localStorage.getItem("reviewed_movies")),
              options,
              userId
            );
          }
          setLoading(false);
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error("Search error:", err);
      setWatchlistData([]);
    } finally {
      setLoading(false);
    }
  };

  const getMovieGenre = async (options, moviesList) => {
    try {
      fetch(
        "https://api.themoviedb.org/3/genre/movie/list?language=en",
        options
      )
        .then((res) => res.json())
        .then((resGenre) => {
        
          moviesList.map((movie) => {
            let genresMovie = [];
            movie.genre_ids.map((genreId) => {
              resGenre.genres.map((genreItem) => {
                if (genreItem.id === genreId) {
                  genresMovie.push(genreItem.name);
                }
              });
            });
            movie.genres = genresMovie;
          });
          setWatchlistData(moviesList || []);
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
    }
  };

  const removeWatchList = async (movieId) => {
    try {
      const token = localStorage.getItem("tokenMovie");
      const userId = JSON.parse(localStorage.getItem("user")).id;
      console.log("userId", userId);

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
          watchlist: false,
        }),
      };

      fetch(
        `https://api.themoviedb.org/3/account/${userId}/watchlist`,
        optionsPost
      )
        .then((res) => res.json())
        .then((res) => {
          let currentUserWatchList = JSON.parse(
            localStorage.getItem(`user_watchList_${userId}`)
          );
          console.log(currentUserWatchList);
          currentUserWatchList = currentUserWatchList.filter(
            (obj) => obj.userid === userId && obj.id !== movieId
          );
          localStorage.setItem(
            `user_watchList_${userId}`,
            JSON.stringify(currentUserWatchList)
          );
          getWatchList();
        })
        .catch((err) => {
          console.log(err);
          getWatchList();
        });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviewedMovie = async (reviewedMovies, options, userId) => {
    let movieData = [];
    await reviewedMovies.map(async (movie) => {
      if (movie.userid === userId) {
        await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}?language=en-US`,
          options
        )
          .then((res) => res.json())
          .then((res) => {
            res.review = movie.review;
            res.rating = movie.rating;
            res.comment = movie.review;
            movieData.push(res);
            console.log("reviewwww", res);
          })
          .catch((err) => console.error(err));
      }
    });
    setReviews(movieData);
  };
  useEffect(() => {
    getWatchList();
  }, []);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", background: "#f8f9fa" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3.5rem", height: "3.5rem" }}
          />
          <p className="mt-3 text-primary fw-bold">Loading your profile...</p>
        </div>
      </div>
    );

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        paddingBottom: "3rem",
      }}
    >
      <Container className="pt-4">
        {error && (
          <Alert variant="danger" className="shadow-sm mb-3">
            {error}
          </Alert>
        )}

    
        <Card className="mb-3 border-0 overflow-hidden profile-header">
          <div className="profile-banner position-relative">
            <div
              className="position-absolute w-100 h-100"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
                opacity: 0.9,
              }}
            ></div>
            <Card.Body className="p-3 position-relative text-center text-white">
              <div
                className="bg-white shadow-lg text-primary rounded-circle d-flex justify-content-center align-items-center mx-auto mb-2"
                style={{
                  width: "80px",
                  height: "80px",
                  fontSize: "2rem",
                  border: "3px solid white",
                }}
              >
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "U"}
              </div>
              <h2
                className="fw-bold mb-1"
                style={{ textTransform: "capitalize" }}
              >
                {user.fullName}
              </h2>
              <p className="mb-0">@{user.username}</p>
              <div className="email-badge mt-2">
                <span className="px-2 py-1 bg-white bg-opacity-25 rounded-pill small">
                  <i className="bi bi-envelope me-1"></i> {user.email}
                </span>
              </div>
            </Card.Body>
          </div>
        </Card>

     
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body className="p-0">
            <Row className="g-0">
              <Col md={6} className="stats-col">
                <div className="text-center p-3 h-100 d-flex flex-column justify-content-center stat-item">
                  <div className="stat-icon mb-2">
                    <div className="icon-circle bg-warning bg-opacity-10 mx-auto">
                      <i className="bi bi-star fs-4 text-warning"></i>
                    </div>
                  </div>
                  <h5 className="fw-bold">Reviews</h5>
                  <p className="mb-0">{reviews.length}</p>
                </div>
              </Col>
              <Col md={6} className="stats-col">
                <div className="text-center p-3 h-100 d-flex flex-column justify-content-center stat-item">
                  <div className="stat-icon mb-2">
                    <div className="icon-circle bg-info bg-opacity-10 mx-auto">
                      <i className="bi bi-film fs-4 text-info"></i>
                    </div>
                  </div>
                  <h5 className="fw-bold">Watchlist</h5>
                  <p className="mb-0">{watchlist.length}</p>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

     
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white p-3 border-0">
            <div className="d-flex align-items-center">
              <h3 className="mb-0 me-2 fw-bold">My Reviews</h3>
              <Badge bg="primary" pill className="px-2 py-1">
                {reviews.length}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-3">
            {reviews.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-journal-text fs-2 text-muted mb-2"></i>
                <p className="text-muted mb-0">
                  You haven't written any reviews yet
                </p>
              </div>
            ) : (
              <div className="review-list">
                {reviews.map((review, index) => (
                  <div
                    key={review.title}
                    className={`review-item p-3 ${
                      index !== reviews.length - 1 ? "border-bottom" : ""
                    }`}
                  >
                    <div className="d-flex">
                      <div className="me-3" style={{ width: "100px" }}>
                        <Card.Img
                          className="rounded shadow-sm"
                          src={
                            review.poster_path
                              ? `https://image.tmdb.org/t/p/w500${review.poster_path}`
                              : "/placeholder.jpg"
                          }
                          alt={review.title}
                        />
                      </div>
                      <div className="flex-grow-1">
                        <h5 className="mb-1 fw-bold">
                          <Link
                            to={`/movie/${review.id}`}
                            className="text-decoration-none text-primary"
                          >
                            {review.title}
                          </Link>
                        </h5>
                        {review.genres && (
                          <div className="mb-2">
                            {review.genres.map((genre) => (
                              <Badge
                                bg="light"
                                text="dark"
                                className="me-1 px-2 py-1 small"
                                key={genre.name}
                              >
                                {genre.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                        <div className="text-warning mb-2">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </div>
                        <p className="mb-0 text-muted">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

  
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white p-3 border-0">
            <div className="d-flex align-items-center">
              <h3 className="mb-0 me-2 fw-bold">My Watchlist</h3>
              <Badge bg="primary" pill className="px-2 py-1">
                {watchlist.length}
              </Badge>
            </div>
          </Card.Header>
          <Card.Body className="p-3">
            {watchlist.length === 0 ? (
              <div className="text-center py-4">
                <i className="bi bi-film fs-2 text-muted mb-2"></i>
                <p className="text-muted mb-0">Your watchlist is empty</p>
              </div>
            ) : (
              <Row xs={1} md={2} lg={4} className="g-3">
                {watchlist.map((movie) => (
                  <Col key={movie.id}>
                    <Card className="h-100 border-0 shadow-sm hover-card">
                     
                      <div className="position-relative movie-poster-container">
                        <div className="poster-aspect-ratio">
                          <Card.Img
                            variant="top"
                            src={
                              movie.poster_path
                                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                                : "/placeholder.jpg"
                            }
                            className="movie-poster"
                            alt={movie.title}
                          />
                        </div>
                        {movie.vote_average && (
                          <span className="position-absolute top-0 end-0 rating-badge">
                            ⭐{" "}
                            {movie.vote_average > 5
                              ? 5
                              : movie.vote_average.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <Card.Body className="d-flex flex-column p-3">
                       
                        <Card.Title className="fw-bold mb-1 movie-title">
                          {movie.title}
                        </Card.Title>
                        <Card.Text className="text-muted small mb-1">
                          {movie.release_date &&
                            new Date(movie.release_date).getFullYear()}
                        </Card.Text>
                   
                        <div className="genre-container mb-2">
                          {movie.genres &&
                            movie.genres.slice(0, 3).map((genre, index) => (
                              <span
                                key={index}
                                className="badge bg-light text-dark me-1 mb-1 small genre-badge"
                                title={genre}
                              >
                                {genre}
                              </span>
                            ))}
                          {movie.genres && movie.genres.length > 3 && (
                            <span className="badge bg-secondary text-white me-1 mb-1 small">
                              +{movie.genres.length - 3}
                            </span>
                          )}
                        </div>
                        <div className="d-grid gap-2 mt-auto">
                          <Link
                            to={`/movie/${movie.id}`}
                            className="btn btn-primary btn-sm"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => removeWatchList(movie.id)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            Remove
                          </button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card.Body>
        </Card>
      </Container>

      <style jsx="true">{`
        .profile-header {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .profile-banner {
          min-height: 180px;
        }

        .stats-col + .stats-col {
          border-left: 1px solid rgba(0, 0, 0, 0.08);
        }

        .icon-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-item:hover {
          background-color: rgba(0, 0, 0, 0.02);
          transition: background-color 0.3s ease;
        }

        .hover-card {
          transition: all 0.3s ease;
          border-radius: 8px;
          overflow: hidden;
        }

        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        /* FIXED: Movie poster container with proper aspect ratio */
        .movie-poster-container {
          overflow: hidden;
        }

        .poster-aspect-ratio {
          position: relative;
          padding-top: 150%; /* Fixed 2:3 aspect ratio for movie posters */
          overflow: hidden;
        }

        .movie-poster {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .hover-card:hover .movie-poster {
          transform: scale(1.05);
        }

        /* FIXED: Better title handling */
        .movie-title {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          height: 40px;
          font-size: 1rem;
        }

        /* FIXED: Better genre tag handling */
        .genre-container {
          min-height: 46px;
          display: flex;
          flex-wrap: wrap;
          align-content: flex-start;
        }

        .genre-badge {
          display: inline-block;
          max-width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 0.7rem;
        }

        .rating-badge {
          background-color: rgba(13, 110, 253, 0.9);
          color: white;
          padding: 4px 8px;
          margin: 8px;
          border-radius: 12px;
          font-weight: bold;
          font-size: 0.8rem;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }

        .review-item {
          transition: background-color 0.3s ease;
        }

        .review-item:hover {
          background-color: rgba(0, 0, 0, 0.02);
        }

        .review-list {
          border-radius: 8px;
        }

        @media (max-width: 768px) {
          .stats-col + .stats-col {
            border-left: none;
            border-top: 1px solid rgba(0, 0, 0, 0.08);
          }

          .profile-banner {
            min-height: 160px;
          }
        }
      `}</style>
    </div>
  );
}
