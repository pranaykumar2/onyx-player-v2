/* ==========================================================================
   ONYX Professional Video Player - Enhanced JavaScript
   Modern Design with Premium Mobile Experience
   ========================================================================== */

'use strict';

/* ==========================================================================
   Enhanced Video Player Class
   ========================================================================== */

class ONYXEnhancedPlayer {
    constructor() {
        // Core properties
        this.player = null;
        this.video = null;
        this.isInitialized = false;
        this.isDestroyed = false;
        
        // State management
        this.state = {
            isPlaying: false,
            isLoading: false,
            isBuffering: false,
            isMuted: false,
            isFullscreen: false,
            isPictureInPicture: false,
            volume: 1.0,
            currentTime: 0,
            duration: 0,
            bufferedTime: 0,
            playbackRate: 1,
            quality: 'auto',
            brightness: 100,
            contrast: 100,
            saturation: 100
        };
        
        // UI state
        this.ui = {
            controlsVisible: true,
            controlsLocked: false,
            isDragging: false,
            isVolumeHover: false,
            activeModal: null,
            activeTab: 'video'
        };
        
        // Touch and gesture handling
        this.touch = {
            startX: 0,
            startY: 0,
            deltaX: 0,
            deltaY: 0,
            isGesturing: false,
            gestureType: null,
            lastTouchTime: 0,
            doubleTapTimeout: null
        };
        
        // Timers and intervals
        this.timers = {
            controlsHide: null,
            progressUpdate: null,
            gestureHide: null,
            loadingTimeout: null
        };
        
        // Elements cache
        this.elements = {};
        
        // Event handlers
        this.boundHandlers = {};
        
        // Settings
        this.settings = {
            controlsHideDelay: 3000,
            gestureShowDuration: 1000,
            volumeStep: 0.1,
            seekStep: 10,
            brightnessStep: 10,
            doubleTapDelay: 300,
            touchSensitivity: 2
        };
        
        // Simple retry flag
        this.isRetrying = false;

        // Initialize
        this.init();
        
        // Setup cleanup on page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /* ==========================================================================
       Cleanup Methods
       ========================================================================== */

    cleanup() {
        console.log('🧹 Cleaning up ONYX Enhanced Player...');
        
        // Clear all timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearTimeout(timer);
        });
        
        // Clean up player
        if (this.player && !this.player.isDisposed()) {
            try {
                this.player.dispose();
            } catch (error) {
                console.warn('Player disposal error:', error);
            }
        }
        
        // Mark as destroyed
        this.isDestroyed = true;
        
        console.log('✅ ONYX Player cleanup completed');
    }    /* ==========================================================================
       Initialization
       ========================================================================== */

    async init() {
        try {
            console.log('🎬 Initializing ONYX Enhanced Player...');
            
            // Wait for DOM
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Cache elements
            this.cacheElements();
            
            // Initialize Video.js
            await this.initializeVideoJS();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI components
            this.initializeUI();
            
            // Setup touch gestures for mobile
            this.setupTouchGestures();
            
            // Setup keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Initialize modals
            this.initializeModals();
            
            // Hide loading overlay
            this.hideLoadingOverlay();
            
            // Setup periodic updates
            this.startPeriodicUpdates();
            
            this.isInitialized = true;
            console.log('✅ ONYX Enhanced Player initialized successfully');
            
            // Show welcome toast
            this.showToast('Welcome to ONYX Professional Player', 'success', 'ONYX Enhanced');
            
        } catch (error) {
            console.error('❌ Failed to initialize ONYX Player:', error);
            this.showToast('Failed to initialize player', 'error', 'Initialization Error');
        }
    }

    cacheElements() {
        const selectors = {
            // Loading
            loadingOverlay: '#loadingOverlay',
            
            // Video container
            videoContainer: '#videoContainer',
            videoWrapper: '#videoWrapper',
            videoPlayer: '#videoPlayer',
            
            // Top bar
            topBar: '#topBar',
            videoTitle: '#videoTitle',
            videoMeta: '#videoMeta',
            videoQuality: '#videoQuality',
            videoFps: '#videoFps',
            videoCodec: '#videoCodec',
            topProgress: '#topProgress',
            topProgressFill: '#topProgressFill',
            
            // Video overlay
            videoOverlay: '#videoOverlay',
            loadingState: '#loadingState',
            centerPlayButton: '#centerPlayButton',
            brandWatermark: '#brandWatermark',
            
            // Gesture indicators
            gestureIndicators: '#gestureIndicators',
            volumeGesture: '#volumeGesture',
            brightnessGesture: '#brightnessGesture',
            seekGesture: '#seekGesture',
            volumeGestureValue: '#volumeGestureValue',
            brightnessGestureValue: '#brightnessGestureValue',
            seekGestureValue: '#seekGestureValue',
            
            // Skip indicators
            skipBackward: '#skipBackward',
            skipForward: '#skipForward',
            
            // Controls
            controlsBar: '#controlsBar',
            progressContainer: '#progressContainer',
            progressBuffer: '#progressBuffer',
            progressPlayed: '#progressPlayed',
            progressHandle: '#progressHandle',
            progressPreview: '#progressPreview',
            previewTime: '#previewTime',
            
            // Control buttons
            playPauseBtn: '#playPauseBtn',
            stopBtn: '#stopBtn',
            skipBackwardBtn: '#skipBackwardBtn',
            skipForwardBtn: '#skipForwardBtn',
            timeCurrent: '#timeCurrent',
            timeDuration: '#timeDuration',
            
            // Audio controls
            volumeBtn: '#volumeBtn',
            volumeControl: '#volumeControl',
            volumeFill: '#volumeFill',
            volumeHandle: '#volumeHandle',
            volumeDisplay: '#volumeDisplay',
            
            // Additional controls
            speedBtn: '#speedBtn',
            speedText: '#speedText',
            tracksBtn: '#tracksBtn',
            settingsBtn: '#settingsBtn',
            pipBtn: '#pipBtn',
            fullscreenBtn: '#fullscreenBtn',
            menuBtn: '#menuBtn',
            
            // Quality and live indicators
            liveIndicator: '#liveIndicator',
            qualityBadge: '#qualityBadge',
            qualityText: '#qualityText',
            
            // Modals
            loadVideoModal: '#loadVideoModal',
            settingsModal: '#settingsModal',
            tracksModal: '#tracksModal',
            
            // Modal elements
            videoUrlInput: '#videoUrlInput',
            videoFileInput: '#videoFileInput',
            fileInputBtn: '#fileInputBtn',
            fileName: '#fileName',
            loadVideoBtn: '#loadVideoBtn',
            
            // Settings
            settingsContent: '#settingsContent',
            tracksContent: '#tracksContent',
            
            // Context menu
            contextMenu: '#contextMenu',
            
            // Toast container
            toastContainer: '#toastContainer',
            
            // Window controls
            minimizeBtn: '#minimizeBtn',
            maximizeBtn: '#maximizeBtn',
            closeBtn: '#closeBtn'
        };

        this.elements = {};
        for (const [key, selector] of Object.entries(selectors)) {
            this.elements[key] = document.querySelector(selector);
            if (!this.elements[key] && key !== 'contextMenu') {
                console.warn(`⚠️ Element not found: ${selector}`);
            }
        }
    }

    async initializeVideoJS() {
        return new Promise((resolve, reject) => {
            try {
                // Exact configuration from your original my-design-script.js
                const options = {
                    controls: false,
                    fluid: false,
                    responsive: false,
                    fill: true,
                    preload: 'auto',
                    playsinline: true,
                    html5: {
                        vhs: {
                            overrideNative: true,
                            enableLowInitialPlaylist: true,
                            smoothQualityChange: true,
                            useBandwidthFromLocalStorage: true
                        },
                        nativeAudioTracks: true,
                        nativeVideoTracks: true,
                        nativeTextTracks: false
                    }
                };

                // Initialize Video.js exactly like your original
                this.player = videojs(this.elements.videoPlayer, options);
                
                // Cache video element (no CORS modifications)
                this.video = this.player.el().querySelector('video');
                
                // Setup Video.js events
                this.setupVideoJSEvents();
                
                // Player ready callback
                this.player.ready(() => {
                    console.log('📹 Video.js player ready');
                    
                    // Apply initial settings
                    this.applyInitialSettings();
                    
                    // Expose player globally for debugging
                    window.onyxPlayer = this.player;
                    window.onyxEnhanced = this;
                    
                    resolve();
                });

            } catch (error) {
                console.error('❌ Video.js initialization failed:', error);
                reject(error);
            }
        });
    }

    setupEnhancedErrorHandling() {
        this.player.on('error', () => {
            const error = this.player.error();
            if (error) {
                console.error('📺 Video.js error:', error);
                
                // Enhanced CORS error detection
                if (this.isCorsError(error)) {
                    console.warn('🚫 CORS error detected, attempting alternative loading methods...');
                    this.showToast(
                        'Video blocked by CORS policy. Trying alternative methods...', 
                        'warning', 
                        'CORS Issue'
                    );
                    
                    // Attempt to reload with enhanced CORS handling
                    const currentSrc = this.player.currentSrc();
                    if (currentSrc && !this.isRetrying) {
                        this.isRetrying = true;
                        // Simple retry with the same URL
                        setTimeout(() => {
                            const type = this.detectVideoType(currentSrc);
                            const title = this.extractVideoTitle(currentSrc);
                            console.log('🔄 Retrying video load...');
                            this.player.src({ src: currentSrc, type });
                        }, 1000);
                    }
                } else {
                    // Handle other types of errors with enhanced messaging
                    this.handleEnhancedVideoError(error);
                }
            }
        });

        // Additional error event handlers
        this.player.on('loadstart', () => {
            this.isRetrying = false; // Reset retry flag on new load
        });
    }

    isCorsError(error) {
        if (!error) return false;
        
        const corsIndicators = [
            'cors',
            'cross-origin',
            'access-control-allow-origin',
            'network error',
            'fetch error',
            'preflight',
            'opaque response',
            'blocked by cors policy'
        ];
        
        const errorMessage = (error.message || '').toLowerCase();
        const errorCode = error.code;
        
        // MediaError codes that often indicate CORS issues
        if (errorCode === 2 || errorCode === 4) return true;
        
        return corsIndicators.some(indicator => errorMessage.includes(indicator));
    }

    handleEnhancedVideoError(error) {
        const errorMessages = {
            1: 'Video loading was aborted by user or browser',
            2: 'Network error prevented video download - check connection or CORS policy',
            3: 'Video decoding failed - file may be corrupted or format unsupported',
            4: 'Video format not supported or blocked by CORS policy'
        };
        
        const message = errorMessages[error.code] || `Unknown video error (code: ${error.code})`;
        console.error(`📺 Enhanced video error (${error.code}):`, message);
        
        // Provide helpful suggestions based on error type
        let suggestion = '';
        if (error.code === 2 || error.code === 4) {
            suggestion = ' Try using a different video source or check CORS headers.';
        } else if (error.code === 3) {
            suggestion = ' Try a different video format (MP4, WebM, or HLS).';
        }
        
        this.showToast(message + suggestion, 'error', 'Video Error');
        this.hideLoadingState();
        this.onError(error);
    }

    setupVideoJSEvents() {
        // Playback events
        this.player.on('loadstart', () => this.onLoadStart());
        this.player.on('loadedmetadata', () => this.onLoadedMetadata());
        this.player.on('canplay', () => this.onCanPlay());
        this.player.on('canplaythrough', () => this.onCanPlayThrough());
        this.player.on('play', () => this.onPlay());
        this.player.on('pause', () => this.onPause());
        this.player.on('ended', () => this.onEnded());
        this.player.on('waiting', () => this.onWaiting());
        this.player.on('playing', () => this.onPlaying());
        this.player.on('timeupdate', () => this.onTimeUpdate());
        this.player.on('progress', () => this.onProgress());
        this.player.on('durationchange', () => this.onDurationChange());
        this.player.on('volumechange', () => this.onVolumeChange());
        this.player.on('ratechange', () => this.onRateChange());
        this.player.on('seeked', () => this.onSeeked());
        this.player.on('seeking', () => this.onSeeking());
        
        // Quality and tracks
        this.player.on('resolutionchange', () => this.onResolutionChange());
        this.player.on('audiotrackchange', () => this.onAudioTrackChange());
        this.player.on('texttrackchange', () => this.onTextTrackChange());
        
        // Error handling
        this.player.on('error', (error) => this.onError(error));
        
        // Fullscreen events
        this.player.on('fullscreenchange', () => this.onFullscreenChange());
        
        // HLS/DASH specific events
        if (this.player.tech().vhs) {
            this.player.tech().vhs.on('usage', (event) => {
                console.log('📊 VHS Usage:', event);
            });
        }
    }

    /* ==========================================================================
       Event Handlers Setup
       ========================================================================== */

    setupEventListeners() {
        // Bind handlers for later removal
        this.boundHandlers = {
            handleKeyDown: this.handleKeyDown.bind(this),
            handleMouseMove: this.handleMouseMove.bind(this),
            handleMouseLeave: this.handleMouseLeave.bind(this),
            handleClick: this.handleClick.bind(this),
            handleDoubleClick: this.handleDoubleClick.bind(this),
            handleContextMenu: this.handleContextMenu.bind(this),
            handleResize: this.debounce(this.handleResize.bind(this), 250),
            handleVisibilityChange: this.handleVisibilityChange.bind(this),
            handleFullscreenChange: this.handleFullscreenChange.bind(this),
            handleBeforeUnload: this.handleBeforeUnload.bind(this)
        };

        // Document events
        document.addEventListener('keydown', this.boundHandlers.handleKeyDown);
        document.addEventListener('visibilitychange', this.boundHandlers.handleVisibilityChange);
        document.addEventListener('fullscreenchange', this.boundHandlers.handleFullscreenChange);
        
        // Window events
        window.addEventListener('resize', this.boundHandlers.handleResize);
        window.addEventListener('beforeunload', this.boundHandlers.handleBeforeUnload);
        
        // Video container events
        if (this.elements.videoContainer) {
            this.elements.videoContainer.addEventListener('mousemove', this.boundHandlers.handleMouseMove);
            this.elements.videoContainer.addEventListener('mouseleave', this.boundHandlers.handleMouseLeave);
            this.elements.videoContainer.addEventListener('click', this.boundHandlers.handleClick);
            this.elements.videoContainer.addEventListener('dblclick', this.boundHandlers.handleDoubleClick);
            this.elements.videoContainer.addEventListener('contextmenu', this.boundHandlers.handleContextMenu);
        }

        // Control button events
        this.setupControlButtons();
        
        // Progress bar events
        this.setupProgressBar();
        
        // Volume control events
        this.setupVolumeControl();
        
        // Modal events
        this.setupModalEvents();
        
        // Window control events
        this.setupWindowControls();
    }

    setupControlButtons() {
        // Play/Pause button
        if (this.elements.playPauseBtn) {
            this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        }
        
        // Center play button
        if (this.elements.centerPlayButton) {
            this.elements.centerPlayButton.addEventListener('click', () => this.togglePlayPause());
        }
        
        // Stop button
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stop());
        }
        
        // Skip buttons
        if (this.elements.skipBackwardBtn) {
            this.elements.skipBackwardBtn.addEventListener('click', () => this.skipBackward());
        }
        
        if (this.elements.skipForwardBtn) {
            this.elements.skipForwardBtn.addEventListener('click', () => this.skipForward());
        }
        
        // Volume button
        if (this.elements.volumeBtn) {
            this.elements.volumeBtn.addEventListener('click', () => this.toggleMute());
        }
        
        // Speed button
        if (this.elements.speedBtn) {
            this.elements.speedBtn.addEventListener('click', (e) => this.showSpeedMenu(e));
        }
        
        // Tracks button
        if (this.elements.tracksBtn) {
            this.elements.tracksBtn.addEventListener('click', () => this.showModal('tracks'));
        }
        
        // Settings button
        if (this.elements.settingsBtn) {
            this.elements.settingsBtn.addEventListener('click', () => this.showModal('settings'));
        }
        
        // PiP button
        if (this.elements.pipBtn) {
            this.elements.pipBtn.addEventListener('click', () => this.togglePictureInPicture());
        }
        
        // Fullscreen button
        if (this.elements.fullscreenBtn) {
            this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        }
        
        // Menu button
        if (this.elements.menuBtn) {
            this.elements.menuBtn.addEventListener('click', () => this.showModal('loadVideo'));
        }
    }

    setupProgressBar() {
        if (!this.elements.progressContainer) return;

        // Click to seek
        this.elements.progressContainer.addEventListener('click', (e) => {
            if (!this.ui.isDragging) {
                this.seekToPosition(e);
            }
        });

        // Drag to seek
        this.elements.progressContainer.addEventListener('mousedown', (e) => {
            this.startProgressDrag(e);
        });

        document.addEventListener('mousemove', (e) => {
            if (this.ui.isDragging) {
                this.updateProgressDrag(e);
            }
        });

        document.addEventListener('mouseup', () => {
            if (this.ui.isDragging) {
                this.endProgressDrag();
            }
        });

        // Preview on hover
        this.elements.progressContainer.addEventListener('mousemove', (e) => {
            this.updateProgressPreview(e);
        });

        this.elements.progressContainer.addEventListener('mouseleave', () => {
            this.hideProgressPreview();
        });
    }

    setupVolumeControl() {
        if (!this.elements.volumeControl) return;

        // Show volume slider on hover
        this.elements.volumeControl.addEventListener('mouseenter', () => {
            this.ui.isVolumeHover = true;
        });

        this.elements.volumeControl.addEventListener('mouseleave', () => {
            this.ui.isVolumeHover = false;
        });

        // Volume slider interaction
        if (this.elements.volumeHandle) {
            let isDraggingVolume = false;

            const startVolumeDrag = (e) => {
                isDraggingVolume = true;
                this.updateVolumeFromEvent(e);
                e.preventDefault();
            };

            const updateVolumeDrag = (e) => {
                if (isDraggingVolume) {
                    this.updateVolumeFromEvent(e);
                }
            };

            const endVolumeDrag = () => {
                isDraggingVolume = false;
            };

            this.elements.volumeControl.addEventListener('mousedown', startVolumeDrag);
            document.addEventListener('mousemove', updateVolumeDrag);
            document.addEventListener('mouseup', endVolumeDrag);
        }
    }

    /* ==========================================================================
       Touch Gesture System
       ========================================================================== */

    setupTouchGestures() {
        if (!this.elements.videoWrapper) return;

        let touchStartTime = 0;
        let lastTap = 0;

        // Touch start
        this.elements.videoWrapper.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            touchStartTime = Date.now();
            
            this.touch.startX = touch.clientX;
            this.touch.startY = touch.clientY;
            this.touch.isGesturing = false;
            this.touch.gestureType = null;
            
            // Double tap detection
            const currentTime = Date.now();
            const tapDelay = currentTime - lastTap;
            
            if (tapDelay < this.settings.doubleTapDelay && tapDelay > 0) {
                this.handleDoubleTap(e);
                lastTap = 0;
            } else {
                lastTap = currentTime;
            }
            
            this.showControls();
        }, { passive: false });

        // Touch move
        this.elements.videoWrapper.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];
            this.touch.deltaX = touch.clientX - this.touch.startX;
            this.touch.deltaY = touch.clientY - this.touch.startY;

            const deltaX = Math.abs(this.touch.deltaX);
            const deltaY = Math.abs(this.touch.deltaY);

            // Determine gesture type
            if (!this.touch.isGesturing && (deltaX > 10 || deltaY > 10)) {
                this.touch.isGesturing = true;
                
                if (deltaX > deltaY) {
                    // Horizontal swipe - seeking
                    this.touch.gestureType = 'seek';
                } else {
                    // Vertical swipe - volume or brightness
                    const screenWidth = window.innerWidth;
                    if (touch.clientX < screenWidth / 2) {
                        this.touch.gestureType = 'brightness';
                    } else {
                        this.touch.gestureType = 'volume';
                    }
                }
            }

            // Handle gesture
            if (this.touch.isGesturing) {
                e.preventDefault();
                this.handleTouchGesture();
            }
        }, { passive: false });

        // Touch end
        this.elements.videoWrapper.addEventListener('touchend', (e) => {
            const touchDuration = Date.now() - touchStartTime;
            
            if (this.touch.isGesturing) {
                this.hideGestureIndicators();
            } else if (touchDuration < 300 && !this.touch.isGesturing) {
                // Single tap - toggle controls
                this.toggleControlsVisibility();
            }
            
            this.touch.isGesturing = false;
            this.touch.gestureType = null;
        }, { passive: true });
    }

    handleTouchGesture() {
        const { gestureType, deltaX, deltaY } = this.touch;
        const sensitivity = this.settings.touchSensitivity;

        switch (gestureType) {
            case 'seek':
                this.handleSeekGesture(deltaX / sensitivity);
                break;
            case 'volume':
                this.handleVolumeGesture(-deltaY / sensitivity);
                break;
            case 'brightness':
                this.handleBrightnessGesture(-deltaY / sensitivity);
                break;
        }
    }

    handleSeekGesture(delta) {
        const seekAmount = Math.floor(delta / 10) * this.settings.seekStep;
        const newTime = Math.max(0, Math.min(this.state.duration, this.state.currentTime + seekAmount));
        
        this.showGestureIndicator('seek', `${seekAmount > 0 ? '+' : ''}${seekAmount}s`);
        
        // Preview seek without actually seeking until gesture ends
        this.updateSeekPreview(newTime);
    }

    handleVolumeGesture(delta) {
        const volumeChange = delta / 100;
        const newVolume = Math.max(0, Math.min(1, this.state.volume + volumeChange));
        
        this.setVolume(newVolume);
        this.showGestureIndicator('volume', `${Math.round(newVolume * 100)}%`);
    }

    handleBrightnessGesture(delta) {
        const brightnessChange = delta / 2;
        const newBrightness = Math.max(50, Math.min(150, this.state.brightness + brightnessChange));
        
        this.setBrightness(newBrightness);
        this.showGestureIndicator('brightness', `${Math.round(newBrightness)}%`);
    }

    handleDoubleTap(e) {
        const touch = e.touches[0];
        const screenWidth = window.innerWidth;
        const tapX = touch.clientX;
        
        if (tapX < screenWidth * 0.3) {
            // Double tap left - skip backward
            this.skipBackward();
            this.showSkipIndicator('backward');
        } else if (tapX > screenWidth * 0.7) {
            // Double tap right - skip forward
            this.skipForward();
            this.showSkipIndicator('forward');
        } else {
            // Double tap center - toggle play/pause
            this.togglePlayPause();
        }
    }

    showGestureIndicator(type, value) {
        const indicators = {
            seek: this.elements.seekGesture,
            volume: this.elements.volumeGesture,
            brightness: this.elements.brightnessGesture
        };

        const valueElements = {
            seek: this.elements.seekGestureValue,
            volume: this.elements.volumeGestureValue,
            brightness: this.elements.brightnessGestureValue
        };

        const indicator = indicators[type];
        const valueElement = valueElements[type];

        if (indicator && valueElement) {
            valueElement.textContent = value;
            indicator.classList.add('visible');
            
            this.clearTimer('gestureHide');
            this.timers.gestureHide = setTimeout(() => {
                this.hideGestureIndicators();
            }, this.settings.gestureShowDuration);
        }
    }

    hideGestureIndicators() {
        const indicators = [
            this.elements.seekGesture,
            this.elements.volumeGesture,
            this.elements.brightnessGesture
        ];

        indicators.forEach(indicator => {
            if (indicator) {
                indicator.classList.remove('visible');
            }
        });
    }

    showSkipIndicator(direction) {
        const indicator = direction === 'backward' ? 
            this.elements.skipBackward : 
            this.elements.skipForward;

        if (indicator) {
            indicator.classList.add('visible');
            setTimeout(() => {
                indicator.classList.remove('visible');
            }, 600);
        }
    }

    /* ==========================================================================
       Keyboard Shortcuts
       ========================================================================== */

    setupKeyboardShortcuts() {
        // Keyboard shortcuts are handled in handleKeyDown
        console.log('⌨️ Keyboard shortcuts initialized');
    }

    handleKeyDown(e) {
        // Don't handle shortcuts when typing in inputs or modals are open
        if (this.isTypingInInput(e.target) || this.ui.activeModal) {
            return;
        }

        const { code, ctrlKey, altKey, shiftKey } = e;

        // Handle shortcuts
        switch (code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;

            case 'KeyK':
                e.preventDefault();
                this.togglePlayPause();
                break;

            case 'ArrowLeft':
                e.preventDefault();
                if (shiftKey) {
                    this.skipBackward(30); // 30 seconds
                } else {
                    this.skipBackward(); // 10 seconds
                }
                break;

            case 'ArrowRight':
                e.preventDefault();
                if (shiftKey) {
                    this.skipForward(30);
                } else {
                    this.skipForward();
                }
                break;

            case 'ArrowUp':
                e.preventDefault();
                this.adjustVolume(this.settings.volumeStep);
                break;

            case 'ArrowDown':
                e.preventDefault();
                this.adjustVolume(-this.settings.volumeStep);
                break;

            case 'KeyM':
                e.preventDefault();
                this.toggleMute();
                break;

            case 'KeyF':
                e.preventDefault();
                this.toggleFullscreen();
                break;

            case 'KeyP':
                e.preventDefault();
                this.togglePictureInPicture();
                break;

            case 'KeyC':
                e.preventDefault();
                this.toggleControlsLock();
                break;

            case 'Escape':
                e.preventDefault();
                if (this.state.isFullscreen) {
                    this.exitFullscreen();
                } else if (this.ui.activeModal) {
                    this.hideModal();
                }
                break;

            case 'Digit0':
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
            case 'Digit9':
                e.preventDefault();
                const percentage = parseInt(code.slice(-1)) * 10;
                this.seekToPercentage(percentage);
                break;

            case 'Home':
                e.preventDefault();
                this.seekToTime(0);
                break;

            case 'End':
                e.preventDefault();
                this.seekToTime(this.state.duration);
                break;

            case 'Comma':
                e.preventDefault();
                this.adjustPlaybackRate(-0.25);
                break;

            case 'Period':
                e.preventDefault();
                this.adjustPlaybackRate(0.25);
                break;

            case 'KeyO':
                if (ctrlKey) {
                    e.preventDefault();
                    this.showModal('loadVideo');
                }
                break;

            case 'KeyS':
                if (ctrlKey) {
                    e.preventDefault();
                    this.showModal('settings');
                }
                break;
        }
    }

    isTypingInInput(element) {
        const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
        return inputTypes.includes(element.tagName) || element.contentEditable === 'true';
    }

    /* ==========================================================================
       Video.js Event Handlers
       ========================================================================== */

    onLoadStart() {
        console.log('📥 Load start');
        this.setState({ isLoading: true });
        this.showLoadingState();
        this.updateVideoInfo();
    }

    onLoadedMetadata() {
        console.log('📊 Metadata loaded');
        this.setState({ 
            duration: this.player.duration() || 0 
        });
        this.updateDuration();
        this.detectTracks();
        this.updateVideoInfo();
    }

    onCanPlay() {
        console.log('▶️ Can play');
        this.setState({ isLoading: false });
        this.hideLoadingState();
    }

    onCanPlayThrough() {
        console.log('⚡ Can play through');
    }

    onPlay() {
        console.log('▶️ Playing');
        this.setState({ isPlaying: true });
        this.updatePlayPauseButton();
        this.hideCenterPlayButton();
        this.startControlsAutoHide();
    }

    onPause() {
        console.log('⏸️ Paused');
        this.setState({ isPlaying: false });
        this.updatePlayPauseButton();
        this.showCenterPlayButton();
        this.stopControlsAutoHide();
        this.showControls();
    }

    onEnded() {
        console.log('🏁 Ended');
        this.setState({ isPlaying: false });
        this.updatePlayPauseButton();
        this.showCenterPlayButton();
        this.showControls();
        this.seekToTime(0);
    }

    onWaiting() {
        console.log('⏳ Buffering');
        this.setState({ isBuffering: true });
        this.showLoadingState();
    }

    onPlaying() {
        console.log('▶️ Playing after buffer');
        this.setState({ isBuffering: false });
        this.hideLoadingState();
    }

    onTimeUpdate() {
        if (!this.ui.isDragging) {
            const currentTime = this.player.currentTime() || 0;
            this.setState({ currentTime });
            this.updateProgress();
            this.updateTopProgress();
        }
    }

    onProgress() {
        this.updateBufferedProgress();
    }

    onDurationChange() {
        const duration = this.player.duration() || 0;
        this.setState({ duration });
        this.updateDuration();
    }

    onVolumeChange() {
        const volume = this.player.volume();
        const muted = this.player.muted();
        
        this.setState({ 
            volume: muted ? 0 : volume,
            isMuted: muted 
        });
        
        this.updateVolumeUI();
    }

    onRateChange() {
        const playbackRate = this.player.playbackRate();
        this.setState({ playbackRate });
        this.updateSpeedDisplay();
    }

    onSeeked() {
        console.log('⏭️ Seeked');
        this.hideSkipIndicators();
    }

    onSeeking() {
        console.log('⏭️ Seeking');
    }

    onResolutionChange() {
        console.log('📺 Resolution changed');
        this.updateQualityDisplay();
    }

    onAudioTrackChange() {
        console.log('🔊 Audio track changed');
        this.updateTracksUI();
    }

    onTextTrackChange() {
        console.log('💬 Text track changed');
        this.updateTracksUI();
    }

    onError(error) {
        console.error('❌ Video error:', error);
        this.setState({ isLoading: false, isBuffering: false });
        this.hideLoadingState();
        
        // Check if it's a CORS error
        const playerError = this.player.error();
        if (playerError && (playerError.code === 2 || playerError.code === 4)) {
            const currentSrc = this.player.currentSrc();
            if (currentSrc && (currentSrc.includes('seedr.cc') || currentSrc.includes('rd10.seedr') || currentSrc.includes('rd11.seedr'))) {
                this.showToast(
                    'CORS error with Seedr link. For testing, try: Chrome with --disable-web-security --user-data-dir=/tmp/chrome_dev_test', 
                    'warning', 
                    'CORS Issue',
                    8000
                );
            } else {
                this.showToast('Video playback error occurred', 'error', 'Playback Error');
            }
        } else {
            this.showToast('Video playback error occurred', 'error', 'Playback Error');
        }
    }

    onFullscreenChange() {
        const isFullscreen = !!document.fullscreenElement;
        this.setState({ isFullscreen });
        this.updateFullscreenButton();
        
        if (isFullscreen) {
            this.elements.videoContainer?.classList.add('fullscreen');
        } else {
            this.elements.videoContainer?.classList.remove('fullscreen');
        }
    }

    /* ==========================================================================
       Player Control Methods
       ========================================================================== */

    async togglePlayPause() {
        try {
            if (this.state.isPlaying) {
                await this.player.pause();
            } else {
                await this.player.play();
            }
        } catch (error) {
            console.error('❌ Play/pause error:', error);
            this.showToast('Playback control failed', 'error', 'Control Error');
        }
    }

    stop() {
        this.player.pause();
        this.seekToTime(0);
        this.showToast('Playback stopped', 'info', 'Player');
    }

    skipBackward(seconds = this.settings.seekStep) {
        const newTime = Math.max(0, this.state.currentTime - seconds);
        this.seekToTime(newTime);
        this.showSkipIndicator('backward');
        this.showToast(`Skipped back ${seconds}s`, 'info', 'Seek');
    }

    skipForward(seconds = this.settings.seekStep) {
        const newTime = Math.min(this.state.duration, this.state.currentTime + seconds);
        this.seekToTime(newTime);
        this.showSkipIndicator('forward');
        this.showToast(`Skipped forward ${seconds}s`, 'info', 'Seek');
    }

    seekToTime(time) {
        if (isFinite(time) && time >= 0) {
            this.player.currentTime(time);
            this.setState({ currentTime: time });
            this.updateProgress();
        }
    }

    seekToPercentage(percentage) {
        const time = (percentage / 100) * this.state.duration;
        this.seekToTime(time);
        this.showToast(`Seeked to ${percentage}%`, 'info', 'Seek');
    }

    setVolume(volume) {
        volume = Math.max(0, Math.min(1, volume));
        this.player.volume(volume);
        this.player.muted(volume === 0);
        this.setState({ 
            volume,
            isMuted: volume === 0 
        });
        this.updateVolumeUI();
    }

    adjustVolume(delta) {
        const newVolume = this.state.volume + delta;
        this.setVolume(newVolume);
        this.showToast(`Volume: ${Math.round(newVolume * 100)}%`, 'info', 'Audio');
    }

    toggleMute() {
        const wasMuted = this.state.isMuted;
        this.player.muted(!wasMuted);
        this.setState({ isMuted: !wasMuted });
        this.updateVolumeUI();
        this.showToast(wasMuted ? 'Unmuted' : 'Muted', 'info', 'Audio');
    }

    adjustPlaybackRate(delta) {
        const newRate = Math.max(0.25, Math.min(4, this.state.playbackRate + delta));
        this.player.playbackRate(newRate);
        this.setState({ playbackRate: newRate });
        this.updateSpeedDisplay();
        this.showToast(`Speed: ${newRate}×`, 'info', 'Playback');
    }

    setBrightness(brightness) {
        brightness = Math.max(50, Math.min(150, brightness));
        this.setState({ brightness });
        this.applyVideoFilters();
    }

    setContrast(contrast) {
        contrast = Math.max(50, Math.min(150, contrast));
        this.setState({ contrast });
        this.applyVideoFilters();
    }

    setSaturation(saturation) {
        saturation = Math.max(0, Math.min(200, saturation));
        this.setState({ saturation });
        this.applyVideoFilters();
    }

    applyVideoFilters() {
        if (this.video) {
            const { brightness, contrast, saturation } = this.state;
            const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            this.video.style.filter = filterString;
        }
    }

    async toggleFullscreen() {
        try {
            if (this.state.isFullscreen) {
                await this.exitFullscreen();
            } else {
                await this.enterFullscreen();
            }
        } catch (error) {
            console.error('❌ Fullscreen error:', error);
            this.showToast('Fullscreen toggle failed', 'error', 'Display');
        }
    }

    async enterFullscreen() {
        if (this.elements.videoContainer?.requestFullscreen) {
            await this.elements.videoContainer.requestFullscreen();
        }
    }

    async exitFullscreen() {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        }
    }

    async togglePictureInPicture() {
        try {
            if (this.state.isPictureInPicture) {
                await document.exitPictureInPicture();
            } else {
                await this.video.requestPictureInPicture();
            }
            
            this.setState({ 
                isPictureInPicture: !this.state.isPictureInPicture 
            });
            
            this.showToast(
                this.state.isPictureInPicture ? 'Picture-in-Picture enabled' : 'Picture-in-Picture disabled',
                'info',
                'Display'
            );
        } catch (error) {
            console.error('❌ Picture-in-Picture error:', error);
            this.showToast('Picture-in-Picture not supported', 'warning', 'Display');
        }
    }

    /* ==========================================================================
       UI Update Methods
       ========================================================================== */

    updatePlayPauseButton() {
        const playIcon = this.elements.playPauseBtn?.querySelector('.play-icon');
        const pauseIcon = this.elements.playPauseBtn?.querySelector('.pause-icon');

        if (playIcon && pauseIcon) {
            if (this.state.isPlaying) {
                playIcon.style.display = 'none';
                pauseIcon.style.display = 'block';
            } else {
                playIcon.style.display = 'block';
                pauseIcon.style.display = 'none';
            }
        }
    }

    updateProgress() {
        if (!this.elements.progressPlayed || !this.state.duration) return;

        const percentage = (this.state.currentTime / this.state.duration) * 100;
        this.elements.progressPlayed.style.width = `${percentage}%`;
        
        if (this.elements.progressHandle) {
            this.elements.progressHandle.style.left = `${percentage}%`;
        }

        this.updateTimeDisplay();
    }

    updateBufferedProgress() {
        if (!this.elements.progressBuffer || !this.player) return;

        const buffered = this.player.buffered();
        if (buffered.length > 0) {
            const bufferedEnd = buffered.end(buffered.length - 1);
            const percentage = (bufferedEnd / this.state.duration) * 100;
            this.elements.progressBuffer.style.width = `${percentage}%`;
        }
    }

    updateTopProgress() {
        if (!this.elements.topProgressFill || !this.state.duration) return;

        const percentage = (this.state.currentTime / this.state.duration) * 100;
        this.elements.topProgressFill.style.width = `${percentage}%`;
    }

    updateTimeDisplay() {
        if (this.elements.timeCurrent) {
            this.elements.timeCurrent.textContent = this.formatTime(this.state.currentTime);
        }
        
        if (this.elements.timeDuration) {
            this.elements.timeDuration.textContent = this.formatTime(this.state.duration);
        }
    }

    updateDuration() {
        if (this.elements.timeDuration) {
            this.elements.timeDuration.textContent = this.formatTime(this.state.duration);
        }
    }

    updateVolumeUI() {
        // Update volume slider
        if (this.elements.volumeFill) {
            const percentage = this.state.isMuted ? 0 : this.state.volume * 100;
            this.elements.volumeFill.style.width = `${percentage}%`;
        }

        // Update volume handle
        if (this.elements.volumeHandle) {
            const percentage = this.state.isMuted ? 0 : this.state.volume * 100;
            this.elements.volumeHandle.style.left = `${percentage}%`;
        }

        // Update volume display
        if (this.elements.volumeDisplay) {
            const percentage = this.state.isMuted ? 0 : Math.round(this.state.volume * 100);
            this.elements.volumeDisplay.textContent = `${percentage}%`;
        }

        // Update volume button icon
        this.updateVolumeIcon();
    }

    updateVolumeIcon() {
        if (!this.elements.volumeBtn) return;

        const icon = this.elements.volumeBtn.querySelector('.volume-icon');
        if (!icon) return;

        const volume = this.state.isMuted ? 0 : this.state.volume;
        const wave1 = icon.querySelector('.volume-wave-1');
        const wave2 = icon.querySelector('.volume-wave-2');

        if (volume === 0) {
            this.elements.volumeBtn.classList.add('muted');
            if (wave1) wave1.style.opacity = '0.3';
            if (wave2) wave2.style.opacity = '0.3';
        } else {
            this.elements.volumeBtn.classList.remove('muted');
            if (wave1) wave1.style.opacity = volume > 0.3 ? '1' : '0.5';
            if (wave2) wave2.style.opacity = volume > 0.6 ? '1' : '0.3';
        }
    }

    updateSpeedDisplay() {
        if (this.elements.speedText) {
            this.elements.speedText.textContent = `${this.state.playbackRate}×`;
        }
    }

    updateQualityDisplay() {
        if (this.elements.qualityText) {
            // Try to get current quality from Video.js
            const tech = this.player.tech();
            if (tech && tech.vhs) {
                const currentRendition = tech.vhs.playlists.media();
                if (currentRendition) {
                    const height = currentRendition.attributes?.RESOLUTION?.height;
                    this.elements.qualityText.textContent = height ? `${height}p` : 'AUTO';
                }
            }
        }
    }

    updateFullscreenButton() {
        const expandIcon = this.elements.fullscreenBtn?.querySelector('.expand-icon');
        const compressIcon = this.elements.fullscreenBtn?.querySelector('.compress-icon');

        if (expandIcon && compressIcon) {
            if (this.state.isFullscreen) {
                expandIcon.style.display = 'none';
                compressIcon.style.display = 'block';
            } else {
                expandIcon.style.display = 'block';
                compressIcon.style.display = 'none';
            }
        }
    }

    updateVideoInfo() {
        // Update video title from metadata or URL
        this.updateVideoTitle();
        
        // Update video metadata display
        this.updateVideoMetadata();
    }

    updateVideoTitle() {
        if (!this.elements.videoTitle) return;

        let title = '';
        
        // Try to get title from video metadata
        if (this.video && this.video.src) {
            try {
                const url = new URL(this.video.src);
                const pathname = url.pathname;
                const filename = pathname.split('/').pop();
                
                if (filename) {
                    title = filename
                        .replace(/\.[^/.]+$/, '') // Remove extension
                        .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
                        .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
                }
            } catch (e) {
                title = 'Video Stream';
            }
        }

        if (title) {
            this.elements.videoTitle.textContent = title;
            this.elements.videoTitle.style.display = 'block';
        } else {
            this.elements.videoTitle.style.display = 'none';
        }
    }

    updateVideoMetadata() {
        if (this.video) {
            // Update quality
            if (this.elements.videoQuality) {
                this.elements.videoQuality.textContent = this.video.videoHeight ? 
                    `${this.video.videoHeight}p` : '';
            }

            // Update FPS (if available)
            if (this.elements.videoFps) {
                this.elements.videoFps.textContent = ''; // FPS not easily available
            }

            // Update codec (simplified)
            if (this.elements.videoCodec) {
                this.elements.videoCodec.textContent = 'H.264'; // Default assumption
            }
        }
    }

    /* ==========================================================================
       Controls Visibility
       ========================================================================== */

    showControls() {
        if (this.elements.topBar) {
            this.elements.topBar.style.opacity = '1';
            this.elements.topBar.style.transform = 'translateY(0)';
        }

        if (this.elements.controlsBar) {
            this.elements.controlsBar.style.opacity = '1';
            this.elements.controlsBar.style.transform = 'translateY(0)';
        }

        this.ui.controlsVisible = true;
        this.restartControlsAutoHide();
    }

    hideControls() {
        if (!this.ui.controlsLocked && this.state.isPlaying) {
            if (this.elements.topBar) {
                this.elements.topBar.style.opacity = '0';
                this.elements.topBar.style.transform = 'translateY(-100%)';
            }

            if (this.elements.controlsBar) {
                this.elements.controlsBar.style.opacity = '0';
                this.elements.controlsBar.style.transform = 'translateY(100%)';
            }

            this.ui.controlsVisible = false;
        }
    }

    toggleControlsVisibility() {
        if (this.ui.controlsVisible) {
            this.hideControls();
        } else {
            this.showControls();
        }
    }

    toggleControlsLock() {
        this.ui.controlsLocked = !this.ui.controlsLocked;
        
        if (this.ui.controlsLocked) {
            this.elements.videoContainer?.classList.add('controls-locked');
            this.showControls();
            this.showToast('Controls locked', 'info', 'Interface');
        } else {
            this.elements.videoContainer?.classList.remove('controls-locked');
            this.showToast('Controls unlocked', 'info', 'Interface');
        }
    }

    startControlsAutoHide() {
        this.clearTimer('controlsHide');
        
        if (this.state.isPlaying && !this.ui.controlsLocked) {
            this.timers.controlsHide = setTimeout(() => {
                this.hideControls();
            }, this.settings.controlsHideDelay);
        }
    }

    stopControlsAutoHide() {
        this.clearTimer('controlsHide');
    }

    restartControlsAutoHide() {
        this.stopControlsAutoHide();
        this.startControlsAutoHide();
    }

    showCenterPlayButton() {
        if (this.elements.centerPlayButton) {
            this.elements.centerPlayButton.style.display = 'flex';
        }
        
        if (this.elements.brandWatermark) {
            this.elements.brandWatermark.style.opacity = '0.6';
        }
    }

    hideCenterPlayButton() {
        if (this.elements.centerPlayButton) {
            this.elements.centerPlayButton.style.display = 'none';
        }
        
        if (this.elements.brandWatermark) {
            this.elements.brandWatermark.style.opacity = '0.3';
        }
    }

    showLoadingState() {
        if (this.elements.loadingState) {
            this.elements.loadingState.classList.add('visible');
        }
        
        this.hideCenterPlayButton();
    }

    hideLoadingState() {
        if (this.elements.loadingState) {
            this.elements.loadingState.classList.remove('visible');
        }
        
        if (!this.state.isPlaying) {
            this.showCenterPlayButton();
        }
    }

    /* ==========================================================================
       Progress Bar Interaction
       ========================================================================== */

    seekToPosition(e) {
        if (!this.state.duration) return;

        const rect = this.elements.progressContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * this.state.duration;

        this.seekToTime(time);
    }

    startProgressDrag(e) {
        this.ui.isDragging = true;
        this.seekToPosition(e);
        e.preventDefault();
    }

    updateProgressDrag(e) {
        if (this.ui.isDragging) {
            this.seekToPosition(e);
        }
    }

    endProgressDrag() {
        this.ui.isDragging = false;
    }

    updateProgressPreview(e) {
        if (!this.elements.progressPreview || !this.state.duration) return;

        const rect = this.elements.progressContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        const time = percentage * this.state.duration;

        // Position preview
        this.elements.progressPreview.style.left = `${x}px`;
        
        // Update preview time
        if (this.elements.previewTime) {
            this.elements.previewTime.textContent = this.formatTime(time);
        }

        // Show preview
        this.elements.progressPreview.style.display = 'flex';
    }

    hideProgressPreview() {
        if (this.elements.progressPreview) {
            this.elements.progressPreview.style.display = 'none';
        }
    }

    /* ==========================================================================
       Volume Control Interaction
       ========================================================================== */

    updateVolumeFromEvent(e) {
        if (!this.elements.volumeControl) return;

        const rect = this.elements.volumeControl.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = Math.max(0, Math.min(1, x / rect.width));
        
        this.setVolume(percentage);
    }

    /* ==========================================================================
       Modal System
       ========================================================================== */

    initializeModals() {
        this.setupModalEvents();
        this.setupFileInput();
        this.setupSettingsTabs();
    }

    setupModalEvents() {
        // Load video modal
        const loadVideoModal = this.elements.loadVideoModal;
        if (loadVideoModal) {
            const closeBtn = loadVideoModal.querySelector('#closeLoadVideoModal');
            const cancelBtn = loadVideoModal.querySelector('#cancelLoadVideo');
            const loadBtn = loadVideoModal.querySelector('#loadVideoBtn');

            closeBtn?.addEventListener('click', () => this.hideModal());
            cancelBtn?.addEventListener('click', () => this.hideModal());
            loadBtn?.addEventListener('click', () => this.loadVideo());

            // Close on overlay click
            loadVideoModal.addEventListener('click', (e) => {
                if (e.target === loadVideoModal) this.hideModal();
            });
        }

        // Settings modal
        const settingsModal = this.elements.settingsModal;
        if (settingsModal) {
            const closeBtn = settingsModal.querySelector('#closeSettingsModal');
            const resetBtn = settingsModal.querySelector('#resetSettings');
            const applyBtn = settingsModal.querySelector('#applySettings');

            closeBtn?.addEventListener('click', () => this.hideModal());
            resetBtn?.addEventListener('click', () => this.resetSettings());
            applyBtn?.addEventListener('click', () => this.applySettings());

            // Close on overlay click
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) this.hideModal();
            });
        }

        // Tracks modal
        const tracksModal = this.elements.tracksModal;
        if (tracksModal) {
            const closeBtn = tracksModal.querySelector('#closeTracksModal');

            closeBtn?.addEventListener('click', () => this.hideModal());

            // Close on overlay click
            tracksModal.addEventListener('click', (e) => {
                if (e.target === tracksModal) this.hideModal();
            });
        }
    }

    setupFileInput() {
        if (this.elements.fileInputBtn && this.elements.videoFileInput) {
            this.elements.fileInputBtn.addEventListener('click', () => {
                this.elements.videoFileInput.click();
            });

            this.elements.videoFileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && this.elements.fileName) {
                    this.elements.fileName.textContent = file.name;
                }
            });
        }

        // Setup preset buttons
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-url');
                if (url && this.elements.videoUrlInput) {
                    this.elements.videoUrlInput.value = url;
                }
            });
        });
    }

    setupSettingsTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchSettingsTab(tab);
            });
        });
    }

    showModal(modalType) {
        const modals = {
            loadVideo: this.elements.loadVideoModal,
            settings: this.elements.settingsModal,
            tracks: this.elements.tracksModal
        };

        const modal = modals[modalType];
        if (modal) {
            modal.classList.add('visible');
            this.ui.activeModal = modalType;
            document.body.classList.add('no-scroll');

            // Load content for specific modals
            if (modalType === 'settings') {
                this.loadSettingsContent();
            } else if (modalType === 'tracks') {
                this.loadTracksContent();
            }
        }
    }

    hideModal() {
        const modals = [
            this.elements.loadVideoModal,
            this.elements.settingsModal,
            this.elements.tracksModal
        ];

        modals.forEach(modal => {
            if (modal) {
                modal.classList.remove('visible');
            }
        });

        this.ui.activeModal = null;
        document.body.classList.remove('no-scroll');
    }

    /* ==========================================================================
       Video Loading
       ========================================================================== */

    async loadVideo() {
        try {
            const urlInput = this.elements.videoUrlInput;
            const fileInput = this.elements.videoFileInput;

            let src = '';
            let type = '';
            let videoTitle = '';

            if (urlInput?.value.trim()) {
                src = urlInput.value.trim();
                type = this.detectVideoType(src);
                videoTitle = this.extractVideoTitle(src);
            } else if (fileInput?.files.length > 0) {
                const file = fileInput.files[0];
                src = URL.createObjectURL(file);
                type = file.type || 'video/mp4';
                videoTitle = this.extractVideoTitle(src, file.name);
            } else {
                this.showToast('Please provide a video URL or select a file', 'warning', 'Load Video');
                return;
            }

            // Display video title
            this.updateVideoTitle(videoTitle);
            
            // For Seedr and similar hosts, try different approaches
            let finalSrc = src;
            if (src.includes('seedr.cc') || src.includes('rd10.seedr') || src.includes('rd11.seedr')) {
                console.log('🌱 Detected Seedr link, using direct approach...');
                // Try without any modifications first (like your original)
                finalSrc = src;
            }
            
            // Load the video exactly like your original
            console.log('Loading video URL:', finalSrc, 'Type:', type, 'Title:', videoTitle);
            this.player.src({ src: finalSrc, type: type });
            
            // Reset player state exactly like your original
            this.player.load();
            
            // Reset state
            this.setState({
                currentTime: 0,
                duration: 0,
                isPlaying: false,
                isLoading: true
            });

            // Update UI to match original behavior
            this.updatePlayPauseButton();
            this.updateProgress();
            this.showLoadingState();

            // Hide modal
            this.hideModal();

            // Clear inputs
            if (urlInput) urlInput.value = '';
            if (fileInput) fileInput.value = '';
            if (this.elements.fileName) this.elements.fileName.textContent = 'No file selected';

            // Try to auto-play exactly like your original
            this.player.ready(() => {
                console.log('📺 Player ready, attempting auto-play...');
                const playPromise = this.player.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('✅ Auto-play successful');
                        this.showToast('Video loaded successfully', 'success', 'Load Video');
                    }).catch(error => {
                        console.warn('⚠️ Auto-play prevented by browser:', error);
                        this.showToast('Video loaded - click to play', 'info', 'Load Video');
                    });
                }
            });

        } catch (error) {
            console.error('❌ Video load error:', error);
            this.showToast('Failed to load video', 'error', 'Load Video');
        }
    }

    extractVideoTitle(src, fileName = null) {
        let title = '';
        
        if (fileName) {
            // For uploaded files, use the file name
            title = fileName.replace(/\.[^/.]+$/, ""); // Remove file extension
        } else {
            // For URLs, try to extract a meaningful title
            try {
                const url = new URL(src);
                const pathname = url.pathname;
                
                // Get the last part of the path (filename)
                const segments = pathname.split('/').filter(s => s.length > 0);
                if (segments.length > 0) {
                    let lastSegment = segments[segments.length - 1];
                    
                    // Remove common video file extensions
                    lastSegment = lastSegment.replace(/\.(mp4|webm|ogg|avi|mov|mkv|flv|wmv|m3u8|mpd)$/i, '');
                    
                    // Replace common separators with spaces
                    lastSegment = lastSegment.replace(/[-_\.]/g, ' ');
                    
                    // Decode URL encoding
                    lastSegment = decodeURIComponent(lastSegment);
                    
                    // Capitalize words
                    title = lastSegment.replace(/\b\w/g, l => l.toUpperCase());
                } else {
                    // Fallback to hostname
                    title = url.hostname;
                }
            } catch (e) {
                // If URL parsing fails, use a generic title
                title = 'Video Stream';
            }
        }
        
        return title || 'Untitled Video';
    }

    detectVideoType(src) {
        const url = src.toLowerCase();
        
        if (url.includes('.m3u8')) {
            return 'application/x-mpegURL';
        } else if (url.includes('.mpd')) {
            return 'application/dash+xml';
        } else if (url.includes('.webm')) {
            return 'video/webm';
        } else if (url.includes('.ogg')) {
            return 'video/ogg';
        } else {
            return 'video/mp4';
        }
    }

    /* ==========================================================================
       Settings Management
       ========================================================================== */

    switchSettingsTab(tab) {
        // Update tab buttons
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });

        this.ui.activeTab = tab;
        this.loadSettingsContent();
    }

    loadSettingsContent() {
        if (!this.elements.settingsContent) return;

        const content = this.generateSettingsContent(this.ui.activeTab);
        this.elements.settingsContent.innerHTML = content;

        // Setup event listeners for the new content
        this.setupSettingsEventListeners();
    }

    generateSettingsContent(tab) {
        switch (tab) {
            case 'video':
                return this.generateVideoSettings();
            case 'audio':
                return this.generateAudioSettings();
            case 'subtitles':
                return this.generateSubtitleSettings();
            case 'interface':
                return this.generateInterfaceSettings();
            default:
                return '<p>Settings content not available</p>';
        }
    }

    generateVideoSettings() {
        return `
            <div class="setting-group">
                <label>Playback Speed</label>
                <div class="setting-control">
                    <select id="playbackSpeedSelect">
                        <option value="0.25">0.25×</option>
                        <option value="0.5">0.5×</option>
                        <option value="0.75">0.75×</option>
                        <option value="1" ${this.state.playbackRate === 1 ? 'selected' : ''}>1× (Normal)</option>
                        <option value="1.25">1.25×</option>
                        <option value="1.5">1.5×</option>
                        <option value="2">2×</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Brightness</label>
                <div class="setting-control">
                    <input type="range" id="brightnessSlider" min="50" max="150" value="${this.state.brightness}">
                    <span id="brightnessValue">${this.state.brightness}%</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Contrast</label>
                <div class="setting-control">
                    <input type="range" id="contrastSlider" min="50" max="150" value="${this.state.contrast}">
                    <span id="contrastValue">${this.state.contrast}%</span>
                </div>
            </div>
            
                        <div class="setting-group">
                <label>Saturation</label>
                <div class="setting-control">
                    <input type="range" id="saturationSlider" min="0" max="200" value="${this.state.saturation}">
                    <span id="saturationValue">${this.state.saturation}%</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Quality</label>
                <div class="setting-control">
                    <select id="qualitySelect">
                        <option value="auto" selected>Auto</option>
                        <option value="1080p">1080p</option>
                        <option value="720p">720p</option>
                        <option value="480p">480p</option>
                        <option value="360p">360p</option>
                    </select>
                </div>
            </div>
        `;
    }

    generateAudioSettings() {
        return `
            <div class="setting-group">
                <label>Volume</label>
                <div class="setting-control">
                    <input type="range" id="volumeSettingSlider" min="0" max="100" value="${Math.round(this.state.volume * 100)}">
                    <span id="volumeSettingValue">${Math.round(this.state.volume * 100)}%</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Audio Track</label>
                <div class="setting-control">
                    <select id="audioTrackSelect">
                        <option value="default">Default Audio Track</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Audio Balance</label>
                <div class="setting-control">
                    <input type="range" id="audioBalanceSlider" min="-100" max="100" value="0">
                    <span id="balanceValue">Center</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Audio Boost</label>
                <div class="setting-control">
                    <input type="range" id="audioBoostSlider" min="50" max="200" value="100">
                    <span id="boostValue">100%</span>
                </div>
            </div>
        `;
    }

    generateSubtitleSettings() {
        return `
            <div class="setting-group">
                <label>Subtitle Track</label>
                <div class="setting-control">
                    <select id="subtitleTrackSelect">
                        <option value="none">None</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Load External Subtitles</label>
                <div class="setting-control">
                    <input type="file" id="subtitleFileInput" accept=".srt,.vtt,.ass,.ssa">
                </div>
            </div>
            
            <div class="setting-group">
                <label>Font Size</label>
                <div class="setting-control">
                    <input type="range" id="subtitleSizeSlider" min="12" max="32" value="18">
                    <span id="fontSizeValue">18px</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Font Color</label>
                <div class="setting-control">
                    <input type="color" id="subtitleColorPicker" value="#ffffff">
                </div>
            </div>
            
            <div class="setting-group">
                <label>Background</label>
                <div class="setting-control">
                    <select id="subtitleBackgroundSelect">
                        <option value="none">None</option>
                        <option value="semi">Semi-transparent</option>
                        <option value="solid">Solid Black</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Position</label>
                <div class="setting-control">
                    <select id="subtitlePositionSelect">
                        <option value="bottom" selected>Bottom</option>
                        <option value="top">Top</option>
                        <option value="center">Center</option>
                    </select>
                </div>
            </div>
        `;
    }

    generateInterfaceSettings() {
        return `
            <div class="setting-group">
                <label>Controls Auto-hide</label>
                <div class="setting-control">
                    <select id="autoHideSelect">
                        <option value="1000">1 second</option>
                        <option value="3000" selected>3 seconds</option>
                        <option value="5000">5 seconds</option>
                        <option value="never">Never</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Skip Duration</label>
                <div class="setting-control">
                    <select id="skipDurationSelect">
                        <option value="5">5 seconds</option>
                        <option value="10" selected>10 seconds</option>
                        <option value="15">15 seconds</option>
                        <option value="30">30 seconds</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Touch Sensitivity</label>
                <div class="setting-control">
                    <input type="range" id="touchSensitivitySlider" min="1" max="5" value="${this.settings.touchSensitivity}">
                    <span id="touchSensitivityValue">${this.settings.touchSensitivity}</span>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Show Watermark</label>
                <div class="setting-control">
                    <select id="watermarkSelect">
                        <option value="always">Always</option>
                        <option value="playing" selected>When Playing</option>
                        <option value="never">Never</option>
                    </select>
                </div>
            </div>
            
            <div class="setting-group">
                <label>Theme</label>
                <div class="setting-control">
                    <select id="themeSelect">
                        <option value="dark" selected>Dark</option>
                        <option value="darker">Darker</option>
                        <option value="black">Pure Black</option>
                    </select>
                </div>
            </div>
        `;
    }

    setupSettingsEventListeners() {
        // Video settings
        const playbackSpeedSelect = document.getElementById('playbackSpeedSelect');
        if (playbackSpeedSelect) {
            playbackSpeedSelect.addEventListener('change', (e) => {
                this.player.playbackRate(parseFloat(e.target.value));
            });
        }

        const brightnessSlider = document.getElementById('brightnessSlider');
        if (brightnessSlider) {
            brightnessSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.setBrightness(value);
                document.getElementById('brightnessValue').textContent = `${value}%`;
            });
        }

        const contrastSlider = document.getElementById('contrastSlider');
        if (contrastSlider) {
            contrastSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.setContrast(value);
                document.getElementById('contrastValue').textContent = `${value}%`;
            });
        }

        const saturationSlider = document.getElementById('saturationSlider');
        if (saturationSlider) {
            saturationSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.setSaturation(value);
                document.getElementById('saturationValue').textContent = `${value}%`;
            });
        }

        // Audio settings
        const volumeSettingSlider = document.getElementById('volumeSettingSlider');
        if (volumeSettingSlider) {
            volumeSettingSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value) / 100;
                this.setVolume(value);
                document.getElementById('volumeSettingValue').textContent = `${Math.round(value * 100)}%`;
            });
        }

        const audioBalanceSlider = document.getElementById('audioBalanceSlider');
        if (audioBalanceSlider) {
            audioBalanceSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                let text = 'Center';
                if (value < -10) text = `Left ${Math.abs(value)}%`;
                else if (value > 10) text = `Right ${value}%`;
                document.getElementById('balanceValue').textContent = text;
            });
        }

        const audioBoostSlider = document.getElementById('audioBoostSlider');
        if (audioBoostSlider) {
            audioBoostSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('boostValue').textContent = `${value}%`;
            });
        }

        // Subtitle settings
        const subtitleSizeSlider = document.getElementById('subtitleSizeSlider');
        if (subtitleSizeSlider) {
            subtitleSizeSlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('fontSizeValue').textContent = `${value}px`;
            });
        }

        const subtitleFileInput = document.getElementById('subtitleFileInput');
        if (subtitleFileInput) {
            subtitleFileInput.addEventListener('change', (e) => {
                this.loadSubtitleFile(e.target.files[0]);
            });
        }

        // Interface settings
        const autoHideSelect = document.getElementById('autoHideSelect');
        if (autoHideSelect) {
            autoHideSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                this.settings.controlsHideDelay = value === 'never' ? 0 : parseInt(value);
            });
        }

        const skipDurationSelect = document.getElementById('skipDurationSelect');
        if (skipDurationSelect) {
            skipDurationSelect.addEventListener('change', (e) => {
                this.settings.seekStep = parseInt(e.target.value);
            });
        }

        const touchSensitivitySlider = document.getElementById('touchSensitivitySlider');
        if (touchSensitivitySlider) {
            touchSensitivitySlider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                this.settings.touchSensitivity = value;
                document.getElementById('touchSensitivityValue').textContent = value;
            });
        }

        // Update audio and subtitle track lists
        this.updateAudioTrackList();
        this.updateSubtitleTrackList();
    }

    /* ==========================================================================
       Track Management
       ========================================================================== */

    detectTracks() {
        console.log('🔍 Detecting tracks with enhanced HLS/DASH support...');
        
        setTimeout(() => {
            const audioTracks = this.player.audioTracks();
            const textTracks = this.player.textTracks();
            
            console.log('📊 Audio tracks found:', audioTracks.length);
            console.log('📊 Text tracks found:', textTracks.length);
            
            // Enhanced VHS track detection for HLS/DASH streams
            const tech = this.player.tech({ IWillNotUseThisInPlugins: true });
            
            if (tech && tech.vhs) {
                const vhs = tech.vhs;
                console.log('🔍 VHS tech detected, checking for additional tracks...');
                
                if (vhs.playlists && vhs.playlists.master) {
                    const master = vhs.playlists.master;
                    
                    // Detect audio tracks from HLS master playlist
                    if (master.mediaGroups && master.mediaGroups.AUDIO) {
                        const audioGroups = master.mediaGroups.AUDIO;
                        console.log('🎵 Found audio groups:', Object.keys(audioGroups));
                        
                        Object.keys(audioGroups).forEach(groupId => {
                            const group = audioGroups[groupId];
                            
                            Object.keys(group).forEach(trackId => {
                                const trackData = group[trackId];
                                const existingTrack = audioTracks.getTrackById(trackId);
                                
                                if (!existingTrack && trackData.language) {
                                    const newTrack = new videojs.AudioTrack({
                                        id: trackId,
                                        kind: trackData.default ? 'main' : 'translation',
                                        label: trackData.name || trackData.language,
                                        language: trackData.language,
                                        enabled: trackData.default || false
                                    });
                                    
                                    audioTracks.addTrack(newTrack);
                                    console.log('✅ Added audio track:', trackData.name || trackData.language);
                                }
                            });
                        });
                    }
                    
                    // Detect subtitle tracks from HLS master playlist
                    if (master.mediaGroups && master.mediaGroups.SUBTITLES) {
                        const subtitleGroups = master.mediaGroups.SUBTITLES;
                        console.log('💬 Found subtitle groups:', Object.keys(subtitleGroups));
                        
                        Object.keys(subtitleGroups).forEach(groupId => {
                            const group = subtitleGroups[groupId];
                            
                            Object.keys(group).forEach(trackId => {
                                const trackData = group[trackId];
                                
                                if (trackData.uri || trackData.language) {
                                    const existingTrack = [...textTracks].find(t => t.id === trackId);
                                    
                                    if (!existingTrack) {
                                        const newTrack = this.player.addRemoteTextTrack({
                                            id: trackId,
                                            kind: 'subtitles',
                                            label: trackData.name || trackData.language || 'Subtitle',
                                            language: trackData.language || 'unknown',
                                            src: trackData.uri,
                                            default: trackData.default || false
                                        }, false);
                                        
                                        console.log('✅ Added subtitle track:', trackData.name || trackData.language);
                                    }
                                }
                            });
                        });
                    }
                }
                
                // Monitor for quality levels
                if (vhs.representations) {
                    console.log('📊 Available quality levels:', vhs.representations.length);
                    this.updateQualityLevels(vhs.representations);
                }
            }
            
            // Update UI components
            this.updateAudioTrackList();
            this.updateSubtitleTrackList();
            this.updateTracksUI();
            
        }, 1000); // Increased timeout for better track detection
    }

    updateQualityLevels(representations) {
        if (!representations || representations.length === 0) return;
        
        console.log('📊 Updating quality levels...');
        const qualities = representations.map(rep => ({
            id: rep.id,
            width: rep.width,
            height: rep.height,
            bandwidth: rep.bandwidth,
            label: `${rep.height}p (${Math.round(rep.bandwidth / 1000)}k)`
        }));
        
        // Store quality levels for settings UI
        this.availableQualities = qualities;
        console.log('✅ Quality levels updated:', qualities.length);
    }

    updateAudioTrackList() {
        const audioTrackSelect = document.getElementById('audioTrackSelect');
        if (!audioTrackSelect || !this.player) return;

        // Clear existing options
        audioTrackSelect.innerHTML = '<option value="default">Default Audio Track</option>';

        const audioTracks = this.player.audioTracks();
        if (audioTracks && audioTracks.length > 0) {
            console.log('🎵 Updating audio track list with', audioTracks.length, 'tracks');
            
            for (let i = 0; i < audioTracks.length; i++) {
                const track = audioTracks[i];
                const option = document.createElement('option');
                option.value = i;
                
                // Enhanced track labeling
                let label = track.label || track.language || `Audio Track ${i + 1}`;
                if (track.language && track.language !== 'unknown') {
                    label += ` (${track.language})`;
                }
                if (track.kind === 'main') {
                    label += ' [Default]';
                }
                
                option.textContent = label;
                if (track.enabled) option.selected = true;
                audioTrackSelect.appendChild(option);
            }

            // Enhanced change listener
            audioTrackSelect.addEventListener('change', (e) => {
                const index = parseInt(e.target.value);
                if (!isNaN(index) && index < audioTracks.length) {
                    console.log('🎵 Switching to audio track:', index);
                    for (let i = 0; i < audioTracks.length; i++) {
                        audioTracks[i].enabled = (i === index);
                    }
                    this.showToast(`Switched to audio track: ${audioTracks[index].label || audioTracks[index].language}`, 'success', 'Audio Track');
                }
            });
        }
    }

    updateSubtitleTrackList() {
        const subtitleTrackSelect = document.getElementById('subtitleTrackSelect');
        if (!subtitleTrackSelect || !this.player) return;

        // Clear existing options
        subtitleTrackSelect.innerHTML = '<option value="none">None</option>';

        const textTracks = this.player.textTracks();
        if (textTracks && textTracks.length > 0) {
            console.log('💬 Updating subtitle track list with', textTracks.length, 'tracks');
            
            for (let i = 0; i < textTracks.length; i++) {
                const track = textTracks[i];
                if (track.kind === 'subtitles' || track.kind === 'captions') {
                    const option = document.createElement('option');
                    option.value = i;
                    
                    // Enhanced subtitle track labeling
                    let label = track.label || track.language || `Subtitle ${i + 1}`;
                    if (track.language && track.language !== 'unknown') {
                        label += ` (${track.language})`;
                    }
                    if (track.kind === 'captions') {
                        label += ' [CC]';
                    }
                    
                    option.textContent = label;
                    if (track.mode === 'showing') option.selected = true;
                    subtitleTrackSelect.appendChild(option);
                }
            }

            // Enhanced change listener with better track switching
            subtitleTrackSelect.addEventListener('change', (e) => {
                const value = e.target.value;
                console.log('💬 Switching subtitle track to:', value);
                
                // Disable all text tracks first
                for (let i = 0; i < textTracks.length; i++) {
                    textTracks[i].mode = 'disabled';
                }
                
                if (value !== 'none') {
                    const index = parseInt(value);
                    if (!isNaN(index) && index < textTracks.length && textTracks[index]) {
                        textTracks[index].mode = 'showing';
                        const trackName = textTracks[index].label || textTracks[index].language || 'Unknown';
                        this.showToast(`Enabled subtitles: ${trackName}`, 'success', 'Subtitles');
                    }
                } else {
                    this.showToast('Subtitles disabled', 'info', 'Subtitles');
                }
            });
        }
    }

    updateTracksUI() {
        // Enhanced tracks display for settings modal
        const trackContainer = document.getElementById('tracksContent');
        if (!trackContainer) return;
        
        const audioTracks = this.player.audioTracks();
        const textTracks = this.player.textTracks();
        
        let html = '<div class="tracks-container">';
        
        // Enhanced Audio Tracks Section
        if (audioTracks && audioTracks.length > 0) {
            html += '<div class="tracks-section">';
            html += '<h3 class="tracks-title">🎵 Audio Tracks</h3>';
            
            for (let i = 0; i < audioTracks.length; i++) {
                const track = audioTracks[i];
                const isActive = track.enabled;
                
                html += `
                    <div class="track-item ${isActive ? 'active' : ''}">
                        <div class="track-info">
                            <div class="track-name">${track.label || track.language || 'Unknown Track'}</div>
                            <div class="track-details">
                                Language: ${track.language || 'Unknown'} • 
                                Kind: ${track.kind || 'Unknown'} • 
                                Status: ${isActive ? 'Enabled' : 'Disabled'}
                            </div>
                        </div>
                        <button class="track-btn ${isActive ? 'active' : ''}" 
                                onclick="window.onyxEnhanced.selectAudioTrack(${i})">
                            ${isActive ? 'Active' : 'Enable'}
                        </button>
                    </div>
                `;
            }
            html += '</div>';
        }
        
        // Enhanced Text Tracks Section
        const subtitleTracks = [...textTracks].filter(track => 
            track.kind === 'subtitles' || track.kind === 'captions'
        );
        
        if (subtitleTracks.length > 0) {
            html += '<div class="tracks-section">';
            html += '<h3 class="tracks-title">💬 Subtitle Tracks</h3>';
            
            subtitleTracks.forEach((track, index) => {
                const isActive = track.mode === 'showing';
                const actualIndex = [...textTracks].indexOf(track);
                
                html += `
                    <div class="track-item ${isActive ? 'active' : ''}">
                        <div class="track-info">
                            <div class="track-name">${track.label || track.language || 'Unknown Subtitle'}</div>
                            <div class="track-details">
                                Language: ${track.language || 'Unknown'} • 
                                Kind: ${track.kind || 'Unknown'} • 
                                Mode: ${track.mode || 'Unknown'}
                            </div>
                        </div>
                        <button class="track-btn ${isActive ? 'active' : ''}" 
                                onclick="window.onyxEnhanced.selectTextTrack(${actualIndex})">
                            ${isActive ? 'Active' : 'Enable'}
                        </button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // Quality Levels Section (if available)
        if (this.availableQualities && this.availableQualities.length > 0) {
            html += '<div class="tracks-section">';
            html += '<h3 class="tracks-title">📊 Quality Levels</h3>';
            
            this.availableQualities.forEach((quality, index) => {
                html += `
                    <div class="track-item">
                        <div class="track-info">
                            <div class="track-name">${quality.label}</div>
                            <div class="track-details">
                                Resolution: ${quality.width}×${quality.height} • 
                                Bandwidth: ${Math.round(quality.bandwidth / 1000)}k
                            </div>
                        </div>
                        <button class="track-btn" onclick="window.onyxEnhanced.selectQuality(${index})">
                            Select
                        </button>
                    </div>
                `;
            });
            html += '</div>';
        }
        
        // No tracks message
        if ((!audioTracks || audioTracks.length === 0) && 
            subtitleTracks.length === 0 && 
            (!this.availableQualities || this.availableQualities.length === 0)) {
            html += `
                <div class="no-tracks">
                    <div class="no-tracks-icon">📺</div>
                    <div class="no-tracks-text">No additional tracks detected</div>
                    <div class="no-tracks-subtitle">
                        Load a video with multiple audio tracks, subtitles, or quality levels to see them here.
                    </div>
                </div>
            `;
        }
        
        html += '</div>';
        trackContainer.innerHTML = html;
    }

    updateTracksUI() {
        // Update tracks modal content if open
        if (this.ui.activeModal === 'tracks') {
            this.loadTracksContent();
        }
    }

    loadTracksContent() {
        if (!this.elements.tracksContent) return;

        const audioTracks = this.player ? this.player.audioTracks() : null;
        const textTracks = this.player ? this.player.textTracks() : null;

        let html = '';

        // Audio tracks section
        if (audioTracks && audioTracks.length > 0) {
            html += `
                <div class="tracks-section">
                    <h3 class="tracks-title">🔊 Audio Tracks (${audioTracks.length})</h3>
                    <div class="tracks-list">
            `;

            for (let i = 0; i < audioTracks.length; i++) {
                const track = audioTracks[i];
                html += `
                    <div class="track-item ${track.enabled ? 'active' : ''}" data-type="audio" data-index="${i}">
                        <div class="track-info">
                            <div class="track-name">${track.label || track.language || 'Unknown'}</div>
                            <div class="track-details">
                                Language: ${track.language || 'Unknown'} | 
                                Kind: ${track.kind || 'main'} | 
                                Enabled: ${track.enabled ? '✅' : '❌'}
                            </div>
                        </div>
                        <div class="track-actions">
                            <button class="track-btn ${track.enabled ? 'active' : ''}" onclick="window.onyxEnhanced.selectAudioTrack(${i})">
                                ${track.enabled ? 'Active' : 'Select'}
                            </button>
                        </div>
                    </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;
        }

        // Text tracks section
        let subtitleCount = 0;
        if (textTracks) {
            for (let i = 0; i < textTracks.length; i++) {
                const track = textTracks[i];
                if (track.kind === 'subtitles' || track.kind === 'captions') {
                    subtitleCount++;
                }
            }
        }

        if (subtitleCount > 0) {
            html += `
                <div class="tracks-section">
                    <h3 class="tracks-title">💬 Text Tracks (${subtitleCount})</h3>
                    <div class="tracks-list">
            `;

            for (let i = 0; i < textTracks.length; i++) {
                const track = textTracks[i];
                if (track.kind === 'subtitles' || track.kind === 'captions') {
                    html += `
                        <div class="track-item ${track.mode === 'showing' ? 'active' : ''}" data-type="text" data-index="${i}">
                            <div class="track-info">
                                <div class="track-name">${track.label || track.language || 'Unknown'}</div>
                                <div class="track-details">
                                    Language: ${track.language || 'Unknown'} | 
                                    Kind: ${track.kind} | 
                                    Mode: ${track.mode}
                                </div>
                            </div>
                            <div class="track-actions">
                                <button class="track-btn ${track.mode === 'showing' ? 'active' : ''}" onclick="window.onyxEnhanced.selectTextTrack(${i})">
                                    ${track.mode === 'showing' ? 'Active' : 'Select'}
                                </button>
                            </div>
                        </div>
                    `;
                }
            }

            html += `
                    </div>
                </div>
            `;
        }

        if (html === '') {
            html = `
                <div class="no-tracks">
                    <div class="no-tracks-icon">🎵</div>
                    <div class="no-tracks-text">No additional tracks detected</div>
                    <div class="no-tracks-subtitle">Load a video with multiple audio or subtitle tracks to see options here</div>
                </div>
            `;
        }

        this.elements.tracksContent.innerHTML = html;
    }

    selectAudioTrack(index) {
        const audioTracks = this.player.audioTracks();
        if (audioTracks && audioTracks.length > index) {
            console.log('🎵 Selecting audio track:', index);
            for (let i = 0; i < audioTracks.length; i++) {
                audioTracks[i].enabled = (i === index);
            }
            const selectedTrack = audioTracks[index];
            const trackName = selectedTrack.label || selectedTrack.language || `Track ${index + 1}`;
            this.updateTracksUI(); // Refresh UI
            this.showToast(`Audio track: ${trackName}`, 'success', 'Audio');
        }
    }

    selectTextTrack(index) {
        const textTracks = this.player.textTracks();
        if (textTracks && textTracks.length > index) {
            console.log('💬 Selecting text track:', index);
            
            // Disable all text tracks first
            for (let i = 0; i < textTracks.length; i++) {
                textTracks[i].mode = 'disabled';
            }
            
            // Enable selected track
            if (textTracks[index]) {
                textTracks[index].mode = 'showing';
                const trackName = textTracks[index].label || textTracks[index].language || `Track ${index + 1}`;
                this.updateTracksUI(); // Refresh UI
                this.showToast(`Subtitles: ${trackName}`, 'success', 'Subtitles');
            }
        }
    }

    selectQuality(index) {
        if (!this.availableQualities || this.availableQualities.length <= index) return;
        
        const quality = this.availableQualities[index];
        console.log('📊 Selecting quality:', quality);
        
        const tech = this.player.tech({ IWillNotUseThisInPlugins: true });
        if (tech && tech.vhs && tech.vhs.representations) {
            try {
                // Force quality selection
                const representation = tech.vhs.representations[index];
                if (representation) {
                    tech.vhs.selectPlaylist = function() {
                        return representation;
                    };
                    this.showToast(`Quality: ${quality.label}`, 'success', 'Quality');
                }
            } catch (error) {
                console.warn('Quality selection failed:', error);
                this.showToast('Quality selection not supported', 'warning', 'Quality');
            }
        }
    }

    loadSubtitleFile(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            console.log('Subtitle file loaded:', file.name);
            
            // Create a text track for the subtitle file
            try {
                const track = this.player.addRemoteTextTrack({
                    kind: 'subtitles',
                    src: URL.createObjectURL(file),
                    srclang: 'en',
                    label: file.name,
                    default: true
                }, false);

                this.showToast(`Subtitle file "${file.name}" loaded`, 'success', 'Subtitles');
                this.updateSubtitleTrackList();
            } catch (error) {
                console.error('Error loading subtitle file:', error);
                this.showToast('Failed to load subtitle file', 'error', 'Subtitles');
            }
        };
        
        reader.onerror = () => {
            this.showToast('Failed to read subtitle file', 'error', 'Subtitles');
        };
        
        reader.readAsText(file);
    }

    /* ==========================================================================
       Settings Management
       ========================================================================== */

    applySettings() {
        this.showToast('Settings applied successfully', 'success', 'Settings');
        this.hideModal();
    }

    resetSettings() {
        // Reset to default values
        this.setState({
            brightness: 100,
            contrast: 100,
            saturation: 100,
            playbackRate: 1
        });

        this.settings = {
            controlsHideDelay: 3000,
            gestureShowDuration: 1000,
            volumeStep: 0.1,
            seekStep: 10,
            brightnessStep: 10,
            doubleTapDelay: 300,
            touchSensitivity: 2
        };

        // Apply defaults
        this.player.playbackRate(1);
        this.setVolume(1);
        this.applyVideoFilters();

        // Refresh settings UI
        this.loadSettingsContent();

        this.showToast('Settings reset to defaults', 'info', 'Settings');
    }

    /* ==========================================================================
       Context Menu
       ========================================================================== */

    handleContextMenu(e) {
        e.preventDefault();
        this.showContextMenu(e.clientX, e.clientY);
    }

    showContextMenu(x, y) {
        if (!this.elements.contextMenu) return;

        // Update menu items based on current state
        this.updateContextMenuItems();

        // Position menu
        this.elements.contextMenu.style.left = `${x}px`;
        this.elements.contextMenu.style.top = `${y}px`;
        this.elements.contextMenu.classList.add('visible');

        // Hide menu when clicking elsewhere
        const hideMenu = (e) => {
            if (!this.elements.contextMenu.contains(e.target)) {
                this.hideContextMenu();
                document.removeEventListener('click', hideMenu);
            }
        };

        setTimeout(() => {
            document.addEventListener('click', hideMenu);
        }, 0);
    }

    hideContextMenu() {
        if (this.elements.contextMenu) {
            this.elements.contextMenu.classList.remove('visible');
        }
    }

    updateContextMenuItems() {
        // Context menu items are handled in the HTML, but we can update their state here
        const playItem = document.getElementById('contextPlay');
        const pauseItem = document.getElementById('contextPause');

        if (playItem && pauseItem) {
            playItem.style.display = this.state.isPlaying ? 'none' : 'flex';
            pauseItem.style.display = this.state.isPlaying ? 'flex' : 'none';
        }

        // Setup context menu event listeners
        this.setupContextMenuEvents();
    }

    setupContextMenuEvents() {
        const contextPlay = document.getElementById('contextPlay');
        const contextPause = document.getElementById('contextPause');
        const contextFullscreen = document.getElementById('contextFullscreen');
        const contextPip = document.getElementById('contextPip');
        const contextCopyUrl = document.getElementById('contextCopyUrl');

        if (contextPlay) {
            contextPlay.onclick = () => {
                this.togglePlayPause();
                this.hideContextMenu();
            };
        }

        if (contextPause) {
            contextPause.onclick = () => {
                this.togglePlayPause();
                this.hideContextMenu();
            };
        }

        if (contextFullscreen) {
            contextFullscreen.onclick = () => {
                this.toggleFullscreen();
                this.hideContextMenu();
            };
        }

        if (contextPip) {
            contextPip.onclick = () => {
                this.togglePictureInPicture();
                this.hideContextMenu();
            };
        }

        if (contextCopyUrl) {
            contextCopyUrl.onclick = () => {
                this.copyVideoUrl();
                this.hideContextMenu();
            };
        }
    }

    copyVideoUrl() {
        if (this.video && this.video.src) {
            navigator.clipboard.writeText(this.video.src).then(() => {
                this.showToast('Video URL copied to clipboard', 'success', 'Clipboard');
            }).catch(() => {
                this.showToast('Failed to copy URL', 'error', 'Clipboard');
            });
        }
    }

    /* ==========================================================================
       Toast Notification System
       ========================================================================== */

    showToast(message, type = 'info', title = null, duration = 3000) {
        if (!this.elements.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">×</button>
        `;

        // Add to container
        this.elements.toastContainer.appendChild(toast);

        // Setup close button
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.hideToast(toast));

        // Auto-hide
        setTimeout(() => {
            this.hideToast(toast);
        }, duration);

        return toast;
    }

    hideToast(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }

    /* ==========================================================================
       Event Handlers
       ========================================================================== */

    handleMouseMove() {
        this.showControls();
    }

    handleMouseLeave() {
        if (this.state.isPlaying && !this.ui.controlsLocked) {
            this.startControlsAutoHide();
        }
    }

    handleClick() {
        this.showControls();
    }

    handleDoubleClick() {
        this.toggleFullscreen();
    }

    handleResize() {
        // Update responsive elements
        this.updateResponsiveElements();
    }

    handleVisibilityChange() {
        if (document.hidden && this.state.isPlaying) {
            // Optionally pause when tab becomes hidden
            // this.player.pause();
        }
    }

    handleFullscreenChange() {
        this.onFullscreenChange();
    }

    handleBeforeUnload() {
        this.destroy();
    }

    /* ==========================================================================
       Window Controls
       ========================================================================== */

    setupWindowControls() {
        if (this.elements.minimizeBtn) {
            this.elements.minimizeBtn.addEventListener('click', () => this.minimizeWindow());
        }

        if (this.elements.maximizeBtn) {
            this.elements.maximizeBtn.addEventListener('click', () => this.maximizeWindow());
        }

        if (this.elements.closeBtn) {
            this.elements.closeBtn.addEventListener('click', () => this.closeWindow());
        }
    }

    minimizeWindow() {
        if (window.electronAPI) {
            window.electronAPI.minimize();
        } else {
            this.showToast('Minimize not supported in browser', 'warning', 'Window Control');
        }
    }

    maximizeWindow() {
        if (window.electronAPI) {
            window.electronAPI.maximize();
        } else {
            this.toggleFullscreen();
        }
    }

    closeWindow() {
        if (window.electronAPI) {
            window.electronAPI.close();
        } else {
            if (confirm('Are you sure you want to close the player?')) {
                window.close();
            }
        }
    }

    /* ==========================================================================
       Utility Methods
       ========================================================================== */

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    formatTime(seconds) {
        if (!isFinite(seconds) || seconds < 0) return '00:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    clearTimer(name) {
        if (this.timers[name]) {
            clearTimeout(this.timers[name]);
            this.timers[name] = null;
        }
    }

    updateResponsiveElements() {
        // Handle responsive updates
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            this.elements.videoContainer?.classList.add('mobile');
        } else {
            this.elements.videoContainer?.classList.remove('mobile');
        }
    }

    applyInitialSettings() {
        // Apply default video filters
        this.applyVideoFilters();
        
        // Set initial volume
        this.setVolume(this.state.volume);
        
        // Update all UI elements
        this.updatePlayPauseButton();
        this.updateVolumeUI();
        this.updateSpeedDisplay();
        this.updateFullscreenButton();
    }

    hideLoadingOverlay() {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                this.elements.loadingOverlay.style.display = 'none';
            }, 500);
        }
    }

    startPeriodicUpdates() {
        // Start any periodic update timers
        this.timers.progressUpdate = setInterval(() => {
            if (this.state.isPlaying && !this.ui.isDragging) {
                this.updateProgress();
            }
        }, 100);
    }

    /* ==========================================================================
       Initialization UI
       ========================================================================== */

    initializeUI() {
        // Show controls initially
        this.showControls();
        
        // Update all UI elements
        this.updatePlayPauseButton();
        this.updateVolumeUI();
        this.updateSpeedDisplay();
        this.updateFullscreenButton();
        
        // Setup responsive classes
        this.updateResponsiveElements();
    }

    /* ==========================================================================
       Additional Menu Handlers
       ========================================================================== */

    showSpeedMenu(e) {
        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2];
        const currentSpeed = this.state.playbackRate;
        const currentIndex = speeds.indexOf(currentSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        const nextSpeed = speeds[nextIndex];
        
        this.player.playbackRate(nextSpeed);
        this.showToast(`Speed: ${nextSpeed}×`, 'info', 'Playback');
    }

    /* ==========================================================================
       Destruction & Cleanup
       ========================================================================== */

    destroy() {
        if (this.isDestroyed) return;

        console.log('🧹 Destroying ONYX Enhanced Player...');

        // Clear all timers
        Object.values(this.timers).forEach(timer => {
            if (timer) clearTimeout(timer);
        });

        // Remove event listeners
        Object.entries(this.boundHandlers).forEach(([event, handler]) => {
            if (event.startsWith('handle')) {
                const eventName = event.replace('handle', '').toLowerCase();
                if (eventName === 'keydown') {
                    document.removeEventListener('keydown', handler);
                } else if (eventName === 'resize') {
                    window.removeEventListener('resize', handler);
                }
                // Add other event removals as needed
            }
        });

        // Dispose Video.js player
        if (this.player && !this.player.isDisposed()) {
            this.player.dispose();
        }

        // Clear references
        this.player = null;
        this.video = null;
        this.elements = {};
        this.boundHandlers = {};

        this.isDestroyed = true;
        console.log('✅ ONYX Enhanced Player destroyed');
    }
}

/* ==========================================================================
   Auto-initialization
   ========================================================================== */

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.onyxEnhanced = new ONYXEnhancedPlayer();
    });
} else {
    window.onyxEnhanced = new ONYXEnhancedPlayer();
}

// Add CSS animations for toasts
const additionalCSS = `
@keyframes toastSlideOut {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

.track-item {
    padding: 16px;
    background: var(--surface-secondary);
    border-radius: 8px;
    margin-bottom: 8px;
    border: 1px solid var(--glass-border);
    transition: all 0.2s ease;
}

.track-item:hover {
    background: var(--surface-tertiary);
    border-color: var(--primary-gold);
}

.track-item.active {
    border-color: var(--primary-gold);
    background: rgba(255, 215, 0, 0.1);
}

.track-info {
    margin-bottom: 8px;
}

.track-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.track-details {
    font-size: 12px;
    color: var(--text-tertiary);
    font-family: var(--font-family-mono);
}

.track-btn {
    padding: 6px 12px;
    background: var(--surface-tertiary);
    border: 1px solid var(--glass-border);
    border-radius: 4px;
    color: var(--text-secondary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.track-btn:hover {
    background: var(--surface-quaternary);
    color: var(--text-primary);
}

.track-btn.active {
    background: var(--primary-gold);
    color: var(--bg-primary);
    border-color: var(--primary-gold);
}

.tracks-title {
    color: var(--text-primary);
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--glass-border);
}

.tracks-section {
    margin-bottom: 24px;
}

.no-tracks {
    text-align: center;
    padding: 48px 24px;
    color: var(--text-tertiary);
}

.no-tracks-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.no-tracks-text {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-secondary);
    margin-bottom: 8px;
}

.no-tracks-subtitle {
    font-size: 14px;
    color: var(--text-quaternary);
    max-width: 300px;
    margin: 0 auto;
    line-height: 1.5;
}

.setting-group {
    margin-bottom: 20px;
}

.setting-group label {
    display: block;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 8px;
}

.setting-control {
    display: flex;
    align-items: center;
    gap: 12px;
}

.setting-control input[type="range"] {
    flex: 1;
    height: 4px;
    background: var(--surface-tertiary);
    outline: none;
    border-radius: 2px;
    -webkit-appearance: none;
}

.setting-control input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: var(--primary-gold);
    border-radius: 50%;
    cursor: pointer;
    border: 2px solid var(--bg-primary);
}

.setting-control select {
    background: var(--surface-secondary);
    border: 1px solid var(--glass-border);
    border-radius: 4px;
    color: var(--text-primary);
    padding: 6px 8px;
    min-width: 120px;
}

.setting-control input[type="color"] {
    width: 40px;
    height: 30px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.setting-control span {
    color: var(--text-tertiary);
    font-size: 12px;
    min-width: 50px;
    font-family: var(--font-family-mono);
}
`;

// Inject additional CSS
const styleElement = document.createElement('style');
styleElement.textContent = additionalCSS;
document.head.appendChild(styleElement);

console.log('🎬 ONYX Enhanced Player script loaded successfully');