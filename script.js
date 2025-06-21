document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const primeOnlyCheckbox = document.getElementById('primeOnly');
    const searchButton = document.getElementById('searchButton');
    const resultsDiv = document.getElementById('results');
    const messageDiv = document.getElementById('message');

    // !!! IMPORTANT: UPDATE THIS URL AFTER DEPLOYING YOUR BACKEND !!!
    // During local development, this should point to your local Flask backend.
    // Once deployed, this must point to your live Render backend URL.
    const BACKEND_URL = 'https://amazon-fba-api-ankit.onrender.com'; // Default for local development

    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        const primeOnly = primeOnlyCheckbox.checked;

        if (!query) {
            messageDiv.textContent = "Please enter a search query.";
            resultsDiv.innerHTML = ''; // Clear any previous results
            return;
        }

        messageDiv.textContent = "Searching...";
        resultsDiv.innerHTML = ''; // Clear previous results

        try {
            // Make a POST request to your backend's search API
            const response = await fetch(`${BACKEND_URL}/api/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ keywords: query, primeOnly: primeOnly })
            });

            // Check if the HTTP response itself was successful (2xx status)
            if (!response.ok) {
                // Attempt to parse a specific error message from the backend's JSON response
                const errorData = await response.json().catch(() => ({ error: 'Unknown server error.' }));
                throw new Error(`HTTP error! Status: ${response.status}. ${errorData.error || response.statusText}`);
            }

            const data = await response.json(); // Parse the JSON data from your backend

            // Check if items were returned
            if (data.Items && data.Items.length > 0) {
                messageDiv.textContent = `Found ${data.TotalFilteredCount} matching products (showing up to 10).`;
                data.Items.forEach(item => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';

                    // Safely extract data, providing fallbacks for missing information
                    const title = item.ItemInfo?.Title?.DisplayValue || 'No Title Available';
                    const imageUrl = item.Images?.Primary?.Medium?.URL || 'https://via.placeholder.com/150?text=No+Image'; // Placeholder if no image
                    const price = item.Offers?.Listings?.[0]?.Price?.DisplayAmount || 'Price Not Available';
                    const isPrime = item.Offers?.Listings?.[0]?.IsPrimeEligible ? 'Yes' : 'No';
                    const detailPageURL = item.DetailPageURL || '#'; // Link to Amazon product page

                    // Populate the product card HTML
                    productCard.innerHTML = `
                        <img src="${imageUrl}" alt="${title}">
                        <h3>${title}</h3>
                        <p>Price: ${price}</p>
                        <p>Prime Eligible: <strong>${isPrime}</strong></p>
                        <a href="${detailPageURL}" target="_blank" rel="noopener noreferrer">View on Amazon</a>
                    `;
                    resultsDiv.appendChild(productCard); // Add card to results display area
                });
            } else {
                messageDiv.textContent = "No products found matching your criteria.";
            }

        } catch (error) {
            // Handle any errors that occurred during the fetch operation
            console.error('Error fetching products:', error);
            messageDiv.textContent = `Error: ${error.message}. Please try again. Check your browser console and backend logs for more details.`;
        }
    });
});