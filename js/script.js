import { getAllInfo } from './supabase/musicStorage.js';

const albumData= await getAllInfo();
// console.log(albumData);

let currentSong = new Audio();
let currentSongName;
let play = document.getElementById("play");
let previous = document.getElementById("previous");
let next = document.getElementById("next");

currentSong.volume=0.4;

async function displayAlbums() {
    console.log("displaying albums")
    let cardContainer = document.querySelector(".cardContainer")
    for (let index = 0; index < albumData.length; index++) {
        const obj = albumData[index]; 
        cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${obj.title}" class="card">
            <div class="play"> <!--Play Button--> 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>

            <img src="${obj.cover}" alt="">
            <h2>${obj.title}</h2>
            <p>${obj.description}</p>
        </div>`
    }

    // Plays First Song when clicked on any album
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            let fetchedTitleName = item.currentTarget.dataset.folder;
            const albumDetails=albumData.find(x => x.title===fetchedTitleName) // find the album obj which is clicked
            if (albumDetails){
                await getSongs(albumDetails);
                playMusic(albumDetails.songs[0])
            }
        })
    })
}

const playMusic = (songObj, pause = false) => {
    currentSong.src =  songObj.url;
    currentSongName = songObj.songName
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = currentSongName
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

function getSongObj(songTitle) {
    for (let i = 0; i < albumData.length; i++) {
        const element = albumData[i];
        if (element.title==songTitle){
            return element.songs
        }       
    }

    return []
}

async function getSongs(obj) {
    let title=obj.title;
    
    // Show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    let allSongs=obj.songs
    for (const song of allSongs) {
        songUL.innerHTML = songUL.innerHTML + `
        <li><img class="invert" width="34" src="img/music.svg" alt="">
        <div class="info" data-folder="${title}">
        <div>${song.songName}</div>
        <div>${song.artistName}</div>
        </div>
        <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="">
        </div> 
        </li>`;
    }
    
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e  => { // e stores li one by one
        e.addEventListener("click", async event => {
            let songObj=getSongObj(event.currentTarget.querySelector(".info").dataset.folder); // give folder name to get all songs
            let songNameClicked=event.currentTarget.querySelector(".info").firstElementChild.innerHTML.trim()
            
            const songData=songObj.find(x => x.songName==songNameClicked); // Find the obj of that clicked song
            if (songData){
                playMusic(songData)
            }
        })
    })
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function main() {
    // Display all the albums on the page
    await displayAlbums()
    
    // Add an event listener to control song using spacebar
    document.addEventListener("keydown", (e)=>{
        if (e.key===' '){
            // Don't interfere with typing
            if (e.target.tagName==="INPUT" || e.target.tagName==="TEXTAREA" || e.target.isContentEditable) {
                return;
            }
            e.preventDefault();
            if (currentSong.src){
                if (currentSong.paused) {
                    currentSong.play();
                    play.src = "img/pause.svg";
                }
                else {
                    currentSong.pause();
                    play.src = "img/play.svg";
                }
            }
        }
    })
    
    // Automatically play next song when current song is ends
    currentSong.addEventListener("ended",()=>{
        next.click();
    })
    
    // Add an event listener to previous
    previous.addEventListener("click", () => {
        currentSong.pause()

        let songTitle=document.querySelector(".songinfo").innerHTML;
        let albumName=document.querySelector(".info").dataset.folder;
        let albumNameAllSongs=albumData.find(x => x.title==albumName).songs;
        let songIndex = albumNameAllSongs.findIndex(x => x.songName === songTitle);

        if (songIndex-1 >= 0){
            playMusic(albumNameAllSongs[songIndex-1])
        }
        else{
            play.src = "img/play.svg"
        }
    })

    // Add an event listener to next
    next.addEventListener("click", () => {
        currentSong.pause()

        let songTitle=document.querySelector(".songinfo").innerHTML;
        let albumName=document.querySelector(".info").dataset.folder;
        let albumNameAllSongs=albumData.find(x => x.title==albumName).songs;
        let songIndex = albumNameAllSongs.findIndex(x => x.songName === songTitle);

        if (songIndex+1 < albumNameAllSongs.length){
            playMusic(albumNameAllSongs[songIndex+1])
        }
        else{
            play.src = "img/play.svg"
        }
    })

    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
        }
        if (currentSong.volume===0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("volume.svg", "mute.svg")
        }
    })

    // Add event listener to mute the song
    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main() 
