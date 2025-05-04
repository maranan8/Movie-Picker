// Declare variables
let genre;
let movies = [];
let currentIndex;
let currentChampion;


// Set genre and navigate to the next page
function setGenre(input) {
	genre = input;
	nextPage();
}

// Navigate to the next page with the selected genre
function nextPage() {
	window.location.href = `movie.html?genre=${genre}`;
}

// On page load, handle either the winner page or the movie discovery page
window.onload = function() {
  	if (window.location.pathname.includes('winner.html')) {
    	const winnerData = JSON.parse(localStorage.getItem('winner'));
    		if (winnerData) {
        		const moviePoster = document.getElementById('moviePoster');
        		const movieDescrip = document.getElementById('movieDescrip');

        		moviePoster.src = `https://image.tmdb.org/t/p/w500${winnerData.poster}`;
        		movieDescrip.innerHTML = winnerData.overview;
    		}
		else {
		console.log('No winner data found.');
		}
  	} 
	else {
    		const urlParams = new URLSearchParams(window.location.search);
    		const queryGenre = urlParams.get('genre');
    		if (queryGenre) {
      	console.log('Retrieved genre:', queryGenre);
      	fetchData(queryGenre);
    		} 
		else {
     		console.log('No genre found.');
    		}
  	}
};

// Fetch movie data for the selected genre from the backend
function fetchData(input) {
	const options = {
    		method: 'GET',
    		headers: {
			accept: 'application/json',
    		},
	};

  	// Make a request to the backend API (localhost:3000/movies)
	fetch(`http://localhost:3000/movies?genre=${input}`, options)
    	.then(res => res.json())
    	.then(data => {
     if (data.results && data.results.length > 0) {
     	console.log('API Response:', data);
        	movies = randomizeArr(data.results).slice(0, 8);
		currentIndex = 1;
		currentChampion = movies[0];
		console.log(movies);
		console.log(movies.length);
        	display();
     }
	else {
     	console.error('No movies found for genre:', input);
     }
    	})
    	.catch(err => {
		console.error('Error fetching data:', err);
    	});
}

// Display the two movies
function display() {
  	const leftMovie = document.getElementById('leftMovie');
  	const leftDescrip = document.getElementById("leftText");
  	const leftButton = document.getElementById("leftButton");

  	const rightMovie = document.getElementById('rightMovie');
  	const rightDescrip = document.getElementById("rightText");
  	const rightButton = document.getElementById("rightButton");

  	if (currentIndex > movies.length - 1) {
    		revealWinner(currentChampion);
    		return;
  	}

  	const challenger = movies[currentIndex];

	leftMovie.src = `https://image.tmdb.org/t/p/w500${currentChampion.poster_path}`;
  	leftDescrip.innerHTML = limitDescription(currentChampion.overview, 75);
  	leftButton.onclick = () => selectWinner(currentChampion);

  	rightMovie.src = `https://image.tmdb.org/t/p/w500${challenger.poster_path}`;
  	rightDescrip.innerHTML = limitDescription(challenger.overview, 75);
  	rightButton.onclick = () => selectWinner(challenger);
}

// Select the winner and increment index
function selectWinner(winner) {
  	currentChampion = winner;
  	currentIndex++;
  	display();
}

// Randomize the array of movies
function randomizeArr(arr) {
	for (let i = arr.length - 1; i > 0; i--) {
    	const j = Math.floor(Math.random() * (i + 1));
    	[arr[i], arr[j]] = [arr[j], arr[i]];
  	}
  	return arr;
}

// Limit description length
function limitDescription(input, wordLimit) {
  	const words = input.split(" ");
 	if (words.length > wordLimit) {
    		const limitedWords = words.slice(0, wordLimit);
    		return limitedWords.join(' ') + '...';
  	}

  return input;
}

// Store the winner and navigate to the winner page
function revealWinner(winnerObject) {
  	const winnerData = {
     	poster: winnerObject.poster_path,
      	overview: winnerObject.overview
  	};
  	localStorage.setItem('winner', JSON.stringify(winnerData));
  	window.location.href = `winner.html`;
}