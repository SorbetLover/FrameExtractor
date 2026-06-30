const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const { versions } = require("process");
const { platform } = require("os");
const { warn } = require("console");
// const open = require('open');    

function createWindow() {
    const wind = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, "maomao.png"),
    });

    wind.loadFile("index.html");
    
    if(!fs.existsSync("./output")) fs.mkdirSync("./output/");
    if(!fs.existsSync("./input")) fs.mkdirSync("./input/");
    // if(fs.existsSync("yt-dlp"))
    // let ytpresent = false;
    // let ffpresent = false;
    // if(process.platform == "win32"){
    //     for(let file of fs.readdirSync("./")){
    //         // if(!file.startsWith("yt-dlp")) continue;
    //         if(file.startsWith("ffmpeg")) ffpresent = true;
    //         if(file.startsWith("yt-dlp")) ytpresent = true;
    //     }
    //     console.log((ytpresent ? "" : "Install yt-dlp binary" + ((process.platform == "win32") ? "in the root folder" : "in the system")))
    //     console.log((ffpresent ? "" : "Install ffmpeg binary " + ((process.platform == "win32") ? "in the root folder" : "in the system")))
    //     // if(!ffpresent) openLink("https://www.ffmpeg.org/download.html");
    //     // if(!ytpresent) openLink("https://github.com/yt-dlp/yt-dlp/releases/");
    //     // alert("test")
    //     if(!ytpresent || !ffpresent) dialog.showMessageBox(wind, {
    //         type: 'info',
    //         title: 'Missing dependencies',
    //         message: "You must install " + (!ffpresent ? "FFMpeg" : "") + (!ffpresent && !ytpresent ? " and " : "") + (!ytpresent ? "yt-dlp" : ""),
    //         buttons: ['OK']
    //     })
    // }
}
// app.whenReady().
app.whenReady().then(createWindow);

ipcMain.on("extract", (event, cmddd) => {
    exec(cmddd, (error, stdout, stderr) => {
        console.log("done");
        event.reply("result", "done");
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

ipcMain.on("getVideos", (event) => {
    const namesss = fs.readdirSync("./input");
    event.reply("recieveVideos", namesss);
});

ipcMain.on("makeFolder", (event, arg1) => {
    fs.mkdirSync("./output/" + arg1, { recursive: true });
    fs.mkdirSync("./output/" + arg1 + "/output/", { recursive: true });
    fs.mkdirSync("./output/" + arg1 + "/keep/", { recursive: true });
    fs.mkdirSync("./output/" + arg1 + "/output/video/", { recursive: true });
    // console.log("AAA");

});


ipcMain.on(
    "extractframes", (event, videoe, frome, toe, olde, usepng, cutvid) => {

        const folderName = videoe.replace(".mp4", "");

        const inputPath = path.resolve(__dirname, "input", videoe);
        const outputDir = path.resolve(
            __dirname,
            "output",
            folderName + "/output/",
        );
        let ffm = "ffmpeg";
        if(process.platform == "win32"){
            ffm = "ffmpeg.exe";
        }
        let comando = "";
        if(!cutvid){
            const theextension = usepng ? ".png" : ".jpg";
            let outputPath = "";
            if (olde) {
                outputPath = path.join(
                    outputDir,
                    "f" + frome + "t" + toe + "_frame_%04d" + 
                    theextension,
                );
            } else {

                    outputPath = path.join(
                        outputDir,
                        "frame_%04d" + "from_" + frome + "_until_" + toe +
                        theextension,
                    );
            }
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            // comando = `ffmpeg -ss ${frome} -to ${toe} -i "${inputPath}" -q:v 2 "${outputPath}"`;
            comando = `${ffm} -ss ${frome} -to ${toe} -i "${inputPath}" -q:v 2 -fps_mode vfr -frame_pts true "${outputPath}"`;

        } else {
            outputPath = path.join(
                outputDir,
                "/video/" + 
                videoe + "_from_" + frome + "_until_" + toe +
                ".mp4",
            );
            comando = `${ffm} -ss ${frome} -to ${toe} -i "${inputPath}" -c copy "${outputPath}"`;
        }
        const ffmpeg = spawn(comando, { shell: true });

        // ffmpeg.stderr.on("data", (data) => {
        //     event.reply("extractframes-progress", data.toString());
        // });
        ffmpeg.on("close", (code) => {
            if (code === 0) {
                event.reply("extractframes-progress", "\n    Finished");
            } else {
                console.error(`\n    Failed w code: ${code}`);
            }
        });
    },
);

ipcMain.on("fromyt", (event, link) => {
    console.log("\n\n ...")
    const namething = spawn((process.platform == "win32" ? "./" : "") + 'yt-dlp' + (process.platform == "win32" ? ".exe" : ""), ['--print', "%(title)s.%(ext)s", link]);   
    let vname = ""
    namething.stdout.on('data', (data) => {
        console.log(data.toString());
        vname = data.toString();

    });
    namething.on("close", (code) => {

        if(code != 0) console.log(code);
    });

    console.log(link);

    const ytdlp = spawn((process.platform == "win32" ? "./" : "") + "yt-dlp" + (process.platform == "win32" ? ".exe" : ""), [link, "-P", "./input/", "-o", "%(title)s.%(ext)s"]);
    ytdlp.on("close", (code) => {
        if(code != 0){
            console.log(code);
        }
        event.reply("fromyt", vname)
    })
})  