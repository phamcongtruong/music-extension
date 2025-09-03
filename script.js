class MusicPlayer {
    constructor() {
        this.audio = document.getElementById('audioPlayer');
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.isShuffling = false;
        this.isRepeating = false;
        this.volume = 0.7;
        this.previousVolume = 0.7; // Lưu âm lượng trước khi mute
        this.isMuted = false;
        this.playlist = [];
        
        // YouTube Player properties
        this.youtubePlayer = null;
        this.currentPlayerType = 'audio'; // 'audio' or 'youtube'
        this.youtubePlayerReady = false;
        this.useIframeMethod = false; // Fallback to basic iframe
        
        // Progress tracking intervals - thuật toán như CodePen
        this.progressInterval = null;
        this.currentTime = 0;
        this.duration = 0;
        
        this.initializeElements();
        this.initializeEventListeners();
        
        // Test DOM elements
        console.log('DOM elements check:');
        console.log('currentTimeDisplay:', this.currentTimeDisplay);
        console.log('totalTimeDisplay:', this.totalTimeDisplay);
        console.log('Audio element:', this.audio);
        
        // Initialize YouTube API
        this.initializeYouTubeAPI();
        
        // Load playlist async và cập nhật UI sau khi hoàn thành
        this.loadRemotePlaylist().then(() => {
            console.log('Playlist loaded, ready to play');
        });
        
        this.updateClock();
        this.updateStats();
        
        // Set initial volume
        this.audio.volume = this.volume;
        this.updateVolumeDisplay();
        
        // Ensure volume handle is positioned correctly on initialization
        setTimeout(() => {
            this.updateVolumeDisplay();
            // Initialize time display với giá trị mặc định CodePen-style
            this.initializeProgressSection();
        }, 100);
    }

    // CodePen-style progress section initialization
    initializeProgressSection() {
        console.log('🎯 Initializing REAL CodePen-style progress section');
        
        // Set default values như CodePen
        this.currentTime = 0;
        this.duration = 0;
        
        // Update display ngay lập tức
        this.updateTimeAndProgress();
        
        // Add playing class management
        this.updatePlayerState();
        
        console.log('✅ CodePen progress section initialized');
    }

    // CodePen-style player state management
    updatePlayerState() {
        const musicPlayer = document.querySelector('.music-player');
        if (this.isPlaying) {
            musicPlayer.classList.add('playing');
        } else {
            musicPlayer.classList.remove('playing');
        }
    }

    initializeElements() {
        // Controls
        this.playBtn = document.getElementById('playBtn');
        this.mainPlayBtn = document.getElementById('mainPlayBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.shuffleBtn = document.getElementById('shuffleBtn');
        this.repeatBtn = document.getElementById('repeatBtn');
        
        // Display elements
        this.albumCover = document.getElementById('albumCover');
        this.trackTitle = document.getElementById('trackTitle');
        this.trackArtist = document.getElementById('trackArtist');
        this.currentTimeDisplay = document.getElementById('currentTimeDisplay');
        this.totalTimeDisplay = document.getElementById('totalTimeDisplay');
        
        // Progress bars
        this.progressContainer = document.querySelector('.progress-container');
        this.progressBar = document.querySelector('.progress-bar');
        this.progress = document.getElementById('progress');
        this.progressHandle = document.getElementById('progressHandle');
        
        // Volume controls
        this.volumeBar = document.querySelector('.volume-bar');
        this.volumeProgress = document.getElementById('volumeProgress');
        this.volumeHandle = document.getElementById('volumeHandle');
        this.volumeText = document.getElementById('volumeText');
        this.volumeIcon = document.querySelector('.volume-icon');
        
        // Playlist
        this.playlistContainer = document.getElementById('playlist');
        this.addSongBtn = document.getElementById('addSongBtn');
        this.refreshPlaylistBtn = document.getElementById('refreshPlaylistBtn');
        
        // Modal
        this.modal = document.getElementById('addSongModal');
        this.closeModalBtn = document.getElementById('closeModal');
        this.cancelBtn = document.getElementById('cancelBtn');
        this.addBtn = document.getElementById('addBtn');
        
        // Stats
        this.totalSongs = document.getElementById('totalSongs');
        this.totalTime = document.getElementById('totalTime');
        this.currentPlaylist = document.getElementById('currentPlaylist');
    }

    initializeEventListeners() {
        // Play/Pause buttons
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.mainPlayBtn.addEventListener('click', () => this.togglePlay());
        
        // Navigation buttons
        this.prevBtn.addEventListener('click', () => this.previousTrack());
        this.nextBtn.addEventListener('click', () => this.nextTrack());
        
        // Mode buttons
        this.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        
        // Progress bar
        this.progressBar.addEventListener('click', (e) => this.seekTo(e));
        this.progressHandle.addEventListener('mousedown', (e) => this.startProgressDrag(e));
        
        // Volume bar
        this.volumeBar.addEventListener('click', (e) => this.setVolume(e));
        this.volumeHandle.addEventListener('mousedown', (e) => this.startVolumeDrag(e));
        
        // Volume icon click to mute/unmute
        this.volumeIcon.addEventListener('click', () => this.toggleMute());
        
        // Volume scroll wheel support
        this.volumeBar.addEventListener('wheel', (e) => this.handleVolumeScroll(e));
        
        // Audio events - CHÍNH XÁC như CodePen pattern
        this.audio.addEventListener('loadedmetadata', () => {
            console.log('Audio metadata loaded, duration:', this.audio.duration);
            this.duration = this.audio.duration || 0;
            this.currentTime = 0;
            this.updateTimeAndProgress();
        });

        // QUAN TRỌNG: timeupdate event như CodePen
        this.audio.addEventListener('timeupdate', () => {
            if (this.currentPlayerType === 'audio') {
                this.currentTime = this.audio.currentTime || 0;
                this.updateTimeAndProgress();
            }
        });
        
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.stopProgressTimer();
            this.onTrackEnded();
        });
        
        this.audio.addEventListener('error', (e) => this.onAudioError(e));
        
        this.audio.addEventListener('play', () => {
            console.log('Audio play event');
            this.isPlaying = true;
            this.updatePlayButtonUI();
            this.startProgressTimer();
        });
        
        this.audio.addEventListener('pause', () => {
            console.log('Audio pause event');
            this.isPlaying = false;
            this.stopProgressTimer();
            this.updatePauseButtonUI();
        });
        
        // Modal events
        this.addSongBtn.addEventListener('click', () => this.showModal());
        if (this.refreshPlaylistBtn) {
            this.refreshPlaylistBtn.addEventListener('click', () => this.loadRemotePlaylist());
        }
        this.closeModalBtn.addEventListener('click', () => this.hideModal());
        this.cancelBtn.addEventListener('click', () => this.hideModal());
        this.addBtn.addEventListener('click', () => this.addNewSong());
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.hideModal();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    // YouTube API Integration
    initializeYouTubeAPI() {
        // Load YouTube API dynamically to comply with CSP
        this.loadYouTubeAPI().then(() => {
            console.log('YouTube API loaded successfully');
        }).catch((error) => {
            console.warn('Failed to load YouTube API, using iframe method:', error);
            this.useIframeMethod = true;
        });
    }

    async loadYouTubeAPI() {
        return new Promise((resolve, reject) => {
            // Check if API is already loaded
            if (window.YT && window.YT.Player) {
                this.initializeYouTubePlayer();
                resolve();
                return;
            }

            // Create script tag for YouTube API
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            script.onerror = () => reject(new Error('Failed to load YouTube API'));
            
            // Set up callback
            window.onYouTubeIframeAPIReady = () => {
                this.initializeYouTubePlayer();
                resolve();
            };

            document.head.appendChild(script);
            
            // Timeout fallback
            setTimeout(() => {
                if (!this.youtubePlayerReady) {
                    reject(new Error('YouTube API timeout'));
                }
            }, 10000);
        });
    }

    initializeYouTubePlayer() {
        console.log('Initializing YouTube Player...');
        try {
            this.youtubePlayer = new YT.Player('youtube-player', {
                height: '0',
                width: '0',
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'modestbranding': 1,
                    'rel': 0,
                    'iv_load_policy': 3,
                    'enablejsapi': 1,
                    'origin': window.location.origin
                },
                events: {
                    'onReady': (event) => this.onYouTubePlayerReady(event),
                    'onStateChange': (event) => this.onYouTubePlayerStateChange(event),
                    'onError': (event) => this.onYouTubePlayerError(event)
                }
            });
        } catch (error) {
            console.error('Failed to initialize YouTube Player:', error);
            this.useIframeMethod = true;
        }
    }

    onYouTubePlayerReady(event) {
        console.log('YouTube Player Ready');
        this.youtubePlayerReady = true;
        this.youtubePlayer.setVolume(this.volume * 100);
    }

    onYouTubePlayerStateChange(event) {
        console.log('YouTube Player State Change:', event.data);
        
        switch (event.data) {
            case YT.PlayerState.PLAYING:
                this.isPlaying = true;
                this.updatePlayButtonUI();
                this.startProgressTimer(); // Sử dụng timer chung
                break;
            case YT.PlayerState.PAUSED:
                this.isPlaying = false;
                this.updatePauseButtonUI();
                this.stopProgressTimer();
                break;
            case YT.PlayerState.ENDED:
                this.isPlaying = false;
                this.stopProgressTimer();
                this.onTrackEnded();
                break;
            case YT.PlayerState.BUFFERING:
                // Keep timer running during buffering
                console.log('YouTube buffering...');
                break;
        }
    }

    onYouTubePlayerError(event) {
        console.error('YouTube Player Error:', event.data);
        this.handleYouTubeError(event.data);
    }

    handleYouTubeError(errorCode) {
        const currentTrack = this.playlist[this.currentTrackIndex];
        let errorMessage = `Lỗi phát video YouTube "${currentTrack?.title}"`;
        
        switch (errorCode) {
            case 2:
                errorMessage += ': ID video không hợp lệ';
                break;
            case 5:
                errorMessage += ': Video không thể phát trên HTML5 player';
                break;
            case 100:
                errorMessage += ': Video không tồn tại hoặc bị xóa';
                break;
            case 101:
            case 150:
                errorMessage += ': Video bị hạn chế nhúng';
                break;
        }
        
        this.showErrorNotification(errorMessage);
        
        // Auto skip to next track
        setTimeout(() => {
            if (this.playlist.length > 1) {
                this.nextTrack();
            }
        }, 2000);
    }

    // CodePen-style state-based timer - CHÍNH XÁC như CodePen
    startProgressTimer() {
        this.stopProgressTimer(); 
        console.log('🎵 Starting REAL CodePen timer');
        
        // CodePen sử dụng setInterval đơn giản với 1000ms (1 giây)
        this.progressInterval = setInterval(() => {
            if (this.isPlaying) {
                this.updateTimeFromPlayer();
            }
        }, 1000); // 1 giây như CodePen thật
    }

    stopProgressTimer() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
        console.log('⏹️ CodePen timer stopped');
    }

    // Hàm lấy thời gian từ player - như CodePen
    updateTimeFromPlayer() {
        let currentTime = 0;
        let duration = 0;

        if (this.currentPlayerType === 'audio' && this.audio.src) {
            currentTime = this.audio.currentTime || 0;
            duration = this.audio.duration || 0;
        } else if (this.currentPlayerType === 'youtube' && this.youtubePlayer && this.youtubePlayerReady) {
            try {
                currentTime = this.youtubePlayer.getCurrentTime() || 0;
                duration = this.youtubePlayer.getDuration() || 0;
            } catch (e) {
                return;
            }
        }

        // Update state
        this.currentTime = currentTime;
        this.duration = duration;
        
        // Update UI ngay lập tức
        this.updateTimeAndProgress();
    }

    // Hàm chính để update time và progress - CHÍNH XÁC như CodePen
    updateTimeAndProgress() {
        // Update time display
        if (this.currentTimeDisplay && this.totalTimeDisplay) {
            this.currentTimeDisplay.textContent = this.formatTime(this.currentTime);
            this.totalTimeDisplay.textContent = this.formatTime(this.duration);
        }
        
        // Update progress bar - logic đơn giản từ CodePen
        if (this.duration > 0) {
            const progressPercent = (this.currentTime / this.duration) * 100;
            
            if (this.progress) {
                this.progress.style.width = progressPercent + '%';
            }
            
            if (this.progressHandle) {
                this.progressHandle.style.left = progressPercent + '%';
            }
        }
        
        console.log(`⏰ ${this.formatTime(this.currentTime)}/${this.formatTime(this.duration)} (${Math.round((this.currentTime/this.duration)*100)}%)`);
    }

    // CodePen-style progress algorithm - simple và direct
    updateTimeDisplay() {
        this.updateTimeAndProgress();
    }

    // CodePen-style progress bar update
    updateProgressBar() {
        this.updateTimeAndProgress();
    }

    updatePauseButtonUI() {
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.mainPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        
        // CodePen-style state management
        this.updatePlayerState();
        this.stopProgressTimer();
        
        console.log('⏸️ Paused - CodePen style UI updated');
    }

    loadPlaylist() {
        chrome.storage.local.get(['musicPlaylist'], (result) => {
            if (result.musicPlaylist && result.musicPlaylist.length > 0) {
                this.playlist = result.musicPlaylist;
            } else {
                // Default playlist với audio URLs có thể hoạt động
                this.playlist = [
                    {
                        title: "Lofi Hip Hop Beat",
                        artist: "Chill Beats", 
                        cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
                        url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
                        duration: "0:30"
                    },
                    {
                        title: "Jazz Cafe",
                        artist: "Smooth Jazz",
                        cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&h=300&fit=crop&crop=center", 
                        url: "https://file-examples.com/storage/fe68c81b9f66cccbdfa5e5f/2017/11/file_example_MP3_700KB.mp3",
                        duration: "0:27"
                    },
                    {
                        title: "Ocean Waves",
                        artist: "Nature Sounds",
                        cover: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=300&h=300&fit=crop&crop=center",
                        url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                        duration: "0:02"
                    }
                ];
                this.savePlaylist();
            }
            this.renderPlaylist();
            this.updateStats();
        });
    }

    savePlaylist() {
        chrome.storage.local.set({ musicPlaylist: this.playlist });
    }

    renderPlaylist() {
        if (this.playlist.length === 0) {
            this.playlistContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <p>Chưa có bài hát nào trong playlist.<br>Nhấn nút + để thêm bài hát mới!</p>
                </div>
            `;
            return;
        }

        this.playlistContainer.innerHTML = this.playlist.map((track, index) => `
            <div class="playlist-item ${index === this.currentTrackIndex ? 'active' : ''} ${!track.playable ? 'unplayable' : ''}" data-index="${index}">
                <img src="${track.cover}" alt="${track.title}" onerror="this.src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center'">
                <div class="playlist-item-info">
                    <h5>${track.title}</h5>
                    <p>${track.artist} • ${track.duration || '0:00'}</p>
                    ${track.type === 'youtube' ? '<span class="youtube-badge"><i class="fab fa-youtube"></i> YouTube</span>' : ''}
                    ${!track.playable ? `<span class="warning-badge"><i class="fas fa-exclamation-triangle"></i> ${track.warningMessage}</span>` : ''}
                </div>
                <div class="playlist-item-actions">
                    <button class="play-item-btn" title="${track.playable ? 'Phát bài này' : 'Không thể phát'}" ${!track.playable ? 'disabled' : ''}>
                        <i class="fas fa-${track.playable ? 'play' : 'ban'}"></i>
                    </button>
                    ${track.originalYouTubeUrl ? `<button class="youtube-link-btn" title="Xem trên YouTube" onclick="window.open('${track.originalYouTubeUrl}', '_blank')">
                        <i class="fab fa-youtube"></i>
                    </button>` : ''}
                    <button class="delete-btn" title="Xóa bài hát">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to playlist items
        this.playlistContainer.querySelectorAll('.playlist-item').forEach((item, index) => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.playlist-item-actions')) {
                    const track = this.playlist[index];
                    if (track.playable) {
                        this.playTrack(index);
                    } else {
                        this.showErrorNotification(`"${track.title}" không thể phát. ${track.warningMessage}`);
                    }
                }
            });
            
            const playBtn = item.querySelector('.play-item-btn');
            if (playBtn && !playBtn.disabled) {
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const track = this.playlist[index];
                    if (track.playable) {
                        this.playTrack(index);
                    }
                });
            }
            
            const deleteBtn = item.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteTrack(index);
            });
        });
    }

    playTrack(index) {
        console.log('🎵 Playing track:', index, 'playlist length:', this.playlist.length);
        
        if (index < 0 || index >= this.playlist.length) {
            console.log('Invalid index, returning');
            return;
        }
        
        // Reset thời gian ngay lập tức như CodePen
        this.currentTime = 0;
        this.duration = 0;
        this.updateTimeAndProgress();
        
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        
        console.log(`Attempting to play: ${track.title} (${track.type || 'unknown'})`);
        console.log('Track URL:', track.url);
        console.log('Playable:', track.playable);
        console.log('Has audioFallback:', !!track.audioFallback);
        
        // Kiểm tra xem track có thể phát không
        if (!track.playable && !track.audioFallback) {
            console.log('Track is not playable and has no fallback');
            this.showErrorNotification(`"${track.title}" không thể phát. ${track.warningMessage || 'Cần audio fallback'}`);
            
            // Tự động skip sang bài tiếp theo có thể phát
            setTimeout(() => {
                const nextPlayableIndex = this.findNextPlayableTrack(index);
                if (nextPlayableIndex !== -1 && nextPlayableIndex !== index) {
                    this.playTrack(nextPlayableIndex);
                }
            }, 2000);
            return;
        }
        
        // Update UI immediately
        this.trackTitle.textContent = track.title;
        this.trackArtist.textContent = track.artist;
        this.albumCover.src = track.cover;
        
        // Validate track has URL
        if (!track.url || track.url.trim() === '') {
            console.log('Invalid URL for track:', track.title);
            this.showErrorNotification(`Bài "${track.title}" không có URL hợp lệ.`);
            return;
        }
        
        // Smart playback logic với fallback support
        this.attemptPlayback(track);
        
        this.renderPlaylist();
        // Không cần gọi updateProgress nữa vì đã có timer
    }

    findNextPlayableTrack(currentIndex) {
        // Tìm bài tiếp theo có thể phát
        for (let i = 1; i < this.playlist.length; i++) {
            const nextIndex = (currentIndex + i) % this.playlist.length;
            const track = this.playlist[nextIndex];
            if (track.playable || track.audioFallback) {
                return nextIndex;
            }
        }
        return -1; // Không có bài nào có thể phát
    }
    
    async attemptPlayback(track) {
        try {
            // Stop any current playback
            this.stopCurrentPlayback();
            
            if (track.type === 'youtube' || this.isYouTubeURL(track.url)) {
                console.log('YouTube track detected - using YouTube Player...');
                
                const videoId = this.extractVideoId(track.url);
                if (!videoId) {
                    throw new Error('Không thể trích xuất Video ID từ URL YouTube');
                }
                
                console.log('Playing YouTube video ID:', videoId);
                this.currentPlayerType = 'youtube';
                
                if (this.youtubePlayerReady && !this.useIframeMethod) {
                    // Use YouTube API
                    this.youtubePlayer.loadVideoById(videoId);
                    this.youtubePlayer.setVolume(this.volume * 100);
                    console.log('Successfully initiated YouTube API playback');
                } else {
                    // Use iframe fallback method
                    console.log('Using iframe fallback method');
                    this.playYouTubeWithIframe(videoId);
                }
            } else {
                // Direct audio file
                console.log('Playing direct audio file:', track.url);
                this.currentPlayerType = 'audio';
                await this.playAudioUrl(track.url);
                console.log('Successfully playing direct audio');
            }
            
        } catch (error) {
            console.error('Primary playback failed:', error);
            
            // Try fallback if available
            if (track.audioFallback && this.currentPlayerType !== 'audio') {
                console.log('Attempting audio fallback...');
                try {
                    this.currentPlayerType = 'audio';
                    await this.playAudioUrl(track.audioFallback);
                    console.log('Successfully playing fallback URL');
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    this.handlePlaybackError(track, fallbackError);
                }
            } else {
                this.handlePlaybackError(track, error);
            }
        }
    }

    playYouTubeWithIframe(videoId) {
        // Create a simple iframe for YouTube video
        const container = document.getElementById('youtube-player-container');
        container.innerHTML = `
            <iframe 
                id="youtube-iframe"
                width="0" 
                height="0" 
                src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}"
                frameborder="0" 
                allow="autoplay; encrypted-media"
                style="display: none;">
            </iframe>
        `;
        
        // Simulate playback state
        this.isPlaying = true;
        this.updatePlayButtonUI();
        
        // Show info message
        this.showSuccessNotification(`Đang phát "${this.playlist[this.currentTrackIndex]?.title}" qua YouTube iframe`);
        
        console.log('YouTube iframe created and playing');
    }

    stopCurrentPlayback() {
        // Stop audio player
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        
        // Stop YouTube player
        if (this.youtubePlayer && this.youtubePlayerReady && !this.useIframeMethod) {
            try {
                this.youtubePlayer.stopVideo();
            } catch (e) {
                console.warn('Error stopping YouTube player:', e);
            }
        }
        
        // Stop iframe if using fallback method
        const iframeContainer = document.getElementById('youtube-player-container');
        if (iframeContainer && this.currentPlayerType === 'youtube') {
            iframeContainer.innerHTML = '<div id="youtube-player"></div>';
        }
        
        // Stop progress tracking
        this.stopProgressTimer();
        
        // Reset state
        this.isPlaying = false;
        this.currentTime = 0;
        this.duration = 0;
        this.updatePauseButtonUI();
    }
    
    async playAudioUrl(url) {
        return new Promise((resolve, reject) => {
            // Validate URL first
            if (!url || this.isYouTubeURL(url)) {
                reject(new Error('URL không hợp lệ hoặc là YouTube URL'));
                return;
            }
            
            console.log('Setting audio source to:', url);
            this.audio.src = url;
            
            // Reset state như CodePen
            this.currentTime = 0;
            this.duration = 0;
            this.updateTimeDisplay();
            
            // Setup event handlers
            const onCanPlay = () => {
                console.log('Audio can play - starting playback');
                this.audio.play()
                    .then(() => {
                        console.log('Audio playback started successfully');
                        this.isPlaying = true;
                        this.duration = this.audio.duration || 0;
                        this.updatePlayButtonUI();
                        resolve();
                    })
                    .catch(reject);
                
                // Cleanup
                this.audio.removeEventListener('canplay', onCanPlay);
                this.audio.removeEventListener('error', onError);
            };
            
            const onError = (e) => {
                console.error('Audio loading error:', e);
                reject(new Error(`Failed to load audio: ${e.type}`));
                
                // Cleanup
                this.audio.removeEventListener('canplay', onCanPlay);
                this.audio.removeEventListener('error', onError);
            };
            
            // Attach event listeners
            this.audio.addEventListener('canplay', onCanPlay);
            this.audio.addEventListener('error', onError);
            
            // Start loading
            this.audio.load();
        });
    }
    
    updatePlayButtonUI() {
        this.playBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.mainPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        
        // CodePen-style state management
        this.updatePlayerState();
        this.startProgressTimer();
        
        console.log('▶️ Playing - CodePen style UI updated');
    }
    
    autoSkipToNextTrack() {
        // Auto skip to next track after 2 seconds
        setTimeout(() => {
            if (this.playlist.length > 1) {
                this.nextTrack();
            }
        }, 2000);
    }

    handlePlaybackError(track, error) {
        console.error('Playback error for track:', track.title, error);
        
        // Reset UI state
        this.isPlaying = false;
        this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.mainPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        document.querySelector('.music-player').classList.remove('playing');
        
        // Show appropriate error message
        if (error.code === 4) {
            this.showErrorNotification(`File "${track.title}" không được hỗ trợ hoặc bị lỗi.`);
        } else if (error.code === 2) {
            this.showErrorNotification(`Lỗi mạng khi tải "${track.title}".`);
        } else {
            this.showErrorNotification(`Không thể phát "${track.title}". URL có thể không hợp lệ.`);
        }
    }

    togglePlay() {
        console.log('togglePlay called, playlist length:', this.playlist.length);
        
        if (this.playlist.length === 0) {
            console.log('No playlist, showing modal');
            this.showModal();
            return;
        }

        console.log('Current playing state:', this.isPlaying, 'Player type:', this.currentPlayerType);
        
        if (this.isPlaying) {
            // Pause current playback
            console.log('Pausing playback');
            if (this.currentPlayerType === 'youtube') {
                if (this.youtubePlayer && !this.useIframeMethod) {
                    this.youtubePlayer.pauseVideo();
                } else {
                    // For iframe method, we can't pause, so just stop
                    this.stopCurrentPlayback();
                }
            } else {
                this.audio.pause();
            }
        } else {
            // Resume or start playback
            console.log('Starting/resuming playback, track index:', this.currentTrackIndex);
            
            if (this.currentPlayerType === 'youtube') {
                if (this.youtubePlayer && !this.useIframeMethod) {
                    // Resume YouTube API playback if possible
                    const playerState = this.youtubePlayer.getPlayerState();
                    if (playerState === YT.PlayerState.PAUSED) {
                        this.youtubePlayer.playVideo();
                    } else {
                        // Restart the track
                        this.playTrack(this.currentTrackIndex);
                    }
                } else {
                    // For iframe method, restart the track
                    this.playTrack(this.currentTrackIndex);
                }
            } else if (this.currentPlayerType === 'audio' && this.audio.src) {
                // Resume audio playback
                this.audio.play().then(() => {
                    this.isPlaying = true;
                    this.updatePlayButtonUI();
                }).catch(() => {
                    // If resume fails, restart the track
                    this.playTrack(this.currentTrackIndex);
                });
            } else {
                // Start fresh playback
                this.playTrack(this.currentTrackIndex);
            }
        }
    }

    previousTrack() {
        if (this.isShuffling) {
            this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentTrackIndex = this.currentTrackIndex > 0 ? this.currentTrackIndex - 1 : this.playlist.length - 1;
        }
        this.playTrack(this.currentTrackIndex);
    }

    nextTrack() {
        if (this.isShuffling) {
            this.currentTrackIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentTrackIndex = this.currentTrackIndex < this.playlist.length - 1 ? this.currentTrackIndex + 1 : 0;
        }
        this.playTrack(this.currentTrackIndex);
    }

    toggleShuffle() {
        this.isShuffling = !this.isShuffling;
        this.shuffleBtn.classList.toggle('active', this.isShuffling);
    }

    toggleRepeat() {
        this.isRepeating = !this.isRepeating;
        this.repeatBtn.classList.toggle('active', this.isRepeating);
    }

    onTrackEnded() {
        if (this.isRepeating) {
            this.audio.currentTime = 0;
            this.audio.play();
        } else {
            this.nextTrack();
        }
    }

    onAudioError(e) {
        console.error('Audio error:', e);
        
        // Xử lý lỗi thông minh thay vì alert
        const currentTrack = this.playlist[this.currentTrackIndex];
        
        if (currentTrack) {
            console.log('Trying to handle audio error for:', currentTrack.title);
            
            // Reset trạng thái phát
            this.isPlaying = false;
            this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
            this.mainPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            document.querySelector('.music-player').classList.remove('playing');
            
            // Hiển thị thông báo lỗi nhẹ nhàng
            this.showErrorNotification(`Không thể phát "${currentTrack.title}". Thử bài tiếp theo...`);
            
            // Tự động chuyển sang bài tiếp theo sau 2 giây
            setTimeout(() => {
                if (this.playlist.length > 1) {
                    this.nextTrack();
                }
            }, 2000);
        }
    }

    showErrorNotification(message) {
        // Tạo thông báo lỗi đẹp thay vì alert
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px;">×</button>
        `;
        
        // Style cho notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(255, 107, 107, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        // Tự động xóa sau 4 giây
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 4000);
    }

    // CodePen-style seeking - ĐƠN GIẢN và TRỰC TIẾP
    seekTo(e) {
        if (!this.progressBar) return;
        
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(clickX / rect.width, 1));
        
        console.log('🎯 Seeking to:', Math.round(percentage * 100) + '%');

        // Tính thời gian mới
        if (this.duration > 0) {
            const newTime = percentage * this.duration;
            
            // Apply seek tùy theo loại player
            if (this.currentPlayerType === 'audio' && this.audio.src) {
                this.audio.currentTime = newTime;
            } else if (this.currentPlayerType === 'youtube' && this.youtubePlayer && this.youtubePlayerReady) {
                try {
                    this.youtubePlayer.seekTo(newTime, true);
                } catch (e) {
                    console.warn('YouTube seek error:', e);
                    return;
                }
            }
            
            // Update state ngay lập tức như CodePen
            this.currentTime = newTime;
            this.updateTimeAndProgress();
        }
    }

    showSeekFeedback(percentage, newTime) {
        // Add progress seeking class for smooth animation
        this.progressBar.classList.add('progress-seeking');
        
        // Temporarily update progress display for immediate feedback
        this.progress.style.width = `${percentage * 100}%`;
        this.progressHandle.style.left = `${percentage * 100}%`;
        this.currentTimeDisplay.textContent = this.formatTime(newTime);
        
        // Add visual feedback with enhanced animation
        this.progressHandle.style.opacity = '1';
        this.progressHandle.style.transform = 'translate(-50%, -50%) scale(1.3)';
        this.progress.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.7)';
        
        // Reset visual feedback
        setTimeout(() => {
            this.progressHandle.style.transform = 'translate(-50%, -50%) scale(1)';
            this.progress.style.boxShadow = 'none';
            this.progressBar.classList.remove('progress-seeking');
        }, 200);
    }

    startProgressDrag(e) {
        e.preventDefault();
        
        // Show handle during drag
        this.progressHandle.style.opacity = '1';
        this.progressHandle.style.transition = 'none';
        this.progress.style.transition = 'none';
        
        const onMouseMove = (e) => this.onProgressDrag(e);
        const onMouseUp = () => {
            // Re-enable transitions
            this.progressHandle.style.transition = 'all 0.3s ease';
            this.progress.style.transition = 'width 0.1s ease';
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    onProgressDrag(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = clickX / rect.width;
        
        // Update visual feedback immediately
        this.progress.style.width = `${percentage * 100}%`;
        this.progressHandle.style.left = `${percentage * 100}%`;
        
        // Calculate and update time based on player type
        let duration = 0;
        let newTime = 0;

        if (this.currentPlayerType === 'youtube' && this.youtubePlayer && this.youtubePlayerReady) {
            try {
                duration = this.youtubePlayer.getDuration();
                newTime = percentage * duration;
                
                if (!isNaN(newTime) && duration > 0) {
                    this.youtubePlayer.seekTo(newTime, true);
                    this.currentTimeDisplay.textContent = this.formatTime(newTime);
                }
            } catch (error) {
                console.warn('Error during YouTube drag:', error);
            }
        } else if (this.currentPlayerType === 'audio' && this.audio.duration) {
            duration = this.audio.duration;
            newTime = percentage * duration;
            
            if (!isNaN(newTime)) {
                this.audio.currentTime = newTime;
                this.currentTimeDisplay.textContent = this.formatTime(newTime);
            }
        }
    }

    setVolume(e) {
        const rect = this.volumeBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(clickX / rect.width, 1));
        
        this.volume = percentage;
        
        // Reset mute state if setting volume manually
        if (this.volume > 0) {
            this.isMuted = false;
        } else {
            this.isMuted = true;
        }
        
        this.applyVolumeToPlayers();
        this.updateVolumeDisplay();
    }

    startVolumeDrag(e) {
        e.preventDefault();
        
        // Disable transition during drag for responsive feel
        this.volumeHandle.style.transition = 'none';
        this.volumeProgress.style.transition = 'none';
        
        const onMouseMove = (e) => this.onVolumeDrag(e);
        const onMouseUp = () => {
            // Re-enable transitions when drag ends
            this.volumeHandle.style.transition = 'left 0.15s ease, transform 0.15s ease, box-shadow 0.2s ease';
            this.volumeProgress.style.transition = 'width 0.15s ease';
            
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    onVolumeDrag(e) {
        const rect = this.volumeBar.getBoundingClientRect();
        const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const percentage = clickX / rect.width;
        
        this.volume = percentage;
        
        // Reset mute state if dragging volume
        if (this.volume > 0) {
            this.isMuted = false;
        } else {
            this.isMuted = true;
        }
        
        this.applyVolumeToPlayers();
        this.updateVolumeDisplay();
    }

    updateVolumeDisplay() {
        const percentage = this.volume * 100;
        
        // Update volume progress bar width
        this.volumeProgress.style.width = `${percentage}%`;
        
        // Update volume handle position (ensure it moves with the volume level)
        this.volumeHandle.style.left = `${percentage}%`;
        
        // Update volume text
        this.volumeText.textContent = `${Math.round(percentage)}%`;
        
        // Update volume icon based on volume level
        this.updateVolumeIcon();
        
        // Add visual feedback for volume changes
        this.addVolumeChangeFeedback();
    }

    addVolumeChangeFeedback() {
        // Add temporary highlight effect to show volume change
        this.volumeHandle.style.transform = 'translate(-50%, -50%) scale(1.2)';
        this.volumeProgress.style.boxShadow = '0 0 15px rgba(255, 215, 0, 0.5)';
        
        // Reset after short delay
        setTimeout(() => {
            this.volumeHandle.style.transform = 'translate(-50%, -50%) scale(1)';
            this.volumeProgress.style.boxShadow = '0 0 10px rgba(255, 215, 0, 0.3)';
        }, 150);
    }

    updateVolumeIcon() {
        const volumeLevel = this.volume;
        
        if (this.isMuted || volumeLevel === 0) {
            this.volumeIcon.className = 'fas fa-volume-mute volume-icon';
        } else if (volumeLevel < 0.3) {
            this.volumeIcon.className = 'fas fa-volume-off volume-icon';
        } else if (volumeLevel < 0.7) {
            this.volumeIcon.className = 'fas fa-volume-down volume-icon';
        } else {
            this.volumeIcon.className = 'fas fa-volume-up volume-icon';
        }
    }

    toggleMute() {
        if (this.isMuted) {
            // Unmute: restore previous volume
            this.volume = this.previousVolume;
            this.isMuted = false;
        } else {
            // Mute: save current volume and set to 0
            if (this.volume > 0) {
                this.previousVolume = this.volume;
            }
            this.volume = 0;
            this.isMuted = true;
        }
        
        this.applyVolumeToPlayers();
        this.updateVolumeDisplay();
        
        // Show notification
        const message = this.isMuted ? 'Đã tắt tiếng' : `Đã bật tiếng (${Math.round(this.volume * 100)}%)`;
        this.showVolumeNotification(message);
    }

    increaseVolume() {
        if (this.isMuted) {
            this.toggleMute();
            return;
        }
        
        const oldVolume = this.volume;
        this.volume = Math.min(1, this.volume + 0.05); // Tăng 5% mỗi lần
        
        if (this.volume !== oldVolume) {
            this.applyVolumeToPlayers();
            this.updateVolumeDisplay();
            this.showVolumeNotification(`${Math.round(this.volume * 100)}%`);
        }
    }

    decreaseVolume() {
        const oldVolume = this.volume;
        this.volume = Math.max(0, this.volume - 0.05); // Giảm 5% mỗi lần
        
        if (this.volume === 0) {
            this.isMuted = true;
        } else if (this.isMuted) {
            this.isMuted = false;
        }
        
        if (this.volume !== oldVolume) {
            this.applyVolumeToPlayers();
            this.updateVolumeDisplay();
            this.showVolumeNotification(`${Math.round(this.volume * 100)}%`);
        }
    }

    handleVolumeScroll(e) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
            // Scroll up = increase volume
            this.increaseVolume();
        } else {
            // Scroll down = decrease volume
            this.decreaseVolume();
        }
    }

    applyVolumeToPlayers() {
        // Apply to audio player
        this.audio.volume = this.volume;
        
        // Apply to YouTube player
        if (this.youtubePlayer && this.youtubePlayerReady) {
            this.youtubePlayer.setVolume(this.volume * 100);
        }
    }

    showVolumeNotification(message) {
        // Remove existing volume notification
        const existing = document.querySelector('.volume-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'volume-notification';
        notification.innerHTML = `
            <i class="${this.volumeIcon.className}"></i>
            <span>${message}</span>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10001;
            font-size: 18px;
            font-weight: 500;
            animation: fadeInScale 0.2s ease;
            min-width: 120px;
            justify-content: center;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 1 second
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'fadeOutScale 0.2s ease';
                setTimeout(() => notification.remove(), 200);
            }
        }, 1000);
    }

    updateProgress() {
        let currentTime = 0;
        let duration = 0;
        let percentage = 0;

        console.log('updateProgress called, playerType:', this.currentPlayerType, 'isPlaying:', this.isPlaying);

        if (this.currentPlayerType === 'youtube' && this.youtubePlayer && this.youtubePlayerReady) {
            // YouTube player progress
            try {
                currentTime = this.youtubePlayer.getCurrentTime() || 0;
                duration = this.youtubePlayer.getDuration() || 0;
                console.log('YouTube time:', currentTime, 'duration:', duration);
            } catch (error) {
                console.warn('Error getting YouTube player time:', error);
                return;
            }
        } else if (this.currentPlayerType === 'audio' && this.audio.src) {
            // Audio player progress - loại bỏ điều kiện this.audio.duration
            currentTime = this.audio.currentTime || 0;
            duration = this.audio.duration || 0;
            console.log('Audio time:', currentTime, 'duration:', duration, 'audio.src:', this.audio.src);
            
            // Cập nhật thời gian ngay cả khi duration chưa có
            if (currentTime >= 0) {
                this.currentTimeDisplay.textContent = this.formatTime(currentTime);
            }
            
            if (duration > 0) {
                this.totalTimeDisplay.textContent = this.formatTime(duration);
            }
        } else {
            console.log('No valid player, resetting display');
            // Chỉ reset khi không có player nào active
            if (!this.isPlaying) {
                this.resetProgressDisplay();
            }
            return;
        }

        // Calculate percentage (ensure we don't divide by zero)
        if (duration > 0) {
            percentage = Math.min(100, Math.max(0, (currentTime / duration) * 100));
        }

        // Update progress bar and handle with smooth animation
        this.updateProgressDisplay(percentage, currentTime, duration);
        
        // Đồng bộ thời gian với playlist hiện tại
        this.syncTimeWithPlaylist(currentTime, duration);
    }

    updateProgressDisplay(percentage, currentTime, duration) {
        // Update progress bar width với smooth transition
        this.progress.style.width = `${percentage}%`;
        
        // Update progress handle position với smooth animation
        this.progressHandle.style.left = `${percentage}%`;
        
        // Format và update time displays - luôn update để đảm bảo hiển thị
        const formattedCurrentTime = this.formatTime(currentTime);
        const formattedDuration = this.formatTime(duration);
        
        console.log('Updating time display:', formattedCurrentTime, '/', formattedDuration);
        
        // Update time displays directly without complex animation for debugging
        this.currentTimeDisplay.textContent = formattedCurrentTime;
        
        if (duration > 0) {
            this.totalTimeDisplay.textContent = formattedDuration;
        }
        
        // Add visual feedback for progress updates
        this.addProgressUpdateFeedback(percentage, currentTime, duration);
        
        // Update document title with current track info
        this.updateDocumentTitle(currentTime, duration);
        
        // Update playlist item với current time
        this.updateActivePlaylistItemTime(currentTime, duration);
    }

    // Hàm mới để animate text changes
    animateTimeChange(element, newText) {
        // Thêm class cho animation
        element.classList.add('time-changing');
        
        // Tạo hiệu ứng fade khi đổi text
        element.style.opacity = '0.7';
        element.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            element.textContent = newText;
            element.style.opacity = '1';
            element.style.transform = 'scale(1)';
            
            // Remove animation class sau khi hoàn thành
            setTimeout(() => {
                element.classList.remove('time-changing');
            }, 300);
        }, 50);
    }

    // Đồng bộ thời gian với playlist
    syncTimeWithPlaylist(currentTime, duration) {
        const currentTrack = this.playlist[this.currentTrackIndex];
        if (currentTrack && duration > 0) {
            // Update duration nếu chưa có hoặc khác
            const newDuration = this.formatTime(duration);
            if (currentTrack.duration !== newDuration) {
                currentTrack.duration = newDuration;
                this.playlist[this.currentTrackIndex] = currentTrack;
                
                // Update playlist display với thời gian mới
                this.updatePlaylistItemDuration(this.currentTrackIndex, newDuration);
            }
            
            // Thêm class cho time sync animation
            if (this.isPlaying) {
                document.querySelector('.music-player').classList.add('time-syncing');
                setTimeout(() => {
                    document.querySelector('.music-player').classList.remove('time-syncing');
                }, 500);
            }
        }
    }

    // Update thời gian trong playlist item đang active
    updateActivePlaylistItemTime(currentTime, duration) {
        const activeItem = document.querySelector('.playlist-item.active');
        if (activeItem && duration > 0) {
            const timeInfo = activeItem.querySelector('.playlist-item-info p');
            if (timeInfo) {
                const currentTrack = this.playlist[this.currentTrackIndex];
                const progress = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
                const newText = `${currentTrack.artist} • ${progress}`;
                
                // Chỉ update nếu khác để tránh flicker
                if (!timeInfo.textContent.includes(this.formatTime(currentTime))) {
                    timeInfo.innerHTML = `${currentTrack.artist} • <span class="time-progress">${progress}</span>`;
                }
            }
        }
    }

    // Update duration của một playlist item cụ thể
    updatePlaylistItemDuration(index, newDuration) {
        const playlistItems = document.querySelectorAll('.playlist-item');
        if (playlistItems[index]) {
            const timeInfo = playlistItems[index].querySelector('.playlist-item-info p');
            if (timeInfo) {
                const track = this.playlist[index];
                if (index === this.currentTrackIndex && this.isPlaying) {
                    // Giữ nguyên format với current time cho active item
                    return;
                } else {
                    // Update static duration cho inactive items
                    timeInfo.textContent = `${track.artist} • ${newDuration}`;
                }
            }
        }
    }

    addProgressUpdateFeedback(percentage, currentTime, duration) {
        // Add subtle glow effect when progress updates với thông tin thời gian
        if (percentage > 0 && this.isPlaying) {
            // Thêm hiệu ứng glow cho progress bar
            this.progress.style.boxShadow = '0 0 15px rgba(102, 126, 234, 0.6)';
            this.progressHandle.style.boxShadow = '0 0 10px rgba(102, 126, 234, 0.8)';
            
            // Hiệu ứng pulse cho time displays
            this.currentTimeDisplay.style.color = '#667eea';
            this.totalTimeDisplay.style.color = '#667eea';
            
            // Reset effects after short delay
            setTimeout(() => {
                this.progress.style.boxShadow = 'none';
                this.progressHandle.style.boxShadow = 'none';
                this.currentTimeDisplay.style.color = '';
                this.totalTimeDisplay.style.color = '';
            }, 100);
        }
    }

    updateDocumentTitle(currentTime, duration) {
        // Update browser tab title with current track progress
        const currentTrack = this.playlist[this.currentTrackIndex];
        if (currentTrack && this.isPlaying) {
            const timeString = `${this.formatTime(currentTime)} / ${this.formatTime(duration)}`;
            document.title = `♪ ${currentTrack.title} - ${timeString}`;
        } else {
            document.title = 'Music Player Dashboard';
        }
    }

    resetProgressDisplay() {
        // Reset progress display when no track is loaded
        this.progress.style.width = '0%';
        this.progressHandle.style.left = '0%';
        
        // Animate reset với smooth transition
        this.animateTimeChange(this.currentTimeDisplay, '0:00');
        this.animateTimeChange(this.totalTimeDisplay, '0:00');
        
        document.title = 'Music Player Dashboard';
        
        // Reset active playlist item time display
        const activeItem = document.querySelector('.playlist-item.active');
        if (activeItem) {
            const timeInfo = activeItem.querySelector('.playlist-item-info p');
            if (timeInfo) {
                const currentTrack = this.playlist[this.currentTrackIndex];
                if (currentTrack) {
                    timeInfo.textContent = `${currentTrack.artist} • ${currentTrack.duration || '0:00'}`;
                }
            }
        }
    }

    updateDuration() {
        if (this.audio.duration) {
            this.totalTimeDisplay.textContent = this.formatTime(this.audio.duration);
        }
    }

    formatTime(seconds) {
        // Handle invalid values - pattern như CodePen
        if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
            return '0:00';
        }

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        // Format đơn giản như CodePen: mm:ss
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Enhanced format time với tối ưu cho hiển thị
    formatTimeForDisplay(seconds, isLive = false) {
        if (isLive) {
            return 'LIVE';
        }
        
        if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
            return '0:00';
        }

        // Cho hiển thị thời gian với format đẹp hơn
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
        } else if (minutes > 60) {
            return `${Math.floor(minutes / 60)}h ${(minutes % 60).toString().padStart(2, '0')}m`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('currentTime').textContent = time;
        
        setTimeout(() => this.updateClock(), 1000);
    }

    updateStats() {
        this.totalSongs.textContent = this.playlist.length;
        
        let totalSeconds = 0;
        this.playlist.forEach(track => {
            if (track.duration) {
                const [minutes, seconds] = track.duration.split(':').map(Number);
                totalSeconds += (minutes * 60) + seconds;
            }
        });
        
        this.totalTime.textContent = this.formatTime(totalSeconds);
    }

    showModal() {
        this.modal.style.display = 'block';
        document.getElementById('songTitle').focus();
    }

    hideModal() {
        this.modal.style.display = 'none';
        this.clearModalInputs();
    }

    clearModalInputs() {
        document.getElementById('songTitle').value = '';
        document.getElementById('songArtist').value = '';
        document.getElementById('songUrl').value = '';
        document.getElementById('songCover').value = '';
    }

    addNewSong() {
        const title = document.getElementById('songTitle').value.trim();
        const artist = document.getElementById('songArtist').value.trim();
        const url = document.getElementById('songUrl').value.trim();
        const cover = document.getElementById('songCover').value.trim();
        
        if (!title || !artist || !url) {
            alert('Vui lòng điền đầy đủ thông tin bài hát!');
            return;
        }
        
        // Validate URL
        try {
            new URL(url);
        } catch {
            alert('URL âm thanh không hợp lệ!');
            return;
        }
        
        const newTrack = {
            title,
            artist,
            url,
            cover: cover || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center',
            duration: '0:00'
        };
        
        this.playlist.push(newTrack);
        this.savePlaylist();
        this.renderPlaylist();
        this.updateStats();
        this.hideModal();
        
        // Auto-play if this is the first song
        if (this.playlist.length === 1) {
            this.playTrack(0);
        }
    }

    deleteTrack(index) {
        if (confirm('Bạn có chắc muốn xóa bài hát này?')) {
            this.playlist.splice(index, 1);
            
            if (index === this.currentTrackIndex) {
                if (this.playlist.length > 0) {
                    this.currentTrackIndex = Math.min(this.currentTrackIndex, this.playlist.length - 1);
                    this.playTrack(this.currentTrackIndex);
                } else {
                    this.audio.src = '';
                    this.trackTitle.textContent = 'Chọn bài hát để phát';
                    this.trackArtist.textContent = 'Nghệ sĩ';
                    this.albumCover.src = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
                    this.isPlaying = false;
                    this.playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    this.mainPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            } else if (index < this.currentTrackIndex) {
                this.currentTrackIndex--;
            }
            
            this.savePlaylist();
            this.renderPlaylist();
            this.updateStats();
        }
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.increaseVolume();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.decreaseVolume();
                break;
            case 'KeyM':
                e.preventDefault();
                this.toggleMute();
                break;
        }
    }

    // Load playlist từ GitHub với support cho cả YouTube và Audio
    async loadRemotePlaylist() {
        const remoteUrl = 'https://raw.githubusercontent.com/phamcongtruong/music-extension/refs/heads/main/music-list.json';
        
        try {
            console.log('Loading playlist from GitHub...');
            const response = await fetch(remoteUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const remotePlaylist = await response.json();
            console.log('Remote playlist loaded:', remotePlaylist);
            
            if (Array.isArray(remotePlaylist) && remotePlaylist.length > 0) {
                // Process remote playlist và tự động lấy metadata YouTube
                this.playlist = await Promise.all(
                    remotePlaylist.map(async (item, index) => {
                        const track = {
                            title: item.title || await this.getYouTubeTitle(item.url) || `Track ${index + 1}`,
                            artist: item.artist || "YouTube",
                            cover: item.cover || this.getYouTubeThumbnail(item.url),
                            url: item.url,
                            duration: item.duration || "0:00",
                            type: item.type || this.detectTrackType(item.url),
                            audioFallback: item.audioFallback || null,
                            originalYouTubeUrl: this.isYouTubeURL(item.url) ? item.url : null
                        };
                        
                        // Đánh dấu tất cả tracks là playable vì giờ hỗ trợ YouTube
                        track.playable = true;
                        
                        // Nếu là YouTube track, đảm bảo có type đúng
                        if (this.isYouTubeURL(item.url)) {
                            track.type = 'youtube';
                        }
                        
                        return track;
                    })
                );
                
                this.savePlaylist();
                this.renderPlaylist();
                this.updateStats();
                
                console.log('Successfully loaded', this.playlist.length, 'tracks from GitHub');
                console.log('Track types:', this.playlist.map(t => `${t.title}: ${t.type}`));
                
                // Hiển thị thông báo về YouTube tracks
                const youtubeCount = this.playlist.filter(t => t.type === 'youtube').length;
                const audioCount = this.playlist.filter(t => t.type === 'audio').length;
                
                this.showSuccessNotification(
                    `Đã tải ${this.playlist.length} bài hát (${youtubeCount} YouTube, ${audioCount} Audio). YouTube sẽ phát qua iframe.`
                );
                
                return;
            }
        } catch (error) {
            console.warn('Failed to load remote playlist:', error);
            this.showErrorNotification('Không thể tải playlist từ GitHub. Sử dụng playlist mặc định.');
        }
        
        // Fallback to enhanced local playlist
        console.log('Loading enhanced local playlist as fallback...');
        this.playlist = [
            {
                title: "Beautiful Piano Music",
                artist: "YouTube Artist",
                cover: "https://img.youtube.com/vi/nZonjKs6cTs/mqdefault.jpg",
                url: "https://www.youtube.com/watch?v=nZonjKs6cTs",
                duration: "3:24",
                type: "youtube",
                playable: true,
                audioFallback: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
                originalYouTubeUrl: "https://www.youtube.com/watch?v=nZonjKs6cTs"
            },
            {
                title: "Lofi Hip Hop - Chill Beats",
                artist: "YouTube Music",
                cover: "https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg",
                url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
                duration: "LIVE",
                type: "youtube",
                playable: true,
                audioFallback: null,
                originalYouTubeUrl: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
            },
            {
                title: "Kalimba",
                artist: "Sample Music",
                cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center",
                url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
                duration: "0:30",
                type: "audio",
                playable: true,
                audioFallback: null,
                originalYouTubeUrl: null
            }
        ];
        
        this.savePlaylist();
        this.renderPlaylist();
        this.updateStats();
        
        console.log('Successfully loaded', this.playlist.length, 'enhanced local tracks');
    }

    detectTrackType(url) {
        if (this.isYouTubeURL(url)) {
            return 'youtube';
        }
        return 'audio';
    }

    getYouTubeThumbnail(url) {
        const videoId = this.extractVideoId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 
               'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
    }

    async getYouTubeTitle(url) {
        try {
            const videoId = this.extractVideoId(url);
            if (!videoId) return null;
            
            // Thử lấy title từ YouTube oEmbed API (không cần API key)
            const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
            const response = await fetch(oembedUrl);
            
            if (response.ok) {
                const data = await response.json();
                return data.title;
            }
        } catch (error) {
            console.warn('Could not fetch YouTube title:', error);
        }
        
        return null; // Fallback sẽ sử dụng "Track N"
    }

    showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; cursor: pointer; margin-left: 10px;">×</button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(72, 187, 120, 0.95);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            z-index: 10000;
            max-width: 350px;
            animation: slideInRight 0.3s ease;
            font-size: 14px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getDefaultCover(url) {
        if (this.isYouTubeURL(url)) {
            const videoId = this.extractVideoId(url);
            return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : 
                   'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
        }
        return 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=center';
    }

    extractVideoId(url) {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)$/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
        return null;
    }

    isYouTubeURL(url) {
        if (!url) return false;
        const youtubePatterns = [
            /youtube\.com\/watch\?v=/,
            /youtu\.be\//,
            /youtube\.com\/embed\//,
            /youtube\.com\/v\//
        ];
        
        return youtubePatterns.some(pattern => pattern.test(url));
    }
}

// Global YouTube API Ready handler
let globalMusicPlayer = null;

// Initialize the music player when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    globalMusicPlayer = new MusicPlayer();
    window.musicPlayer = globalMusicPlayer; // For backward compatibility
});

// YouTube API Ready callback
window.onYouTubeIframeAPIReady = function() {
    console.log('YouTube API Ready - Global Handler');
    if (globalMusicPlayer && globalMusicPlayer.initializeYouTubePlayer) {
        globalMusicPlayer.initializeYouTubePlayer();
    }
};

// Handle extension popup close/open
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Save current state when popup is closed
        chrome.storage.local.set({
            musicPlayerState: {
                currentTrackIndex: window.musicPlayer?.currentTrackIndex || 0,
                isPlaying: window.musicPlayer?.isPlaying || false,
                volume: window.musicPlayer?.volume || 0.7,
                currentTime: window.musicPlayer?.audio?.currentTime || 0
            }
        });
    }
});
