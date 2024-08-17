let songs;
let currentFolder;

async function getSongs(folder) {                                         // 1
    currentFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // show all the songs in the playlist
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li><img class="invert" src="icons/music.svg" alt="music">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
        </div>
        <div class="playNow">
            <span>Play Now</span>
            <img class="invert" src="icons/playThis.svg" alt="">
        </div>
    </li>`;
    }

    // attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    });

    return songs;
}

function secondsToMinutesAndSeconds(seconds) {                            // 6
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedseconds = String(remainingSeconds).padStart(2, "0");
    return `${formattedMinutes}:${formattedseconds}`;
}

let currentSong = new Audio();                                            // 3
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currentFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "icons/pause.svg";
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track);
    document.querySelector(".songTime").innerHTML = "00:00/ 00:00"
}

async function diplayAlbums() {                                           // 13.1
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];

            // get the metadata of the folder                             // 13.2
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            let cardContainer = document.querySelector(".cardContainer");
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
            <div class="play">
                <svg xmlns="http://www.w3.org/2000/svg" width="70" height="70" viewBox="0 0 70 70">
                    <circle cx="28" cy="28" r="25" fill="#1fdf64" stroke="#1fdf64" stroke-width="2" />
                    <g transform="translate(15, 15)">
                        <path
                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                            stroke="black" stroke-width="1.5" stroke-linejoin="round"
                            transform="scale(1.2)" />
                    </g>
                </svg>
            </div>
            <img src="/songs/${folder}/cover.jpg" />
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }

    // load the playlist whenever card is clicked                         // 12
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);

            // also play the 1st song
            playMusic(songs[0]);
        });
    });
}

async function main() {                                                   // 2
    // get list of songs
    await getSongs("songs/lofi");

    playMusic(songs[0], true);        // single line 7      

    // display all the albums on the page                                 // 13
    diplayAlbums();

    // attach an event listener to play, next and previous
    play.addEventListener("click", () => {                                // 4
        if (currentSong.paused) {
            currentSong.play();
            play.src = "icons/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "icons/playNow.svg";
        }
    });

    // listen for timeupdate event                                        // 5
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songTime").innerHTML = `${secondsToMinutesAndSeconds(currentSong.currentTime)} / ${secondsToMinutesAndSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // add an event listener for hamburger                                // 8
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // add an event listener for close button                             // 9
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100" + "%";
    });

     //  add an event listener for previous                                // 10
     previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    });

    //  add an event listener for next                                       //10.1
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0]);
        }
    });

    // for auto next                                                         // 21
    setInterval(()=>{
        if(document.querySelector(".circle").style.left == "100%"){
            let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0]);
                    playMusic(songs[index + 1]);
        }
    },1000);

    // Add an event to volume                                             // 11
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;

        if(currentSong.volume >0){                                       // 15
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("icons/mute.svg", "icons/volume.svg");
        }
    });

    // add an event listener to mute the track                             // 14
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("icons/volume.svg")) { 
            e.target.src = e.target.src.replace("icons/volume.svg", "icons/mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("icons/mute.svg", "icons/volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });

    // // add an event listener to dark mode and night mode                   // 20
    document.querySelector(".lightMode").addEventListener("click", e=>{
        let icon = document.querySelector(".lightMode");
        document.body.classList.toggle("light-theme")
        if(document.body.classList.contains("light-theme")){
            icon.src = "icons/lightMode.svg"
        }
        else{
            icon.src = "icons/darkMode.svg";   
        }
    })
   
}

main();