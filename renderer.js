const { ipcRenderer, ipcMain } = require('electron');


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
    ipcRenderer.send("makeFolder", document.getElementById("pau").value.replace(".mp4", ""));
    document.getElementById("subject").src = "./input/" + document.getElementById("pau").value;
    document.getElementById("outtext").innerText = "Output: ./" + document.getElementById("pau").value.replace(".mp4", "");

})

ipcRenderer.send('getVideos');

ipcRenderer.on("recieveVideos", (event, result) =>{
    let mer = "";
    for(let i = 0; i < result.length; i++){
        let bola = document.getElementById("pau")
        let butico = document.createElement("option")
        butico.text = result[i];
        bola.appendChild(butico)
    }

})

ipcRenderer.on("extractframes-progress", (event, texx) => {
  document.getElementById("resultado").value += texx;
  document.getElementById("resultado").scrollTop = document.getElementById("resultado").scrollHeight;
})