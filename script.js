<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>University Finder</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>

    <h1>🎓 University Finder</h1>

    <!-- Search universities by country -->
    <div class="search-container">
        <input type="text" id="countryInput" placeholder="Enter country name...">
        <button onclick="searchUniversities()">Search Universities</button>
    </div>

    <div id="universities"></div>

    <!-- Search university details -->
    <div class="search-container">
        <input type="text" id="uniInput" placeholder="Enter university name...">
        <button onclick="searchUniversityDetails()">Search University Details</button>
    </div>

    <div id="universityDetails"></div>

    <script src="script.js"></script>

</body>
</html>
