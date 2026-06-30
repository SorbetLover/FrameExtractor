const { ipcRenderer, ipcMain } = require('electron');
const fs = require("fs");
const path = require('path'); // or const path = require('path');
const { disconnect } = require('process');

document.getElementById('btn').addEventListener('click', () => {
    console.log(document.getElementById("cb").checked + " and " + document.getElementById("cb3").checked) 
    document.getElementById("resultado").value = "";
    ipcRenderer.send("extractframes", 
        document.getElementById("pau").value, 
        document.getElementById("exfrom").value, 
        document.getElementById("exto").value, 
        document.getElementById("cb").checked, 
        document.getElementById("cb3").checked,
        document.getElementById("cb2").checked
    );

});
document.getElementById("btnload").addEventListener("click", () =>{
    if(document.getElementById("fromyt").value != null && document.getElementById("fromyt").value !== ""){
        ipcRenderer.send("fromyt", document.getElementById("fromyt").value)
        document.getElementById("fromyt").value = "";
    } else {
        ipcRenderer.send("makeFolder", document.getElementById("pau").value.replace(".mp4", ""));
        document.getElementById("subject").src = "./input/" + document.getElementById("pau").value;
        document.getElementById("outtext").innerText = "Output: ./" + path.parse(document.getElementById("pau").value).name;        
    }

})
ipcRenderer.on("fromyt", (event, msg) => {
    console.log(msg);
    console.log(msg);
    ipcRenderer.send('getVideos');
    document.getElementById("subject").src = "./input/" + msg;
    document.getElementById("outtext").innerText = "Output: ./" + path.parse(msg).name; 
    // let theop = 0;
    // let theii = document.getElementById("pau").options.length - 1
    // for(let i = theii; i >= 0; i--){
    //     if(document.getElementById("pau").options[i].value == path.parse(msg).name){
    //         // theop = i;
    //         document.getElementById("pau").selectedIndex = i;
    //         break;
    //     } 
    // }
    // document.getElementById("pau").value = "AAAAA";


})

ipcRenderer.send('getVideos');

ipcRenderer.on("recieveVideos", (event, result) =>{
    let mer = "";
    let bola = document.getElementById("pau")
    // bola.querySelectorAll('select').forEach(eg => eg.remove())
    var i, L = bola.options.length - 1;
    for(i = L; i >= 0; i--) {
        selectElement.remove(i);
    }
    for(let i = 0; i < result.length; i++){
        let butico = document.createElement("option")
        butico.text = result[i];
        bola.appendChild(butico)
    }

})

ipcRenderer.on("extractframes-progress", (event, texx) => {
  document.getElementById("resultado").value += texx;
  document.getElementById("resultado").scrollTop = document.getElementById("resultado").scrollHeight;
})
// dialog.showMessageBox(window,{
//     type: "warning",
//     buttons: ["Ok"],
//     defaultId: 0,
//     cancelId: 0,
//     title: "Install ffmpeg",
//     message: "You dont have it",
//     detail: "."
// });

// if(!fs.existsSync("ffmpeg.exe") && process.platform == "win32"){
//     alert("Install ffmpeg.exe in the root folder");
// }
