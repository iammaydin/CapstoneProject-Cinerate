import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Watchlist() {
  const [watchlistData, setWatchlistData] = useState([]);
  const [loading, setLoading] = useState(false);

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
          searchMovies();
        })
        .catch((err) => {
          console.log(err);
          searchMovies();
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
      const userId = JSON.parse(localStorage.getItem("user")).id;

      fetch(
        `https://api.themoviedb.org/3/account/${userId}/watchlist/movies?language=en-US&page=1&sort_by=created_at.asc`,
        options
      )
        .then((res) => res.json())
        .then((res) => {
          let currentUserWatchList = [];
          let userProperWatchList = [];
          if (localStorage.getItem(`user_watchList_${userId}`)) {
            currentUserWatchList = JSON.parse(
              localStorage.getItem(`user_watchList_${userId}`)
            );
          }
        
          const combinedWatchlist = res.results.filter((apiMovie) =>
            currentUserWatchList.some(
              (localMovie) =>
                localMovie.userid === userId && localMovie.id === apiMovie.id
            )
          );
          getMovieGenre(options, combinedWatchlist);
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

  useEffect(() => {
    const timer = setTimeout(searchMovies, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="py-5 px-4 bg-light min-vh-100">
      <Container className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold">My Watchlist</h1>
          <Badge bg="primary" pill className="fs-6 px-3 py-2">
            {watchlistData.length} Movies
          </Badge>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-3 text-muted">Loading your watchlist...</p>
          </div>
        )}

        {!loading && watchlistData.length <= 0 && (
          <div className="text-center py-5 bg-white rounded shadow-sm">
            <i className="bi bi-film fs-1 text-muted mb-3"></i>
            <h4 className="text-muted">Your watchlist is empty</h4>
            <p className="text-muted mb-0">
              Movies you want to watch will appear here
            </p>
          </div>
        )}

        <Row xs={1} sm={2} md={3} lg={4} className="g-4">
          {watchlistData?.map((movie) => (
            <Col key={movie.id}>
              <Card className="h-100 border-0 shadow-sm rounded-3 overflow-hidden movie-card">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/placeholder.jpg"
                    }
                    alt={movie.title}
                    style={{ height: "350px", objectFit: "cover" }}
                    className="movie-poster"
                  />
                  {movie.vote_average && (
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-primary d-flex align-items-center p-2 rounded-pill">
                        <small className="me-1">⭐</small>
                        <strong>
                          {movie.vote_average > 5
                            ? 5
                            : movie.vote_average.toFixed(1)}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title
                    className="text-truncate fw-bold mb-1"
                    title={movie.title}
                  >
                    {movie.title}
                  </Card.Title>

                  <div className="mb-2">
                    <small className="text-muted">
                      {movie.release_date &&
                        new Date(movie.release_date).getFullYear()}
                    </small>
                  </div>

                  <div className="mb-3">
                    {movie.genres &&
                      movie.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="badge bg-light text-dark me-1 mb-1"
                        >
                          {genre}
                        </span>
                      ))}
                  </div>

                  <div className="mt-auto d-grid gap-2">
                    <Link to={`/movie/${movie.id}`} className="btn btn-primary">
                      View Details
                    </Link>
                    <button
                      onClick={() => removeWatchList(movie.id)}
                      className="btn btn-outline-danger"
                    >
                      Remove from Watchlist
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}
