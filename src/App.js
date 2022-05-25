
import React, { useRef } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import { render } from "react-dom";
import FPSStats from "react-fps-stats";
import Stats from "stats.js";
import barApp from "./bar"
import Typography from '@mui/material/Typography';
import { Debugout } from 'debugout.js';

// function setupFPS() {
//   stats.showPanel(0);
// }
const bugout = new Debugout({ realTimeLoggingOn: false });
const stats = new Stats();
/**
 * Sets up a frames per second panel on the top-left of the window
 */
 function setupFPS() {
  stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
  document.getElementById('main').appendChild(stats.dom);
}

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

//  Load posenet
  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      scale: 0.5,
    })
    //
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const detect = async (net) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get Video Properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      stats.begin();

      // Make Detections
      const pose = await net.estimateSinglePose(video);
      bugout.realTimeLoggingOn = true;
      bugout.log(pose)


      // console.log(pose, JSON.stringify(pose, null, 2));

      drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
    }
    bugout.downloadLog()
  };

  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  };

  runPosenet();
  stats.end();
  // requestAnimationFrame( animate );

  return (
    <div className="App">
      <Typography variant="h6" right="auto" left={"0em"} >Real-time web cam detection with PoseNet</Typography>
      <header className="App-header">
        {/* <setupFPS left="auto" right={"0em"} /> */}
        <FPSStats left="auto" right={"0em"} />
        <Webcam
          ref={webcamRef}
          style={{
            position:"absolute",
            marginLeft:"auto", 
            marginRight:"auto", 
            left:0, 
            right:0, 
            textAlign:"center",
            zindex:9,
            width:640,
            height:480
          }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position:"absolute",
            marginLeft:"auto", 
            marginRight:"auto", 
            left:0, 
            right:0, 
            textAlign:"center",
            zindex:9,
            width:640,
            height:480
          }}
        />
      </header>
    </div>
  );
}
// requestAnimationFrame( animate );

export default App;
