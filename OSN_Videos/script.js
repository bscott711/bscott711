const videoContainer = document.querySelector('.video-flex-container');
const paginationContainer = document.getElementById('pagination');
const yearFilter = document.getElementById('yearFilter');
const videosPerPage = 3;
let videos = []; // All videos from mip_names.txt
let filteredVideos = []; // Videos filtered by the dropdown
let currentPage = 1;

// Fetch videos from mip_names.txt
fetch('mip_names.txt')
    .then(response => response.text())
    .then(data => {
        videos = data.split('\n').filter(line => line.trim() !== '').map(line => {
            const year = line.split('-')[0]; // Extract the year from the filename
            return { path: line, label: line, year };
        });

        // Populate the dropdown with unique years
        populateYearDropdown();

        // Show all videos initially
        filteredVideos = videos;
        renderVideos();
        renderPagination();
    })
    .catch(error => console.error('Error fetching video list:', error));

// Populate the year dropdown with unique years
function populateYearDropdown() {
    const uniqueYears = [...new Set(videos.map(video => video.year))]; // Get unique years
    uniqueYears.sort(); // Sort years
    uniqueYears.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });
}

// Filter videos based on the selected year
yearFilter.addEventListener('change', () => {
    const selectedYear = yearFilter.value;

    // Filter videos based on the dropdown selection
    filteredVideos = selectedYear === 'all' ? videos : videos.filter(video => video.year === selectedYear);

    // Reset pagination and render videos
    currentPage = 1;
    renderVideos();
    renderPagination();
});

// Render videos for the current page
function renderVideos() {
    videoContainer.innerHTML = ''; // Clear current videos
    const startIndex = (currentPage - 1) * videosPerPage;
    const endIndex = startIndex + videosPerPage;
    const videosToDisplay = filteredVideos.slice(startIndex, endIndex);

    videosToDisplay.forEach(video => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item';

        const videoTitle = document.createElement('h2');
        videoTitle.textContent = video.label;
        videoItem.appendChild(videoTitle);

        const videoElement = document.createElement('video');
        videoElement.width = 640;
        videoElement.height = 480;
        videoElement.controls = true;
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.muted = true;

        const sourceElement = document.createElement('source');
        sourceElement.src = video.path;
        sourceElement.type = 'video/mp4';
        videoElement.appendChild(sourceElement);

        videoItem.appendChild(videoElement);
        videoContainer.appendChild(videoItem);
    });
}

// Render pagination controls
function renderPagination() {
    paginationContainer.innerHTML = ''; // Clear current pagination
    const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        currentPage--;
        renderVideos();
        renderPagination();
    });
    paginationContainer.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.className = i === currentPage ? 'active' : '';
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderVideos();
            renderPagination();
        });
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        currentPage++;
        renderVideos();
        renderPagination();
    });
    paginationContainer.appendChild(nextButton);
}
