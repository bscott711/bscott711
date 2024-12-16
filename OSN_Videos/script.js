const videoContainer = document.getElementById("videoGrid");
const yearDropdown = document.getElementById("yearDropdown");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

let videos = [];
let filteredVideos = [];
let currentPage = 0;
const videosPerPage = 2;

// Load mip_names.txt
fetch("mip_names.txt")
    .then((response) => response.text())
    .then((text) => {
        // Parse file and populate videos array
        videos = text
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .map((line) => {
                const year = line.substring(0, 4); // Extract year from filename
                const humanReadableName = line
                    .replace(/_/g, " ") // Replace underscores with spaces
                    .replace(/-/g, " ") // Replace dashes with spaces
                    .replace(/\.webm$/, ""); // Remove the file extension
                return { path: line.trim(), year, name: humanReadableName };
            });

        // Populate the year dropdown with unique years
        const years = Array.from(new Set(videos.map((video) => video.year)));
        years.sort().forEach((year) => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearDropdown.appendChild(option);
        });

        // Add "all" option for no filtering
        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "All Years";
        allOption.selected = true;
        yearDropdown.prepend(allOption);

        // Initialize display
        filteredVideos = [...videos];
        updatePagination();
        displayVideos();
    });

// Handle year filtering
yearDropdown.addEventListener("change", () => {
    const selectedYear = yearDropdown.value;

    // Filter videos based on the selected year
    filteredVideos = selectedYear === "all" ? videos : videos.filter((video) => video.year === selectedYear);

    // Reset to the first page
    currentPage = 0;

    // Update the display
    updatePagination();
    displayVideos();
});

// Display videos for the current page
function displayVideos() {
    videoContainer.innerHTML = ""; // Clear existing videos

    const start = currentPage * videosPerPage;
    const end = Math.min(start + videosPerPage, filteredVideos.length);

    const currentVideos = filteredVideos.slice(start, end);

    currentVideos.forEach((video) => {
        const videoItem = document.createElement("div");
        videoItem.className = "video-item";

        // Add filename above the video
        const videoTitle = document.createElement("p");
        videoTitle.textContent = video.name;
        videoTitle.className = "video-title";

        // Add video element
        const videoElement = document.createElement("video");
        videoElement.width = 640;
        videoElement.height = 360;
        videoElement.controls = true;
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true;

        const sourceElement = document.createElement("source");
        sourceElement.src = video.path;
        sourceElement.type = "video/webm";
        videoElement.appendChild(sourceElement);

        videoItem.appendChild(videoTitle);
        videoItem.appendChild(videoElement);
        videoContainer.appendChild(videoItem);
    });
}

// Update pagination buttons
function updatePagination() {
    prevPage.disabled = currentPage === 0;
    nextPage.disabled = currentPage >= Math.ceil(filteredVideos.length / videosPerPage) - 1;
}

// Pagination button events
prevPage.addEventListener("click", () => {
    if (currentPage > 0) {
        currentPage--;
        displayVideos();
        updatePagination();
    }
});

nextPage.addEventListener("click", () => {
    if (currentPage < Math.ceil(filteredVideos.length / videosPerPage) - 1) {
        currentPage++;
        displayVideos();
        updatePagination();
    }
});
