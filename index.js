const tfnode = require('@tensorflow/tfjs-node');
const fs = require('fs');
const jsonfile = require('jsonfile');
const { Observable, forkJoin } = require('rxjs');
const cp = require('child_process'),
exec = cp.exec;

const express = require("express");
const app = express();
const fileUpload = require('express-fileupload');
const path = require('path');
const winston = require('winston');
const consoleTransport = new winston.transports.Console()
const myWinstonOptions = {
    transports: [consoleTransport]
}
const logger = new winston.createLogger(myWinstonOptions)

let model;
let labels;
let version;
const currentModelPath = './model';
const imagePath = './public/input';
const newModelPath = './model-new';
const oldModelPath = './model-old';
const staticPath = './public/js';
const mmsPath = './mms-shared';
const localPath = './local-shared';
let sharedPath = '';
let timer;
const intervalMS = 10000;

app.use(fileUpload());

app.use('/static', express.static('public'));

app.get('/',(req,res,next) => { //here just add next parameter
  res.sendFile(
    path.resolve( __dirname, "index.html" )
  )
  next();
})

app.get("/ieam", (req, res) => {
  res.json(["Rob", "Glen","Sanjeev","Joe","Jeff"]);
});

app.post('/upload', function(req, res) {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    } else {
      // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
      let imageFile = req.files.imageFile;
      let uploadPath = __dirname + `/public/input/image.png`;
  
      // Use the mv() method to place the file somewhere on your server
      imageFile.mv(uploadPath, function(err) {
        if (err)
          return res.status(500).send(err);
  
        res.send({status: true, message: 'File uploaded!'});
      });
  
    }  
  } catch(err) {
    res.status(500).send(err);
  }
});

app.get("*",  (req, res) => {
  res.sendFile(
      path.resolve( __dirname, "index.html" )
  )
});

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

let ieam = {
  checkImage: async () => {
    const imageFile = `${imagePath}/image.png`;
    if(fs.existsSync(imageFile)) {
      try {
        console.log(imageFile)
        const image = fs.readFileSync(imageFile);
        const decodedImage = tfnode.node.decodeImage(new Uint8Array(image), 3);
        const inputTensor = decodedImage.expandDims(0);
        await ieam.infernce(inputTensor);
      } catch(e) {
        console.log(e);
        fs.unlinkSync(`${imagePath}/image.png`);
      }
    }  
  },  
  infernce: async (inputTensor) => {
    const startTime = tfnode.util.now();
    let outputTensor = await model.predict({input_tensor: inputTensor});
    const scores = await outputTensor['detection_scores'].arraySync();
    const boxes = await outputTensor['detection_boxes'].arraySync();
    const classes = await outputTensor['detection_classes'].arraySync();
    const num = await outputTensor['num_detections'].arraySync();
    const endTime = tfnode.util.now();
    outputTensor['detection_scores'].dispose();
    outputTensor['detection_boxes'].dispose();
    outputTensor['detection_classes'].dispose();
    outputTensor['num_detections'].dispose();
    
    let predictions = [];
    const elapsedTime = endTime - startTime;
    for (let i = 0; i < scores[0].length; i++) {
      if (scores[0][i] > 0.5) {
        predictions.push({
          detectedBox: boxes[0][i].map((el)=>el.toFixed(3)),
          detectedClass: labels[classes[0][i]],
          detectedScore: scores[0][i].toFixed(3)
        });
      }
    }
    console.log('predictions:', predictions.length, predictions[0]);
    console.log('time took: ', elapsedTime);
    console.log('build json...');
    jsonfile.writeFile(`${staticPath}/image.json`, {bbox: predictions, elapsedTime: elapsedTime, version: version}, {spaces: 2});
    ieam.renameFile(`${imagePath}/image.png`, `${imagePath}/image-old.png`);  
  },
  traverse: (dir, done) => {
    var results = [];
    fs.readdir(dir, (err, list) => {
      if (err) return done(err);
      var i = 0;
      (function next() {
        var file = list[i++];
        if (!file) return done(null, results);
        file = path.resolve(dir, file);
        fs.stat(file, (err, stat) => {
          if (stat && stat.isDirectory()) {
            ieam.traverse(file, (err, res) => {
              results = results.concat(res);
              next();
            });
          } else {
            results.push(file);
            next();
          }
        });
      })();
    });
  },
  checkMMS: () => {
    let list;
    if(fs.existsSync(mmsPath)) {
      list = fs.readdirSync(mmsPath);
      list = list.filter(item => /(\.zip)$/.test(item));
      sharedPath = mmsPath;  
    } else {
      list = fs.readdirSync(localPath);
      list = list.filter(item => /(\.zip)$/.test(item));
      sharedPath = localPath;
    }
    return list;
  },
  unzipMMS: (files) => {
    return new Observable((observer) => {
      let arg = '';
      console.log('list', files);
      files.forEach((file) => {
        if(file === 'model.zip') {
          arg = `unzip -o ${sharedPath}/${file} -d ${newModelPath}`;
        } else if(file === 'image.zip') {
          arg = `unzip -o ${sharedPath}/${file} -d ${imagePath}`;
        } else {
          observer.next();
          observer.complete();
        }
        exec(arg, {maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
          fs.unlinkSync(`${sharedPath}/${file}`);
          if(!err) {
            observer.next();
            observer.complete();
          } else {
            console.log(err);
            observer.next();
            observer.complete();
          }
        });
      })
    });    
  },  
  moveFiles: (srcDir, destDir) => {
    return new Observable((observer) => {
      let arg = `cp -r ${srcDir}/* ${destDir}`;
      if(srcDir === newModelPath) {
        arg += ` && rm -rf ${srcDir}/*`;
      }
      exec(arg, {maxBuffer: 1024 * 2000}, (err, stdout, stderr) => {
        if(!err) {
          observer.next();
          observer.complete();
        } else {
          console.log(err);
          observer.error(err);
        }
      });
    });    
  },
  renameFile: (from, to) => {
    if(fs.existsSync(from)) {
      fs.renameSync(from, to);
    }    
  },
  loadModel: async (modelPath) => {
    try {
      delete(model);
      delete(labels);
      delete(version);
      model = await tfnode.node.loadSavedModel(modelPath);
      console.log('loading ', modelPath);
      labels = require(`${modelPath}/assets/labels.json`);
      version = require(`${modelPath}/assets/version.json`);
      console.log('version: ', version)
      if(modelPath === newModelPath) {
        console.log('iam new')
        ieam.moveFiles(currentModelPath, oldModelPath)
        .subscribe({
          next: (v) => ieam.moveFiles(newModelPath, currentModelPath)
            .subscribe({
              next: (v) => {
                console.log('reset timer');
                ieam.resetTimer();
              },   
              error: (e) => {
                console.log('reset timer');
                ieam.resetTimer(); 
              }
            }),  
          error: (e) => {
            console.log('reset timer');
            ieam.resetTimer(); 
          }
        })
      }
    } catch(e) {
      console.log(e);
      if(modelPath === newModelPath) {
        ieam.loadModel(currentModelPath);
      } else if(modelPath === currentModelPath) {
        ieam.loadModel(oldModelPath);
      } else {
        console.log('PANIC! no good model to load');
      }
      ieam.resetTimer();
    }
  },
  resetTimer: () => {
    clearInterval(timer);
    timer = null;
    ieam.setInterval(intervalMS);  
  },
  checkNewModel: async () => {
      let files = fs.readdirSync(newModelPath);
      list = files.filter(item => !(/(^|\/)\.[^\/\.]/g).test(item));
      // console.log(files, list)
      if(list.length > 0) {
        clearInterval(timer);
        await ieam.loadModel(newModelPath);
        // ieam.setInterval(intervalMS);
      }
  },
  setInterval: (ms) => {
    timer = setInterval(async () => {
      let mmsFiles = ieam.checkMMS(); 
      clearInterval(timer);
      if(mmsFiles && mmsFiles.length > 0) {
        ieam.unzipMMS(mmsFiles)
        .subscribe(async () => {
          await ieam.checkNewModel();
          ieam.setInterval(intervalMS);
        }) 
      } else {
        await ieam.checkNewModel();
        ieam.checkImage();
        ieam.setInterval(intervalMS);
      }
    }, ms);
  }    
}

ieam.loadModel(currentModelPath)
ieam.setInterval(intervalMS);
