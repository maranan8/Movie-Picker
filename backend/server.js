require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Add this validation check right after loading env
if (!process.env.API_KEY) {
  console.error('FATAL ERROR: API_KEY is not defined in .env file');
  process.exit(1); // Exit the process if API key is missing
}

// Enhanced CORS configuration
const corsOptions = {
  origin: ['http://127.0.0.1:5500', 'http://localhost:5500'], // Add all allowed origins
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());


// Enhanced movie endpoint with more parameters
app.get('/movies', async (req, res) => {
  try {
    const { genre, page = 1, language = 'en-US', sort_by = 'popularity.desc' } = req.query;
    
    if (!genre) {
      return res.status(400).json({ 
        error: 'Genre is required',
        example: '/movies?genre=28&page=2&language=en-US'
      });
    }

    // Validate numeric parameters
    if (isNaN(page) || isNaN(genre)) {
      return res.status(400).json({ error: 'Genre and page must be numbers' });
    }

    // Construct API URL with multiple parameters
    const url = new URL('https://api.themoviedb.org/3/discover/movie');
    const params = {
      include_adult: false,
      include_video: false,
      language,
      page,
      sort_by,
      with_genres: genre,
      api_key: process.env.API_KEY
    };
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // Fetch from TMDB
    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('TMDB API Error:', error);
      return res.status(response.status).json({ 
        error: 'Error from TMDB API',
        details: error 
      });
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return res.status(404).json({ 
        error: 'No movies found',
        params: params 
      });
    }

    // You can transform the data here before sending to frontend
    const simplifiedData = {
      page: data.page,
      total_pages: data.total_pages,
      results: data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: movie.vote_average
      }))
    };

    res.json(simplifiedData);

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Movies endpoint: http://localhost:${PORT}/movies?genre=28`);
});