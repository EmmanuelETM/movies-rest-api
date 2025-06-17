const express = require("express");
const cors = require("cors");
const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");
const app = express();

app.disable("x-powered-by");
app.use(express.json());
app.use(
  cors({
    methods: "GET, POST, PATCH, DELETE, OPTIONS, HEADER",
    origin: (origin, callback) => {
      const ALLOWED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:1234",
        "https://movies.com",
      ];

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not Allowed by CORS"));
    },
  })
);

`
Middleware CORS
DELETE
`;

app.get("/movies", (req, res) => {
  const { genre } = req.query;

  if (genre) {
    const filterdMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );

    return res.json(filterdMovies);
  }

  return res.json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  const movie = movies[movieIndex];

  return res.json(movie);
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    return res
      .status(400)
      .json({ message: JSON.stringify(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  movies.push(newMovie);

  return res.json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);

  if (result.error) {
    return res.status(400).json({ message: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updatedMovie;

  return res.json(updatedMovie);
});

app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie not found" });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: "Movie deleted" });
});

app.use((_, res) => {
  return res.status(404).json({ message: "Not Found" });
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
