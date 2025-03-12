import { useState, useEffect } from "react";
import {
  Form,
  Row,
  Col,
  Card,
  Spinner,
  Badge,
  Container,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Search() {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wathcListIds, setWatchlistIds] = useState([]);
  const [userId, setUserId] = useState([]);

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
          setWatchlistIds(currentUserWatchList);
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
      let userIdVal = JSON.parse(localStorage.getItem("user"))
        ? JSON.parse(localStorage.getItem("user")).id
        : null;
      setUserId(userIdVal);

      let fetchUri =
        query.length < 1
          ? "movie/upcoming?language=en-US&page=1"
          : `search/movie?query=${query}&include_adult=false&language=en-US&page=1`;

      if (userIdVal !== null) {
        let watchlistMapId = [];
        const userWatchList = localStorage.getItem(
          `user_watchList_${userIdVal}` 
        );

        fetch(`https://api.themoviedb.org/3/${fetchUri}`, options)
          .then((res) => res.json())
          .then(async (resMovies) => {
            if (userWatchList) {
              const currentUserWatchList = JSON.parse(userWatchList);
              currentUserWatchList.forEach((watchList) => {
             
                if (watchList.userid === userIdVal) {
                  watchlistMapId.push(watchList.id);
                }
              });
              setWatchlistIds(watchlistMapId);
            }
            if (resMovies.results.length > 0) {
              await getMovieGenre(options, resMovies || []);
            } else {
              setMovies([]);
            }
          })
          .catch((err) => console.error(err));
      } else {
        fetch(`https://api.themoviedb.org/3/${fetchUri}`, options)
          .then((res) => res.json())
          .then(async (res) => {
            if (res.results.length > 0) {
              await getMovieGenre(options, res || []);
            } else {
              setMovies([]);
            }
          })
          .catch((err) => console.error(err));
      }
    } catch (err) {
      console.error("Search error:", err);
      setMovies([]);
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
        .then(async (resGenre) => {
      
          await moviesList.results.map((movie) => {
            let genresMovie = [];
            movie.genre_ids.map((genreId) => {
              resGenre.genres.map((genreItem) => {
                if (genreItem.id === genreId) {
                  genresMovie.push(genreItem.name);
                }
              });
            });
            movie.genres = genresMovie;
            setMovies(moviesList.results || []);
          });
        })
        .catch((err) => console.error(err));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(searchMovies, 500);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <Container fluid>
      <div className="py-5 px-4">
        <div className="mb-5 max-width-800 mx-auto">
          <h1 className="display-5 text-center mb-4">Movie Explorer</h1>
          <Form className="mb-4 shadow-sm" onSubmit={(e) => e.preventDefault()}>
            <div className="position-relative">
              <Form.Control
                size="lg"
                type="search"
                placeholder="Search for movies..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                className="py-3 ps-4 border-1 rounded-3"
                style={{ paddingRight: "3rem" }}
              />
              <div className="position-absolute top-50 end-0 translate-middle-y pe-4">
                <i className="bi bi-search text-muted fs-5"></i>
              </div>
            </div>
          </Form>

          {query.length > 0 && (
            <div className="text-center mb-4">
              <p className="text-muted">
                {loading
                  ? "Searching..."
                  : movies.length > 0
                  ? `Showing results for "${query}"`
                  : query.length >= 3
                  ? ``
                  : ""}
              </p>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <p className="text-muted">Searching for movies...</p>
          </div>
        )}

        {!loading && movies.length === 0 && query.length >= 3 && (
          <div className="text-center py-5 bg-light rounded-3 mb-4">
            <div className="p-5">
              <i className="bi bi-film fs-1 text-muted mb-3 d-block"></i>
              <h3>No movies found</h3>
              <p className="text-muted">
                We couldn't find any movies matching "{query}". Try a different
                search term.
              </p>
            </div>
          </div>
        )}

        <Row xs={1} sm={2} md={3} lg={4} xl={5} className="g-4">
          {movies?.map((movie) => (
            <Col key={movie.id}>
              <Card className="h-100 border-0 shadow-sm movie-card transition-all">
                <div className="position-relative">
                  <Card.Img
                    variant="top"
                    src={
                      movie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                        : "/placeholder.jpg"
                    }
                    style={{ height: "320px", objectFit: "cover" }}
                    className="rounded-top"
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
                <Card.Body className="d-flex flex-column p-3">
                  <Card.Title className="fw-bold mb-2">
                    {movie.title}
                  </Card.Title>

                  <div className="mb-2">
                    {movie.release_date && (
                      <small className="text-muted me-2">
                        <i className="bi bi-calendar-event me-1"></i>
                        {new Date(movie.release_date).getFullYear()}
                      </small>
                    )}
                  </div>

                  <div className="mb-3 mt-1">
                    {movie.genres &&
                      movie.genres.slice(0, 3).map((genre, index) => (
                        <Badge
                          key={index}
                          bg="light"
                          text="dark"
                          className="me-1 mb-1 py-1 px-2"
                        >
                          {genre}
                        </Badge>
                      ))}
                  </div>

                  <div className="mt-auto d-grid gap-2">
                    <Link
                      to={`/movie/${movie.id}`}
                      className="btn btn-primary py-2 fw-semibold"
                    >
                      <i className="bi bi-info-circle me-2"></i>View Details
                    </Link>

                    {userId && (
                      <button
                        onClick={() =>
                          sendWatchlist(
                            movie.id,
                            wathcListIds.includes(movie.id)
                          )
                        }
                        className={
                          wathcListIds.includes(movie.id)
                            ? "btn btn-outline-danger"
                            : "btn btn-outline-primary py-2 fw-semibold"
                        }
                      >
                        {wathcListIds.includes(movie.id) ? (
                          <>
                            <i className="bi bi-bookmark-check-fill me-2"></i>
                            Remove Watchlist
                          </>
                        ) : (
                          <>
                            <i className="bi bi-bookmark-plus me-2"></i>
                            Add to Watchlist
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {!loading && movies.length > 0 && (
          <div className="text-center mt-5">
            <p className="text-muted">Showing {movies.length} movies</p>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .movie-card {
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .movie-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
        .max-width-800 {
          max-width: 800px;
        }
        .transition-all {
          transition: all 0.3s ease;
        }
      `}</style>
    </Container>
  );
}
