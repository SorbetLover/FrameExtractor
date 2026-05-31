const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const { versions } = require("process");

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        icon: path.join(__dirname, "maomao.png"),
    });

    win.loadFile("index.html");

    fs.mkdirSync("./output");
    fs.mkdirSync("./input");
}

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
            comando = `ffmpeg -ss ${frome} -to ${toe} -i "${inputPath}" -q:v 2 -fps_mode vfr -frame_pts true "${outputPath}"`;

        } else {
            outputPath = path.join(
                outputDir,
                "/video/" + 
                videoe + "_from_" + frome + "_until_" + toe +
                ".mp4",
            );
            comando = `ffmpeg -ss ${frome} -to ${toe} -i "${inputPath}" -c copy "${outputPath}"`;
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
