const GOOGLE_API_KEY = "AIzaSyDfz3QhwrVXMrauKbV9CdAPoA9uLC-JNXo";

// Function to format the Gemini response
function formatGeminiResponse(text) {
    // Remove markdown-style formatting
    text = text
        .replace(/\*\*/g, '')  // Remove bold markers
        .replace(/\*/g, '')    // Remove italic markers
        .replace(/#{1,6}\s/g, '')  // Remove header markers
        
        // Convert bullet points to proper HTML list items
        .split('\n')
        .map(line => {
            line = line.trim();
            if (line.startsWith('•') || line.startsWith('-')) {
                return `<li>${line.substring(1).trim()}</li>`;
            }
            // If it's a numbered line (e.g., "1. University Name")
            if (/^\d+\./.test(line)) {
                return `<li>${line}</li>`;
            }
            return line;
        })
        .join('\n');

    // Wrap lists in ul tags
    if (text.includes('<li>')) {
        text = `<ul>${text}</ul>`;
    }

    return text;
}

// Function to search universities by country
async function searchUniversities() {
    const country = document.getElementById("countryInput").value;
    const universitiesDiv = document.getElementById("universities");

    if (!country) {
        alert("Please enter a country name.");
        return;
    }

    universitiesDiv.innerHTML = "<p>Searching universities...</p>";

    try {
        // Get top universities with QS rankings from Gemini
        const topUnisResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `List the top 5 universities in ${country} with their current QS World University Rankings positions (2024). Format as: "1. University Name (QS Rank: #X)". If QS rank isn't available, mention "QS Rank: Not Ranked". Only provide the list, no additional text.`
                        }]
                    }]
                })
            }
        );

        const topUnisData = await topUnisResponse.json();
        const topUnisList = formatGeminiResponse(topUnisData.candidates[0].content.parts[0].text);

        // Fetch universities from Hipolabs API
        const response = await fetch(`https://universities.hipolabs.com/search?country=${country}`);
        const universities = await response.json();

        if (universities.length === 0) {
            universitiesDiv.innerHTML = "<p>No universities found.</p>";
            return;
        }

        // Display results
        universitiesDiv.innerHTML = `
            <div class="country-header">
                <h2>Universities in ${country}</h2>
                <div class="top-unis">
                    <h3>Top Universities (with QS World Rankings):</h3>
                    <div class="rankings-list">
                        ${topUnisList}
                    </div>
                </div>
            </div>
            <div class="all-unis">
                <h3>Available Universities:</h3>
            </div>
        `;

        const allUnisDiv = universitiesDiv.querySelector('.all-unis');
        
        universities.slice(0, 5).forEach(async (uni) => {
            const uniCard = document.createElement("div");
            uniCard.className = "uni-card";
            
            // Get QS ranking and details for each university
            const detailsResponse = await fetch(
                `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `What is the QS World University Ranking 2024 position for ${uni.name}? Respond with just the number. If not ranked, respond with "Not Ranked".`
                            }]
                        }]
                    })
                }
            );
            
            const detailsData = await detailsResponse.json();
            const qsRank = detailsData.candidates[0].content.parts[0].text.trim();
            
            uniCard.innerHTML = `
                <h3>${uni.name}</h3>
                <p><b>QS Ranking:</b> ${qsRank}</p>
                <p><b>Website:</b> <a href="${uni.web_pages[0]}" target="_blank">${uni.web_pages[0]}</a></p>
            `;
            
            allUnisDiv.appendChild(uniCard);
        });

    } catch (error) {
        universitiesDiv.innerHTML = '<p class="error">Error fetching universities. Please try again later.</p>';
        console.error("Error fetching universities:", error);
    }
}

// Function to search university details using Gemini API
async function searchUniversityDetails() {
    const university = document.getElementById("uniInput").value;
    const detailsDiv = document.getElementById("universityDetails");

    if (!university) {
        alert("Please enter a university name.");
        return;
    }

    detailsDiv.innerHTML = "<p>Fetching university details...</p>";

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Provide the following information for ${university}:
                            1. QS World University Ranking 2024 (if available)
                            2. Key facts
                            3. Notable programs
                            Use simple bullet points and avoid special formatting.`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (data && data.candidates && data.candidates[0].content.parts) {
            const detailedInfo = formatGeminiResponse(data.candidates[0].content.parts[0].text);
            detailsDiv.innerHTML = `
                <h2>${university}</h2>
                <div class="detailed-info">
                    ${detailedInfo}
                </div>
            `;
        } else {
            detailsDiv.innerHTML = "<p class='error'>Details unavailable.</p>";
        }
    } catch (error) {
        detailsDiv.innerHTML = "<p class='error'>Error fetching university details.</p>";
        console.error("Error fetching university details:", error);
    }
}

// Add styles
const styles = `
    .country-header {
        margin-bottom: 30px;
    }
    .top-unis {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin: 20px 0;
    }
    .rankings-list {
        font-size: 16px;
        line-height: 1.6;
    }
    .rankings-list ul {
        margin: 0;
        padding-left: 20px;
    }
    .rankings-list li {
        margin: 8px 0;
    }
    .uni-card {
        border: 1px solid #ddd;
        margin: 10px 0;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .detailed-info {
        margin-top: 10px;
        padding: 15px;
        background: #f9f9f9;
        border-radius: 6px;
    }
    .detailed-info ul {
        margin: 10px 0;
        padding-left: 20px;
    }
    .detailed-info li {
        margin: 8px 0;
        line-height: 1.4;
    }
    .error {
        color: red;
        font-style: italic;
    }
`;
