# 🎵 Music Player Dashboard Chrome Extension

A beautiful and modern Chrome extension that provides a music player dashboard with playlist management, volume control, and sleek UI design.

![Music Player Dashboard](https://img.shields.io/badge/Chrome-Extension-brightgreen) ![Version](https://img.shields.io/badge/version-1.0-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎵 Music Player
- **Modern UI**: Beautiful gradient background with glass morphism effects
- **Playback Controls**: Play, Pause, Next, Previous, Shuffle, Repeat
- **Progress Bar**: Draggable progress bar for seeking
- **Volume Control**: Volume slider with visual feedback

### 🎶 Playlist Management  
- **Add Songs**: Modal form to add new songs with complete information
- **Delete Songs**: Remove songs from playlist
- **Visual Playlist**: Song list with thumbnails, titles, and artists
- **Active Track**: Highlight currently playing track

### 📊 Dashboard Features
- **Statistics**: Display total songs, total time, and playlist count
- **Live Clock**: Shows current time
- **Local Storage**: Saves playlist and settings locally
- **Responsive Design**: Works on different screen sizes

### ⌨️ Keyboard Shortcuts
- **Space**: Play/Pause
- **Arrow Left**: Previous track
- **Arrow Right**: Next track
- **Arrow Up**: Increase volume
- **Arrow Down**: Decrease volume

## 🚀 Installation

### Step 1: Download Extension
1. Download the complete `music-extension` folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `music-extension` folder

### Step 2: Usage
1. Click the extension icon in the toolbar
2. The music player interface will appear in a popup
3. Click the "+" button to add your first song
4. Enjoy your music! 🎵

## 📁 Project Structure

```
music-extension/
├── manifest.json          # Chrome extension manifest
├── popup.html             # Main interface of the extension
├── styles.css             # CSS styles with modern design
├── script.js              # JavaScript logic for music player
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md              # This file
└── HUONG_DAN_TIENG_VIET.md # Vietnamese guide
```

## 🎯 How to Use

### Adding New Songs
1. Click the "+" button in the Playlist section
2. Fill in the information:
   - **Song Title**: Name of the song
   - **Artist**: Artist/singer name
   - **Audio URL**: Direct link to audio file (.mp3, .wav, etc.)
   - **Cover Image URL**: Link to album cover (optional)
3. Click "Add" to save the song

### Music Controls
- **Play/Pause**: Click main play button or press Space
- **Next/Previous**: Click next/previous buttons or use arrow keys
- **Seek**: Click or drag on progress bar
- **Volume**: Drag volume slider or use up/down arrow keys
- **Shuffle**: Click shuffle button for random playback
- **Repeat**: Click repeat button to loop current song

### Usage Tips
- Extension automatically saves playlist to Chrome storage
- Can play music from online sources (requires direct URL)
- Supports multiple audio formats: MP3, WAV, OGG, AAC
- Responsive interface works on different screen sizes

## 🛠️ Technical Details

### Technologies Used
- **HTML5**: Structure and audio element
- **CSS3**: Modern styling with gradients and animations
- **JavaScript ES6+**: Music player logic and Chrome APIs
- **Chrome Extensions API**: Storage and popup functionality

### Browser Support
- Chrome 88+
- Chromium-based browsers
- Edge (Chromium version)

## 🐛 Troubleshooting

### Songs Won't Play
- Check if audio URL is valid and accessible
- Ensure audio file is not blocked by CORS policy
- Try URLs from sources that allow hotlinking

### Extension Won't Load
- Check if Chrome Developer Mode is enabled
- Reload extension in chrome://extensions/
- Check console for errors (F12 > Console)

### Interface Issues
- Hard refresh popup (Ctrl + F5)
- Restart Chrome browser
- Reinstall extension

## 🔮 Future Features
- [ ] Import/Export playlist
- [ ] Audio equalizer
- [ ] Lyrics display
- [ ] Spotify/YouTube integration
- [ ] Dark/Light theme toggle
- [ ] Audio visualization

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Support

If you have any questions or issues, please feel free to:
- Open an issue on GitHub
- Contact the development team

## 🙏 Acknowledgments

- Inspired by modern music player designs
- Built with love for music enthusiasts
- Thanks to the Chrome Extensions community

---

**Enjoy your music with this beautiful player! 🎵🎶**

Made with ❤️ by GitHub Copilot
