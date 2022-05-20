import React, { useRef } from "react";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./utilities";
import { render } from "react-dom";
import FPSStats from "react-fps-stats";
import barApp from "./bar"
import Typography from '@mui/material/Typography';

// function setupFPS() {
//   stats.showPanel(0);
// }

//  References
function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

//  Load posenet
  const runPosenet = async () => {
    const net = await posenet.load({
      inputResolution: { width: 640, height: 480 },
      //  Higher scale, higher accuracy
      scale: 0.5,
    })
    // Allow detection every 100 ms
    setInterval(() => {
      detect(net);
    }, 100);
  };

  //  Parse through posenet model
  const detect = async (net) => {
    //  Ensure webcam ready
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // Get video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // Set video width
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      // Make detections
      const pose = await net.estimateSinglePose(video);
      console.log(pose);

      drawCanvas(pose, video, videoWidth, videoHeight, canvasRef);
    }
  };

  // Ensure canvas matches with video properties, call utilities from tensorflow models
  const drawCanvas = (pose, video, videoWidth, videoHeight, canvas) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;

    drawKeypoints(pose["keypoints"], 0.6, ctx);
    drawSkeleton(pose["keypoints"], 0.7, ctx);
  };

  runPosenet();

  return (
    <div className="App">
      <Typography variant="h6" right="auto" left={"0em"} >Real-time web cam detection with PoseNet</Typography>
      <header className="App-header">
        <FPSStats left="auto" right={"0em"} />
          //  Setup webcam and canvas to drawSkeleton over
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

export default App;
