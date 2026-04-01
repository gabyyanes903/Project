import { useState } from "react";
import "./App.css";

const API_KEY = import.meta.env.VITE_CAT_API_KEY;

function App() {
  const [currentResult, setCurrentResult] = useState(null);
  const [banList, setBanList] = useState([]);

  // Fetch a random cat with breed info
  const fetchRandomCat = async () => {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(
          "https://api.thecatapi.com/v1/images/search?has_breeds=1",
          {
            headers: {
              "x-api-key": API_KEY,
            },
          }
        );

        const data = await response.json();

        if (!data || data.length === 0) {
          attempts++;
          continue;
        }

        const cat = data[0];
        const breed = cat.breeds[0];

        const attributes = {
          breed: breed.name,
          origin: breed.origin,
          temperament: breed.temperament,
        };

        // Check if any attribute is banned
        const isBanned =
          banList.includes(attributes.breed) ||
          banList.includes(attributes.origin) ||
          banList.includes(attributes.temperament);

        if (isBanned) {
          attempts++;
          continue;
        }

        // Accept the cat
        const formattedResult = {
          imageUrl: cat.url,
          ...attributes,
        };

        setCurrentResult(formattedResult);
        return;

      } catch (error) {
        console.error("API error:", error);
        attempts++;
      }
    }

    alert("No available cats match your filters. Try removing some bans.");
  };

  const handleDiscoverClick = () => {
    fetchRandomCat();
  };

  // Add any attribute to ban list
  const handleAttributeClick = (value) => {
    if (!banList.includes(value)) {
      setBanList((prev) => [...prev, value]);
    }
  };

  // Remove from ban list
  const handleBanClick = (value) => {
    setBanList((prev) => prev.filter((item) => item !== value));
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Veni Vici 🐾</h1>
        <p>Click discover to meet a new cat, one at a time.</p>
      </header>

      <main className="app-main">
        <section className="result-section">
          <h2>Current Discovery</h2>

          {currentResult ? (
            <div className="result-card fade-in">
              <img
                className="result-image"
                src={currentResult.imageUrl}
                alt={currentResult.breed}
              />

              {/* Show banned badge if any attribute is banned */}
              {(banList.includes(currentResult.breed) ||
                banList.includes(currentResult.origin) ||
                banList.includes(currentResult.temperament)) && (
                <div className="banned-badge">BANNED</div>
              )}

              <div className="result-info">
                <p>
                  <strong>Breed:</strong>{" "}
                  <span
                    className="clickable"
                    onClick={() => handleAttributeClick(currentResult.breed)}
                  >
                    {currentResult.breed}
                  </span>
                </p>

                <p>
                  <strong>Origin:</strong>{" "}
                  <span
                    className="clickable"
                    onClick={() => handleAttributeClick(currentResult.origin)}
                  >
                    {currentResult.origin}
                  </span>
                </p>

                <p>
                  <strong>Temperament:</strong>{" "}
                  <span
                    className="clickable"
                    onClick={() =>
                      handleAttributeClick(currentResult.temperament)
                    }
                  >
                    {currentResult.temperament}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p>No cat yet. Click Discover to begin!</p>
          )}

          <button className="discover-button" onClick={handleDiscoverClick}>
            Discover
          </button>
        </section>

        <section className="banlist-section">
          <h2>Ban List</h2>

          {banList.length === 0 ? (
            <p>No banned attributes yet. Click any attribute to add it here.</p>
          ) : (
            <ul className="banlist">
              {banList.map((item, index) => (
                <li
                  key={index}
                  className="banlist-item clickable"
                  onClick={() => handleBanClick(item)}
                >
                  {item}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

