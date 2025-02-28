// At the top of the file, add an elements object to store DOM references
let elements = {};

// Configuration
const API_KEY = ''; // Remove API key for security
const API_URL = 'https://api.imagepig.com/xl'; // Using the XL endpoint for high quality
const HISTORY_KEY = 'archgen_history';

function initializeApp() {
    try {
        // Initialize elements object
        elements = {
            prompt: document.getElementById('prompt'),
            generateBtn: document.getElementById('generate'),
            imageCount: document.getElementById('imageCount'),
            loading: document.getElementById('loading'),
            results: document.getElementById('results'),
            showHistoryBtn: document.getElementById('showHistory'),
            restartBtn: document.getElementById('restart'),
            historyModal: document.getElementById('historyModal'),
            historyList: document.getElementById('historyList'),
            closeModalBtn: document.querySelector('.close-btn')
        };

        // Check if any element is null
        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                throw new Error(`Element "${name}" not found in the DOM`);
            }
        }

        // Only set up event listeners if all elements exist
        elements.generateBtn.addEventListener('click', generateImages);
        elements.showHistoryBtn.addEventListener('click', showHistory);
        elements.restartBtn.addEventListener('click', restart);
        elements.closeModalBtn.addEventListener('click', () => elements.historyModal.style.display = 'none');
        
        // Add modal close on outside click
        window.addEventListener('click', (e) => {
            if (e.target === elements.historyModal) {
                elements.historyModal.style.display = 'none';
            }
        });

        console.log('App initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error.message);
        alert('There was an error initializing the app. Please check the console for details.');
    }
}

// Make sure the DOM is fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeApp);

let currentHistoryIndex = -1;

async function generateImages() {
    if (!elements.prompt.value) {
        alert('Please enter a description first!');
        return;
    }

    elements.loading.style.display = 'block';
    elements.results.innerHTML = '';
    elements.generateBtn.disabled = true;

    try {
        await simulateImageGeneration(elements.prompt.value, parseInt(elements.imageCount.value));
    } catch (error) {
        alert('Error generating images: ' + error.message);
    } finally {
        elements.loading.style.display = 'none';
        elements.generateBtn.disabled = false;
    }
}

// This function simulates image generation
// In a real application, you'd replace this with actual API calls
async function simulateImageGeneration(promptText, count) {
    const generatedImages = [];
    
    for (let i = 0; i < count; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const card = document.createElement('div');
        card.className = 'image-card';
        
        const img = document.createElement('img');
        const imgUrl = `https://source.unsplash.com/random/800x600?${encodeURIComponent(promptText)}&sig=${i}`;
        img.src = imgUrl;
        generatedImages.push(imgUrl);
        
        const downloadBtn = document.createElement('button');
        downloadBtn.className = 'download-btn';
        downloadBtn.innerHTML = '⬇️ Download';
        downloadBtn.onclick = () => downloadImage(img.src, `ai-image-${i + 1}.jpg`);
        
        card.appendChild(img);
        card.appendChild(downloadBtn);
        elements.results.appendChild(card);
    }
    
    // Save this generation to history
    saveToHistory(promptText, generatedImages);
}

// Add the downloadImage function
async function downloadImage(url, filename) {
    const downloadBtn = event.target;
    const originalText = downloadBtn.innerHTML;
    
    try {
        downloadBtn.innerHTML = '⏳ Downloading...';
        downloadBtn.disabled = true;
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Download failed');
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
        
        downloadBtn.innerHTML = '✅ Downloaded';
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }, 2000);
    } catch (error) {
        console.error('Download error:', error);
        downloadBtn.innerHTML = '❌ Failed';
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }, 2000);
        alert('Error downloading image: ' + error.message);
    }
}

// Add these new functions
function restart() {
    elements.prompt.value = '';
    elements.results.innerHTML = '';
    elements.imageCount.value = '4';
}

function showHistory() {
    const historyList = document.getElementById('historyList');
    const history = getHistory();
    historyList.innerHTML = '';

    history.reverse().forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        historyItem.innerHTML = `
            <div class="history-prompt">"${item.prompt}"</div>
            <div class="history-date">${new Date(item.timestamp).toLocaleString()}</div>
            <img src="${item.imageUrl}" alt="${item.prompt}" class="history-image">
        `;
        
        historyList.appendChild(historyItem);
    });

    document.getElementById('historyModal').style.display = 'block';
}

function getHistory() {
    try {
        const history = localStorage.getItem(HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    } catch {
        return [];
    }
}

function saveToHistory(prompt, imageUrl) {
    try {
        const history = getHistory();
        history.push({
            prompt,
            imageUrl,
            timestamp: Date.now()
        });
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        updateBackButton();
    } catch (error) {
        console.error('Error saving to history:', error);
    }
}

function updateBackButton() {
    const backBtn = document.querySelector('.back-btn');
    const history = getHistory();
    backBtn.style.display = history.length > 0 ? 'block' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    // Button click handlers for model selection
    const modelBtns = document.querySelectorAll('.model-btn');
    modelBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modelBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Button click handlers for preference selection
    const prefBtns = document.querySelectorAll('.pref-btn');
    prefBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            prefBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Generate button click handler
    const generateBtn = document.querySelector('.generate-btn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');

    generateBtn.addEventListener('click', async () => {
        if (!API_KEY) {
            alert('Please configure your API key first');
            return;
        }

        const prompt = document.querySelector('.prompt-input').value;
        if (!prompt) {
            alert('Please enter a description first!');
            return;
        }

        loading.style.display = 'block';
        generateBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': API_KEY
                },
                body: JSON.stringify({
                    prompt: `architectural design: ${prompt}, professional architectural visualization, photorealistic, modern architecture, cinematic lighting, sharp focus`,
                    negative_prompt: "blurry, low quality, distorted"
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`API Error: ${errorData.message || response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.url) {
                throw new Error('No image URL in response');
            }

            const imageUrl = data.url;
            const imageCard = createImageCard(imageUrl, prompt);
            results.insertBefore(imageCard, results.firstChild);
            saveToHistory(prompt, imageUrl);

        } catch (error) {
            console.error('Generation error:', error);
            alert(`Error: ${error.message}`);
        } finally {
            loading.style.display = 'none';
            generateBtn.disabled = false;
        }
    });

    // Initialize handlers
    initializeHandlers();
});

function createImageCard(imageUrl, prompt) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = prompt;
    
    // Add loading indicator
    img.style.opacity = '0';
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'image-loading';
    loadingDiv.innerHTML = 'Loading image...';
    card.appendChild(loadingDiv);
    
    // Handle image load
    img.onload = () => {
        loadingDiv.remove();
        img.style.opacity = '1';
    };
    
    // Handle image error
    img.onerror = () => {
        loadingDiv.innerHTML = 'Error loading image';
        loadingDiv.style.color = 'red';
    };
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.innerHTML = '⬇️ Download';
    downloadBtn.onclick = async () => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `archgen-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
            
            downloadBtn.innerHTML = '✅ Downloaded';
            setTimeout(() => {
                downloadBtn.innerHTML = '⬇️ Download';
            }, 2000);
        } catch (error) {
            console.error('Download error:', error);
            downloadBtn.innerHTML = '❌ Error';
            setTimeout(() => {
                downloadBtn.innerHTML = '⬇️ Download';
            }, 2000);
            alert('Error downloading image. Please try again.');
        }
    };
    
    card.appendChild(img);
    card.appendChild(downloadBtn);
    return card;
}

async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
    } catch (error) {
        console.error('Download error:', error);
        alert('Error downloading image. Please try again.');
    }
}