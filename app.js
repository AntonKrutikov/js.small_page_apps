class Window {
    static last_zindex = 500

    // content is HTMLElement
    constructor(content, config = {width: 'auto', height: 'auto', title:''}, close_callback){
        this.close_callback = close_callback
        // window itself
        this.container = document.createElement('div')
        this.container.classList.add('window')
        this.container.style.width = `${config.width}px`
        this.container.style.height = `${config.height}px`
        this.container.style.zIndex = Window.last_zindex++
        // window bar
        this.bar = document.createElement('div')
        this.bar.classList.add('window-bar')
        this.container.appendChild(this.bar)
        // window title
        this.title = document.createElement('span')
        this.title.classList.add('window-title')
        this.title.innerText = config.title ? config.title : ''
        this.bar.appendChild(this.title)
        // window bar close button
        this.close_button = document.createElement('div')
        this.close_button.classList.add('window-close')
        this.close_button.innerText = 'x'
        this.bar.appendChild(this.close_button)
        // append content
        this.inner = document.createElement('div')
        this.inner.classList.add('window-inner')
        this.inner.appendChild(content)
        this.container.appendChild(this.inner)

        // state
        this.state = {
            x: 0,
            y: 0,
            x_diff: 0,
            y_diff: 0,
            is_dragging: false
        }

        // events
        this.bar.addEventListener('mousedown', (e) => {
            this.state.is_dragging = true
            this.state.x_diff = e.pageX - this.state.x
            this.state.y_diff = e.pageY - this.state.y
            this.container.style.zIndex = Window.last_zindex++
        })

        this.bar.addEventListener('mouseup', (e) => {
            this.state.is_dragging = false
        })

        document.addEventListener('mousemove', (e) => {
            if (this.state.is_dragging === true) {
                this.state.x = this.clampX(e.pageX - this.state.x_diff)
                this.state.y = this.clampY(e.pageY - this.state.y_diff)
                this.render()
            }
        })

        this.close_button.addEventListener('click', (e) => {
            this.close()
        })

    }

    clampX(n) {
        return Math.min(Math.max(n, 0), window.innerWidth)
    }
    
    clampY(n) {
        return Math.min(Math.max(n, 0), window.innerHeight);
    }
    

    render() {
        this.container.style.left = `${this.state.x}px`
        this.container.style.top = `${this.state.y}px`
        // this.container.style.transform = 'translate(' + this.state.x + 'px, ' + this.state.y + 'px)';
    }

    show() {
        document.body.appendChild(this.container)
        this.render()
    }

    close() {
        document.body.removeChild(this.container)
        this.state = {
            x: 0,
            y: 0,
            x_diff: 0,
            y_diff: 0,
            is_dragging: false
        }
        if (this.close_callback) this.close_callback()
    }
}

class TextEditor {
    constructor() {
        this.container = document.createElement('div')
        this.container.classList.add('editor')
        // toolbar
        this.toolbar = document.createElement('div')
        this.toolbar.classList.add('editor-toolbar')
        this.container.appendChild(this.toolbar)
        // save
        this.save_button = document.createElement('img')
        this.save_button.src = 'save.png'
        this.save_button.classList.add('editor-save')
        this.toolbar.appendChild(this.save_button)
        // new
        this.new_button = document.createElement('img')
        this.new_button.src = 'new.png'
        this.new_button.classList.add('editor-new')
        this.toolbar.appendChild(this.new_button)
        // area
        this.area = document.createElement('textarea')
        this.area.classList.add('editor-area')
        this.container.appendChild(this.area)

        // events
        this.save_button.addEventListener('click', (e) => {
            let data = new Blob([this.area.value], {type: 'text/plain'})
            let a = document.createElement('a')
            a.href = window.URL.createObjectURL(data)
            a.download = 'note.txt'
            a.click()
        })

        this.new_button.addEventListener('click', (e) => {
            this.area.value = ''
        })

        return this.container
    }
}

class AudioPlayer {
    // songs - array of paths
    constructor(songs = []) {
        this.songs = songs
        this.current_song_index = 0
        this.is_playing = false

        this.container = document.createElement('div')
        this.container.classList.add('audio-player')

        // audio
        this.audio = document.createElement('audio')
        this.audio.controls = false
        this.container.appendChild(this.audio)

        this.audio.addEventListener('ended', (e) => {
            this.current_song_index ++
            if (this.current_song_index > this.songs.length - 1) {
                this.current_song_index = 0
            }
            this.audio.src = this.songs[this.current_song_index]
            this.play()
        })

        // controls
        this.audio_controls = document.createElement('div')
        this.audio_controls.classList.add('audio-player-controls')
        this.container.appendChild(this.audio_controls)

        this.prev_button = document.createElement('img')
        this.prev_button.src = 'back.png'
        this.prev_button.classList.add('audio-player-controls-prev')
        this.audio_controls.appendChild(this.prev_button)

        this.prev_button.addEventListener('click', (e) => {
            this.prev_track()
            this.play()
        })

        this.play_button = document.createElement('img')
        this.play_button.src = 'play.png'
        this.play_button.classList.add('audio-player-controls-play')
        this.audio_controls.appendChild(this.play_button)

        this.play_button.addEventListener('click', (e) => {
            if (this.is_playing) {
                this.pause()
            } else {
                this.play()
            }
        })

        this.next_button = document.createElement('img')
        this.next_button.src = 'next.png'
        this.next_button.classList.add('audio-player-controls-next')
        this.audio_controls.appendChild(this.next_button)

        this.next_button.addEventListener('click', (e) => {
            this.next_track()
            this.play()
        })

        this.volume_up = document.createElement('span')
        this.volume_up.innerText = '+'
        this.volume_up.classList.add('audio-player-controls-volume-up')
        this.audio_controls.appendChild(this.volume_up)

        this.volume_up.addEventListener('click', (e) => {
            this.audio.volume += 0.1
        })

        this.volume_down = document.createElement('span')
        this.volume_down.innerText = '-'
        this.volume_down.classList.add('audio-player-controls-volume-down')
        this.audio_controls.appendChild(this.volume_down)

        this.volume_down.addEventListener('click', (e) => {
            this.audio.volume -= 0.1
        })


        // playlist
        this.playlist = document.createElement('div')
        this.playlist.classList.add('audio-player-playlist')
        this.container.appendChild(this.playlist)

        for (let i = 0; i < this.songs.length; i ++) {
            let row = document.createElement('div')
            row.classList.add('audio-player-playlist-entry')
            row.innerText = songs[i].split('/').pop()
            this.playlist.appendChild(row)

            row.addEventListener('click', (e) => {
                this.current_song_index = i
                this.audio.src = this.songs[this.current_song_index]
                this.play_list_update_state()
                this.play()
            })
        }
        this.play_list_update_state()

        return this.container
    }

    play() {
        if (this.audio.src === '') {
            this.audio.src = this.songs[this.current_song_index]
        }
        this.audio.play()
        this.play_button.src = 'pause.png'
        this.is_playing = true
    }

    pause() {
        this.audio.pause()
        this.is_playing = false
        this.play_button.src = 'play.png'
    }

    play_list_update_state() {
        let rows = this.playlist.querySelectorAll('.audio-player-playlist-entry')
        for (let i = 0; i < rows.length; i ++) {
            rows[i].style.fontWeight = null
            if (i === this.current_song_index) {
                rows[i].style.fontWeight = 'bold'
            }
        }
    }

    next_track() {
        this.current_song_index++
        if (this.current_song_index > this.songs.length - 1) {
            this.current_song_index = 0
        }
        this.play_list_update_state()
        this.audio.src = this.songs[this.current_song_index]
    }

    prev_track() {
        this.current_song_index--
        if (this.current_song_index < 0) {
            this.current_song_index = this.songs.length -1
        }
        this.play_list_update_state()
        this.audio.src = this.songs[this.current_song_index]
    }

    close() {
        this.audio.pause()
    }
}

class Paint {
    constructor(){
        this.state = {
            draw_start: false,
            cur_x: 0,
            cur_y: 0,
            prev_x: 0,
            prev_y: 0
        }

        this.container = document.createElement('div')
        this.container.classList.add('paint')

        // toolbar
        this.toolbar = document.createElement('div')
        this.toolbar.classList.add('paint-toolbar')
        this.container.appendChild(this.toolbar)

        // save
        this.save_button = document.createElement('img')
        this.save_button.src = 'save.png'
        this.save_button.classList.add('editor-save')
        this.toolbar.appendChild(this.save_button)

        this.save_button.addEventListener('click', (e) => {
            var data = this.canvas.toDataURL("image/jpeg", 1.0);
            let a = document.createElement('a');
            a.href = data;
            a.download = 'image.jpeg';
            a.click();
        })

        // erase
        this.erase_button = document.createElement('img')
        this.erase_button.src = 'eraser.png'
        this.erase_button.classList.add('paint-erase')
        this.toolbar.appendChild(this.erase_button)

        this.erase_button.addEventListener('click', (e) => {
            this.erase()
        })

        // color pick
        this.color_picker = document.createElement('input')
        this.color_picker.type = 'color'
        this.color_picker.classList.add('paint-color-picker')
        this.toolbar.appendChild(this.color_picker)

        this.color_picker.addEventListener('change', (e) => {
            this.ctx.strokeStyle = e.target.value
        })

        this.canvas = document.createElement('canvas')
        this.canvas.classList.add('paint-canvas')
        this.canvas.width = 640
        this.canvas.height = 640
        this.container.appendChild(this.canvas)

        this.ctx = this.canvas.getContext('2d')
        this.ctx.strokeStyle = "#000"
        this.ctx.lineJoin = "round"
        this.ctx.lineCap = "round"

        this.canvas.addEventListener('mousedown', (e) => {
            this.state.draw_start = true
            this.ctx.beginPath()
        })

        this.canvas.addEventListener('mouseup', (e) => {
            this.state.draw_start = false
        })

        this.canvas.addEventListener('mousemove', (e) => {
            let bounds = this.canvas.getBoundingClientRect();
            console.log(bounds)
            this.state.prev_x = this.state.cur_x
            this.state.prev_y = this.state.cur_y
            this.state.cur_x = e.pageX - bounds.left
            this.state.cur_y = e.pageY - bounds.top
            this.state.cur_x /= bounds.width;
            this.state.cur_y /= bounds.height;
            this.state.cur_x *= this.canvas.width;
            this.state.cur_y *= this.canvas.height;
  
            if (this.state.draw_start === true) {
                // this.ctx.moveTo(this.prev_x, this.prev_y)
                this.ctx.lineTo(this.state.cur_x, this.state.cur_y)
                this.ctx.stroke()
            }
        })

        this.erase()

        return this.container
    }

    erase() {
        this.ctx.fillStyle = '#fff'
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

let txt = document.querySelector('#txt-app')
txt.addEventListener('click', (e) => {
    let w = new Window(new TextEditor(), {width: 300, height: 300, title: 'Text'})
    w.show()
})

let mp3 = document.querySelector('#mp3-app')
let songs = [
    'mp3/Crush Limbo - FMA Podcast Suggestion-The-Bird-Has-Flipped.mp3',
    'mp3/Ketsa - 06 Sun-Breaks-The-Clouds.mp3',
    'mp3/The Spin Wires - Reckless.mp3',
    'mp3/The Spin Wires - Slam Van.mp3'
]
mp3.addEventListener('click', (e) => {
    let app = new AudioPlayer(songs)
    let w = new Window(app, {width: 300, height: 300, title: 'Player'}, app.close)
    w.show()
})

let paint = document.querySelector('#paint-app')
paint.addEventListener('click', (e) => {
    let app = new Paint()
    let w = new Window(app, {width: 300, height: 300, title: 'Paint'}, app.close)
    w.show()
})