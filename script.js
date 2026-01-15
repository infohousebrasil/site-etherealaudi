// CONFIGURATION
const API_KEY = 'AIzaSyCXk2NyD_ZgUqwbQ56kDSdWYVVSLd0jm1g'; 
const CHANNEL_ID = 'UCPckS5aNzwmhTpm9dibgL3A'; 
const AD_INTERVAL = 4; // Show AD every 4 videos

let nextPageToken = '';
const videoFeed = document.getElementById('mainVideoFeed');
const loadMoreBtn = document.getElementById('btnLoadMore');
//novo codigo
async function fetchYouTubeData(token = '') {
    // Montamos a URL base primeiro
    let url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=12&type=video`;

    // SÓ adicionamos o pageToken se ele realmente existir (não estiver vazio)
    if (token) {
        url += `&pageToken=${token}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Se o Google devolver um erro, ele aparecerá aqui no console
        if (data.error) {
            console.error("Erro da API do Google:", data.error);
            videoFeed.innerHTML = `<p style="text-align:center; grid-column:1/-1">API Error: ${data.error.message}</p>`;
            return;
        }

        if (token === '') videoFeed.innerHTML = ''; 

        if (data.items) {
            renderVideos(data.items);
            nextPageToken = data.nextPageToken || '';
            loadMoreBtn.style.display = nextPageToken ? 'flex' : 'none';
        }
    } catch (error) {
        console.error("Erro de conexão:", error);
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
