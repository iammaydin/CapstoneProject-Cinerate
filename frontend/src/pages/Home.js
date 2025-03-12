import { Container } from "react-bootstrap";
import { useState, useEffect } from "react";
import { Row, Col, Card, Spinner, Badge, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [upcomingMovie, setUpcomingMovie] = useState([]);
  const [loading, setLoading] = useState(false);
  const [watchListIds, setWatchlistIds] = useState([]);
  const [userId, setUserId] = useState(null);

  const sendWatchlist = async (movieId, isAddWishlist) => {
    try {
      const token = localStorage.getItem("tokenMovie");
      const userId = JSON.parse(localStorage.getItem("user")).id;
      console.log("userId", userId);
      console.log("token", token);

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

      fetch(
        `https://api.themoviedb.org/3/account/${userId}/watchlist`,
        optionsPost
      )
        .then((res) => res.json())
        .then((res) => {
          let currentUserWatchList = [];
          if (!isAddWishlist) {
            let movie = {
              userid: userId,
              id: movieId,
            };

            if (localStorage.getItem(`user_watchList_${userId}`)) {
              currentUserWatchList = JSON.parse(
                localStorage.getItem(`user_watchList_${userId}`)
              );
            }
            currentUserWatchList.push(movie);
            localStorage.setItem(
              `user_watchList_${userId}`,
              JSON.stringify(currentUserWatchList)
            );
          } else {
            currentUserWatchList = JSON.parse(
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
          }
          searchMovies();
        })
        .catch((err) => {
          searchMovies();
          console.log(err);
        });
    } catch (err) {
      console.error(err);
    }
  };

  const searchMovies = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("tokenMovie") || null;
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
      const userIdVal = JSON.parse(localStorage.getItem("user"))
        ? JSON.parse(localStorage.getItem("user")).id
        : null;
      setUserId(userIdVal);
      if (userIdVal) {
        fetch(
          `https://api.themoviedb.org/3/account/${userIdVal}/watchlist/movies?language=en-US&page=1&sort_by=created_at.asc`,
          options
        )
          .then((res) => res.json())
          .then((res) => {
            if (res.results) {
              let watchlistMapId = [];
              const userWatchList = localStorage.getItem(
                `user_watchList_${userIdVal}`
              );
              if (userWatchList) {
                const currentUserWatchList = JSON.parse(userWatchList);
                currentUserWatchList.forEach((watchList) => {
                  if (watchList.userid === userIdVal) {
                    watchlistMapId.push(watchList.id);
                  }
                });
                setWatchlistIds(watchlistMapId);
              } else {
                setWatchlistIds([]);
              }
              searchTopRatedMovies(options);
              searchPopularMovies(options);
            }
          })
          .catch((err) => console.error(err));
      } else {
        searchTopRatedMovies(options);
        searchPopularMovies(options);
      }
    } catch (err) {
      console.error("Search error:", err);
      setUpcomingMovie([]);
    } finally {
      setLoading(false);
    }
  };

  const searchPopularMovies = async (options) => {
    try {
      fetch(
        `https://api.themoviedb.org/3/movie/popular?language=en-US&page=1`,
        options
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.results.length > 8) {
            res.results = res.results.slice(0, 8); // Limit to 8 movies
          }
          getMovieGenre(options, res, 0);
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error("Search error:", err);
      setMovies([]);
    }
  };

  const searchTopRatedMovies = async (options) => {
    try {
      fetch(
        `https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1`,
        options
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.results.length > 8) {
            res.results = res.results.slice(0, 8); // Limit to 8 movies
          }
          getMovieGenre(options, res, 1);
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error("Search error:", err);
      setUpcomingMovie([]);
    }
  };

  const getMovieGenre = async (options, moviesList, movieType) => {
    try {
      fetch(
        "https://api.themoviedb.org/3/genre/movie/list?language=en",
        options
      )
        .then((res) => res.json())
        .then((resGenre) => {
          moviesList.results.map((movie) => {
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
          if (movieType === 1) {
            setUpcomingMovie(moviesList.results || []);
          } else {
            setMovies(moviesList.results || []);
          }
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(searchMovies, 500);
    return () => clearTimeout(timer);
  }, []);

  const MovieCard = ({ movie, sectionType }) => (
    <Card className="h-100 border-0 shadow-sm movie-card">
      <div className="position-relative movie-poster">
        <Card.Img
          variant="top"
          src={
            movie.poster_path
              ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
              : "/placeholder.jpg"
          }
          className="poster-image"
        />
      </div>
      <Card.Body className="p-3 d-flex flex-column">
        <Card.Title className="fw-bold mb-2 movie-title">
          {movie.title}
        </Card.Title>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Badge bg="primary" className="rounded-pill px-3 py-2">
            ★ {movie.vote_average > 5 ? 5 : movie.vote_average.toFixed(1)}
          </Badge>
          <small className="text-muted">
            {movie.release_date && new Date(movie.release_date).getFullYear()}
          </small>
        </div>

        <div className="genre-container mb-3">
          {movie.genres?.slice(0, 2).map((genre, idx) => (
            <Badge key={idx} bg="light" text="dark" className="genre-badge">
              {genre}
            </Badge>
          ))}
        </div>

        <div className="d-grid gap-2 mt-auto">
          {userId && (
            <Button
              onClick={() =>
                sendWatchlist(movie.id, watchListIds.includes(movie.id))
              }
              variant={
                watchListIds.includes(movie.id)
                  ? "outline-danger"
                  : "outline-primary"
              }
              size="sm"
              className="w-100"
            >
              {watchListIds.includes(movie.id)
                ? "Remove from Watchlist"
                : "Add to Watchlist"}
            </Button>
          )}
          <Link
            to={`/movie/${movie.id}`}
            className="btn btn-primary btn-sm w-100"
          >
            View Details
          </Link>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="bg-light min-vh-100">
      <div
        className="position-relative overflow-hidden p-5 text-center hero-section"
        style={{
          backgroundImage:
            "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
          opacity: 0.9,
        }}
      >
        <div className="col-lg-8 mx-auto py-5">
          <h1 className="display-4 fw-bold mb-3 text-white">
            Welcome to Cinerate
          </h1>
          <p className="lead mb-4 text-white opacity-85">
            Discover, rate, and review your favorite movies.
          </p>
          <div className="d-flex gap-3 justify-content-center">
            <a href="#popular" className="btn btn-light btn-lg px-4 fw-bold">
              Popular Movies
            </a>
            <a href="#toprated" className="btn btn-outline-light btn-lg px-4">
              Top Rated
            </a>
          </div>
        </div>
      </div>

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5 my-5">
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="fs-4" />
            <p className="mt-3 text-muted fs-5">
              Loading amazing movies for you...
            </p>
          </div>
        </div>
      )}

      {!loading && movies.length === 0 && (
        <div className="text-center py-5 my-5">
          <i className="bi bi-film fs-1 text-secondary mb-3" />
          <h3 className="text-secondary mb-2">No movies found</h3>
          <p className="text-muted fs-5">
            Please try again later or check your connection
          </p>
        </div>
      )}

      <Container id="popular" className="py-5">
        <div className="d-flex align-items-center mb-4">
          <div
            className="bg-primary me-3"
            style={{ width: "4px", height: "32px" }}
          />
          <h2 className="h2 fw-bold m-0 text-dark">Popular Movies</h2>
        </div>
        <p className="lead text-muted mb-4">The most watched films right now</p>

        <Row xs={1} sm={2} md={2} lg={4} className="g-4">
          {movies?.map((movie) => (
            <Col key={movie.id}>
              <MovieCard movie={movie} sectionType="popular" />
            </Col>
          ))}
        </Row>
      </Container>

      <div className="bg-light py-5">
        <Container id="toprated">
          <div className="d-flex align-items-center mb-4">
            <div
              className="bg-primary me-3"
              style={{ width: "4px", height: "32px" }}
            />
            <h2 className="h2 fw-bold m-0 text-dark">Top Rated Movies</h2>
          </div>
          <p className="lead text-muted mb-4">
            Critically acclaimed masterpieces
          </p>

          <Row xs={1} sm={2} md={2} lg={4} className="g-4">
            {upcomingMovie?.map((movie) => (
              <Col key={movie.id}>
                <MovieCard movie={movie} sectionType="toprated" />
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      <style jsx="true">{`
        .hero-section {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
        }

        .movie-card {
          transition: all 0.3s ease;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05) !important;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .movie-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .movie-poster {
          overflow: hidden;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
        }

        .poster-image {
          width: 100%;
          aspect-ratio: 2/3;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .movie-card:hover .poster-image {
          transform: scale(1.05);
        }

        .movie-title {
          font-size: 1.1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          height: 2.8rem;
          margin-bottom: 0.75rem;
        }

        .genre-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          min-height: 2rem;
          max-height: 2rem;
          overflow: hidden;
        }

        .genre-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 100%;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          display: inline-block;
        }

        .btn-primary,
        .bg-primary {
          background-color: #4158d0 !important;
          border-color: #4158d0 !important;
        }

        .btn-outline-primary {
          color: #4158d0 !important;
          border-color: #4158d0 !important;
        }

        .btn-outline-primary:hover {
          background-color: #4158d0 !important;
          color: white !important;
        }

        .btn-outline-danger {
          color: #dc3545 !important;
          border-color: #dc3545 !important;
        }

        .btn-outline-danger:hover {
          background-color: #dc3545 !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Home;
