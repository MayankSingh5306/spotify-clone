import { supabase } from "./supabaseClient.js";

function getSongInfo(fileName){
    fileName=fileName.replace(/\.mp3$/, '');
    let [songName, artistName]= fileName.split(' - ');
    return {songName, artistName}; // gives song name and artist name
}

async function getSongs(folder) {
    const {data, error}=await supabase.storage.from('Music').list(folder); // Fetch files in the folder
    if (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
    
    let songs=[]
    for (let i = 0; i < data.length; i++) {
        if(data[i].name.endsWith('.mp3')){ // Add only songs and not the info.json
            songs.push(data[i])
        }
    }
    
    let result= songs.map(file=>{
        let songinfo = getSongInfo(file.name) // fetch name of song and artist
        let filePath = `${folder}/${file.name}`
        
        let { data: urlData } = supabase.storage.from('Music').getPublicUrl(filePath); // fetch url of song
        songinfo.url = urlData.publicUrl; //add url in songInfo
        
        return songinfo;
    });
    return result;
}

async function cover(folder) {
    const {data, error}=await supabase.storage.from('Music').list(folder); // Fetched files in the folder
    if (error) {
        console.error("Error fetching cover:", error);
        return [];
    };

    let coverName; //store cover name
    for (let i = 0; i < data.length; i++) {
        const element = data[i];
        if (element.name.startsWith('cover.')){
            coverName=element.name;
            break
        }
    }
    
    let filePath=`${folder}/${coverName}`;
    let { data: urlData } = supabase.storage.from('Music').getPublicUrl(filePath);
    return urlData.publicUrl;
}

async function getAlbumInfo(folder) {
    const { data, error } = await supabase.storage.from('Music').download(`${folder}/info.json`);
    // let info = await data.json(); //It will not work as Supabase's .download gives a Blob file and not json file 
    if (error) {
        console.error("Error fetching album info:", error);
        return null;
    }

    let text = await data.text();
    let info=JSON.parse(text);

    return info; // name of album and it's description
}

async function getAlbumFolders(){
    const {data, error}=await supabase.storage.from('Music').list(''); // gives all folder in Music
    if (error) {
        console.error("Error fetching folders:", error);
        return [];
    }

    let folders=[]
    for (let i = 0; i < data.length; i++) {
        folders.push(data[i].name)
    };

    return folders; // give all album name
}

export async function getAllInfo() {   
    let allMusicDetails=[];

    const folders= await getAlbumFolders(); //get all folder
    for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        let obj = await getAlbumInfo(folder) //get album info
        obj.cover=await cover(folder) //get album cover
        obj.songs =await getSongs(folder) //get all songs in that folder

        allMusicDetails.push(obj) //add this detail(obj) in album info
    };
    
    return allMusicDetails;
}
