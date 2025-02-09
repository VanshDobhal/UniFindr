// Fetch universities by country
function fetchUniversities() {
    const country = document.getElementById("countryInput").value;
    if (!country) {
        alert("Please enter a country name.");
        return;
    }

    fetch(`http://universities.hipolabs.com/search?country=${country}`)
        .then(response => response.json())
        .then(data => {
            const universitiesDiv = document.getElementById("universities");
            universitiesDiv.innerHTML = "<h2>Universities in " + country + ":</h2>";

            if (data.length === 0) {
                universitiesDiv.innerHTML += "<p>No universities found.</p>";
                return;
            }

            universitiesDiv.innerHTML += data.map(uni => `
                <div class="uni-card">
                    <h3>${uni.name}</h3>
                    <p><b>Website:</b> <a href="${uni.web_pages[0]}" target="_blank">${uni.web_pages[0]}</a></p>
                </div>
            `).join("");
        })
        .catch(error => console.error("Error fetching universities:", error));
}

const GOOGLE_API_KEY = "AIzaSyCujhH6FkCsLuv8CEvIqnkyNGWwZ2h0i_0"; // Your Gemini API Key

async function fetchUniversityDetails() {
    const university = document.getElementById("uniInput").value.trim();
    if (!university) {
        alert("Please enter a university name.");
        return;
    }

    const universityDiv = document.getElementById("universityDetails");
    universityDiv.innerHTML = "<p>Fetching details...</p>";

    try {
        // 🔹 Fetch data from Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Summarize ${university} concisely, including location, ranking, strong programs, admission process, and tuition.` }] }]
            })
        });

        const data = await response.json();
        console.log("API Response:", data);  // ✅ Debugging: Check full response in console

        // 🔹 Extract and clean response
        if (data && data.candidates && data.candidates.length > 0) {
            let rawText = data.candidates[0].content.parts[0].text || "No information available.";

            // 🔹 Format text properly
            rawText = rawText
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")  // Convert bold text (**text**) to HTML <strong>
                .replace(/\*(.*?)\*/g, "<li>$1</li>")  // Convert bullet points (*text*) to <li>
                .replace(/\n\n/g, "</ul><ul>")  // Convert double new lines into separate lists
                .replace(/\n/g, "<br>");  // Convert single new lines to <br>

            universityDiv.innerHTML = `<h2>Details for ${university}</h2><ul>${rawText}</ul>`;
        } else {
            universityDiv.innerHTML = "<p style='color: red;'>No university details found.</p>";
        }

    } catch (error) {
        console.error("Error fetching university details:", error);
        universityDiv.innerHTML = "<p style='color: red;'>Failed to fetch university details.</p>";
    }
}
