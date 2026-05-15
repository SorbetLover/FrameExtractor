const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec, spawn } = require('child_process');
const fs = require('fs');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  fs.mkdirSync("./output")
  fs.mkdirSync("./input")
}

app.whenReady().then(createWindow);

ipcMain.on('extract', (event, cmddd) => {

  exec(cmddd, (error, stdout, stderr) => {
      console.log("done");
      event.reply("result", "done");
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});



ipcMain.on('getVideos', (event) => {
  const namesss = fs.readdirSync("./input")
  event.reply("recieveVideos", namesss)

})

ipcMain.on("makeFolder", (event, arg1) =>{
  fs.mkdirSync("./output/" + arg1, { recursive: true });
})

ipcMain.on("extractframes", (event, videoe, frome, toe) => {
  const folderName = videoe.replace(".mp4", "");
  
  const inputPath = path.resolve(__dirname, "input", videoe);
  const outputDir = path.resolve(__dirname, "output", folderName);
  const outputPath = path.join(outputDir, "frame_%04d.jpg");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const comando = `ffmpeg -ss ${frome} -to ${toe} -i "${inputPath}" -q:v 2 "${outputPath}"`;
  
  const ffmpeg = spawn(comando, { shell: true });

  ffmpeg.stderr.on("data", (data) => {
      event.reply("extractframes-progress", data.toString());
  });
  ffmpeg.on("close", (code) => {
    if (code === 0) {
        event.reply("extractframes-progress", "\n    Finished");
    } else {
        console.error(`\n    Failed w code: ${code}`);
    }
});
});
