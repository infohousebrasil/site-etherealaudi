// --- CONFIGURAÇÃO ---
const API_KEY = 'COLE_AQUI_SUA_CHAVE_DO_GOOGLE_CLOUD'; 
const CHANNEL_ID = 'UC6Gz-13t_v7iP23K7fA2S5A'; // ID do canal @EtherealAudio
const INITIAL_MAX_RESULTS = 12; // Quantos vídeos carregar inicialmente
const LOAD_MORE_RESULTS = 8;    // Quantos vídeos carregar ao clicar em "Carregar Mais"
const AD_FREQUENCY = 4;         // Inserir um anúncio a cada X vídeos

let nextPageToken = null; // Usado para paginar os resultados
let currentVideoCount = 0; // Contador de vídeos já exibidos

const videoFeed = document.getElementById('videoFeed');
const loadMoreButton = document.getElementById('loadMoreButton');

async function fetchVideos(maxResults, pageToken = null) {
    const loadingMessage = document.querySelector('.loading-message');
    if (loadingMessage) {
        loadingMessage.textContent = 'Carregando vídeos...';
        loadingMessage.style.display = 'block';
    }
    if (loadMoreButton) loadMoreButton.style.display = 'none'; // Esconde o botão enquanto carrega

    let url = `https://www.googleapis.com/youtube/v3/search?key=${API_KEY}&channelId=${CHANNEL_ID}&part=snippet,id&order=date&maxResults=${maxResults}&type=video`;
    if (pageToken) {
        url += `&pageToken=${pageToken}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (loadingMessage) loadingMessage.style.display = 'none';

        if (data.error) {
            videoFeed.innerHTML = `<p class="loading-message error-message">Erro ao carregar vídeos: ${data.error.message}. Verifique sua API Key.</p>`;
            return;
        }

        if (data.items && data.items.length > 0) {
            data.items.forEach((item, index) => {
                const videoId = item.id.videoId;
                const snippet = item.snippet;

                // Cria e adiciona o card do vídeo
                const card = document.createElement('div');
                card.className = 'video-card';
                card.onclick = () => window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
                
                card.innerHTML = `
                    <div class="thumbnail-wrapper">
                        <img src="${snippet.thumbnails.high.url}" alt="${snippet.title}">
                    </div>
                    <div class="video-info">
                        <h2 class="video-title">${snippet.title}</h2>
                        <p class="video-meta">Publicado em: ${new Date(snippet.publishedAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                `;
                videoFeed.appendChild(card);

                // Aplica a animação de fade-in com um pequeno atraso
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100); // Atraso de 100ms para cada card

                currentVideoCount++;

                // Lógica para Inserir Anúncio
                // Se o vídeo atual for um múltiplo da frequência de anúncios E não for o último item retornado pela API
                if (currentVideoCount % AD_FREQUENCY === 0) {
                    const adDiv = document.createElement('div');
                    adDiv.className = 'ad-space';
                    adDiv.innerHTML = `
                        <strong>Publicidade</strong>
                        <p>Seu anúncio do Google AdSense ou de parceiro aparecerá aqui.</p>
                        `;
                    videoFeed.appendChild(adDiv);
                }
            });

            // Atualiza o token para a próxima página, se houver
            nextPageToken = data.nextPageToken || null;
            if (nextPageToken && loadMoreButton) {
                loadMoreButton.style.display = 'block';
            } else if (loadMoreButton) {
                loadMoreButton.style.display = 'none'; // Esconde se não houver mais vídeos
            }

        } else {
            videoFeed.innerHTML = '<p class="loading-message">Nenhum vídeo encontrado ou todos os vídeos já foram carregados.</p>';
        }

    } catch (error) {
        console.error('Erro ao buscar vídeos:', error);
        if (loadingMessage) {
            loadingMessage.innerHTML = '<p class="loading-message error-message">Erro ao conectar com o YouTube. Verifique sua conexão ou API Key.</p>';
        }
    }
}

// Evento para o botão "Carregar Mais"
loadMoreButton.addEventListener('click', () => {
    fetchVideos(LOAD_MORE_RESULTS, nextPageToken);
});

// Carrega os vídeos iniciais ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    fetchVideos(INITIAL_MAX_RESULTS);
});
