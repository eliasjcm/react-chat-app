import { Grid, Typography } from "@mui/material";
import React, { useEffect, useRef } from "react";
import { useContext } from "react";
import { AppContext } from "../../context/AppContext";

export const VideoCall = () => {
  const { otherUser, stream } = useContext(AppContext);
  const myVideo = useRef();
  const partnerVideo = useRef();

  useEffect(() => {
    console.log("myVideo", myVideo);
    myVideo.current.srcObject = stream;
    console.log("partnerVideo", partnerVideo);
    partnerVideo.current.srcObject = otherUser.stream;

  }, []);

  return (
    <div>
      <Grid
        container
        justifyContent={"center"}
        alignContent={"center"}
        sx={{ marginTop: 15 }}
      >
        <Grid
          container
          item
          xs={6}
          justifyContent={"center"}
          alignContent={"center"}
          flexDirection={"column"}
        >
          <Grid item>
            <Typography width="100%" sx={{ textAlign: "center" }}>
              Your camera
            </Typography>
          </Grid>
          <Grid item sx={{ width: "35vw", height: "40vh" }}>
            <video
              style={{
                width: "inherit",
                height: "inherit",
                objectFit: "cover",
              }}
              autoPlay
              playsInline
              ref={myVideo}
            >
              <source
                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                type="video/mp4"
              />
            </video>
          </Grid>
        </Grid>
        <Grid
          container
          item
          xs={6}
          justifyContent={"center"}
          alignContent={"center"}
          flexDirection={"column"}
        >
          <Grid item>
            <Typography width="100%" sx={{ textAlign: "center" }}>
              Your camera
            </Typography>
          </Grid>
          <Grid item sx={{ width: "35vw", height: "40vh" }}>
            <video
              style={{
                width: "inherit",
                height: "inherit",
                objectFit: "cover",
              }}
              autoPlay
              playsInline
              ref={partnerVideo}
            >
              <source
                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                type="video/mp4"
              />
            </video>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};
