// CONFIGURATION
const API_KEY = 'COLE_AQUI_SUA_CHAVE_DO_GOOGLE_CLOUD'; 
const CHANNEL_ID = 'UC6Gz-13t_v7iP23K7fA2S5A'; 
const AD_INTERVAL = 4; // Show AD every 4 videos

let nextPageToken = '';
const videoFeed = document.getElementById('mainVideoFeed');
const loadMoreBtn = document.getElementById('btnLoadMore');

async function fetchYouTubeData(token = '') {
    const url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=12&type=video&pageToken=${token}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (token === '') videoFeed.innerHTML = ''; // Clear skeleton

        if (data.items) {
            renderVideos(data.items);
            nextPageToken = data.nextPageToken || '';
            loadMoreBtn.style.display = nextPageToken ? 'flex' : 'none';
        }
    } catch (error) {
        console.error("API Error:", error);
        videoFeed.innerHTML = `<p style="text-align:center; grid-column:1/-1">Connection Error. Please check your API Key.</p>`;
    }
}

function renderVideos(videos) {
    videos.forEach((video, index) => {
        const card = document.createElement('div');
        card.className = 'video-card';
        
        const date = new Date(video.snippet.publishedAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });

        card.innerHTML = `
            <div class="thumb-wrapper">
                <img src="${video.snippet.thumbnails.high.url}" alt="Thumbnail">
            </div>
            <div class="video-info">
                <h4 class="video-title">${video.snippet.title}</h4>
                <div class="video-meta">
                    <span>Ethereal Audio</span>
                    <span>${date}</span>
                </div>
            </div>
        `;

        card.onclick = () => window.open(`https://www.youtube.com/watch?v=${video.id.videoId}`, '_blank');
        videoFeed.appendChild(card);

        // Simple Staggered Animation
        setTimeout(() => card.classList.add('reveal'), index * 100);

        // Insert AD Card
        if ((videoFeed.children.length) % (AD_INTERVAL + 1) === AD_INTERVAL) {
            const adCard = document.createElement('div');
            adCard.className = 'ad-card reveal';
            adCard.innerHTML = `
                <small style="color:var(--accent)">SPONSORED CONTENT</small>
                <h4 style="margin:10px 0; color:white">Your Ad Here</h4>
                <p>Monetize your global traffic with professional ad placements.</p>
            `;
            videoFeed.appendChild(adCard);
        }
    });
}

loadMoreBtn.addEventListener('click', () => fetchYouTubeData(nextPageToken));

// Initial Load
document.addEventListener('DOMContentLoaded', () => fetchYouTubeData());
