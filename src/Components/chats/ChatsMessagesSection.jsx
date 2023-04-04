import React, { useContext, useRef } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  ListItem,
  Avatar,
  ListItemAvatar,
  ListItemText,
  IconButton,
  List,
  CircularProgress,
  Typography,
} from "@mui/material";
import Peer from "simple-peer";
import MessageIcon from "@mui/icons-material/Message";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import CallIcon from "@mui/icons-material/Call";

import "../../styles.scss";
import { AppContext } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ChatMessages } from "./ChatMessages";
import { deepOrange } from "@mui/material/colors";
import { CALL_DEVELOPMENT } from "../../utils";
import { closeCallStream } from "../../helpers/calls";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

export const ChatsMessagesSection = ({
  setIsCallingActive,
  callStatus,
  setCallStatus,
  setTimeoutID,
  chatSectionRef,
  setShowChatMessages,
  setShowChatsList,
}) => {
  let {
    currentChatState,
    setCurrentChatState,
    socket,
    userState,
    stream,
    setStream,
    otherUser,
    setOtherUser,
    setOtherUserStream,
    uiState,
  } = useContext(AppContext);

  const userVideo = useRef();

  const navigate = useNavigate();

  const handleSendMessage = (e) => {
    if (currentChatState.newMessage === "") return;
    console.log(currentChatState.newMessage);
    socket.emit("send-message", {
      content: currentChatState.newMessage,
      senderId: userState.id,
      chatId: currentChatState.id,
      otherUsername: currentChatState?.otherUsername,
    });
    setCurrentChatState({
      ...currentChatState,
      newMessage: "",
    });
  };

  const handleStartCall = async () => {
    if (!CALL_DEVELOPMENT) {
      console.log("STARTING CALL ");
      try {
        setIsCallingActive(true);

        let navigatorStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        console.log(navigatorStream);
        setStream(navigatorStream);
        if (userVideo.current) {
          userVideo.current.srcObject = navigatorStream;
        }

        setTimeoutID(
          setTimeout(() => {
            console.log("TIMEOUT ACTIVE");
            console.log("CURRENT CALL STATE", callStatus);
            if (callStatus !== "CONNECTED") {
              setOtherUser((otherUser) => {
                console.log(
                  "CALL EXPIRED, FROM: ",
                  userState,
                  "TO: ",
                  otherUser
                );

                socket.emit("callExpired", { from: userState, to: otherUser });
                return otherUser;
              });

              setCallStatus("FAILED");
              setIsCallingActive(false);
              try {
                closeCallStream(stream);
              } catch (err) {
                console.log(err);
              }
              setStream(null);
              setOtherUserStream(null);
            }
          }, 11000)
        );

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: navigatorStream,
        });

        peer.on("signal", (data) => {
          socket.emit("callUser", {
            chatId: currentChatState.id,
            signalData: data,
            from: userState,
          });
        });

        peer.on("stream", (partnerStream) => {
          // if (partnerVideo.current) {
          //   partnerVideo.current.srcObject = stream;
          // }
          console.log("SETTING OTHER USER STREAM", otherUser);
          setOtherUserStream(partnerStream);
          console.log("stream", navigatorStream, "otro stream", partnerStream);
          console.log("-----------------> stream");
          setIsCallingActive(false);
          setCallStatus("CONNECTED");
          navigate("/video-call");
        });

        socket.on("callAccepted", (signal) => {
          // setCallAccepted(true);
          peer.signal(signal);
          console.log("LLAMADA ACEPTADA");
          console.log("-----------------> callAccepted");
        });

        socket.on("callReceiver", (receiver) => {
          console.log("CALL RECEIVER ->", receiver);
          setOtherUser(receiver);
        });

        socket.on("callDeclined", () => {
          console.log("LLAMADA RECHAZADA");
          setIsCallingActive(false);
          setCallStatus("DECLINED");
          setStream(null);
          setOtherUserStream(null);
          // navigate("/chats");

          // setCallStatus("FAILED");
          //     setIsCallingActive(false);
          //     try {
          //       closeCallStream(stream);
          //     } catch (err) {
          //       console.log(err);
          //     }
          //     setStream(null);
          //     setOtherUserStream(null);
        });
      } catch (err) {
        alert(err);
      }
    } else {
      // go to /video-call/:chatId
      navigate(`/video-call`);
    }
  };

  return (
    <Box sx={{ display: "grid", height: "800px", maxHeight: "800px" }}>
      {currentChatState.name !== null && (
        <Box
          xs={3}
          sx={{
            // width: 300,
            height: 80,
            backgroundColor: "primary.dark",
            color: "white",
            // '&:hover': {
            //   backgroundColor: 'primary.main',
            //   opacity: [0.9, 0.8, 0.7],
          }}
        >
          {/* Icons and information of current chat */}
          {currentChatState.name !== null && (
            <List sx={{ display: "flex", margin: "auto 0" }}>
              <ListItem sx={{ paddingLeft: "0" }}>
                <IconButton
                  sx={{
                    color: "white",
                    ml: 1,
                    mr: 1,
                    display: { md: "none", xs: "block" },
                  }}
                  onClick={() => {
                    setShowChatMessages(false);
                    setShowChatsList(true);
                    setCurrentChatState({
                      name: null,
                      id: null,
                      otherUsername: null,
                    });
                    navigate("/chats");
                  }}
                >
                  <ArrowBackIcon sx={{ margin: "0" }} />
                </IconButton>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: deepOrange[500] }}>
                    {currentChatState.name[0]}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText>{currentChatState.name}</ListItemText>
                <IconButton
                  // edge="end"
                  aria-label="delete"
                  sx={{ color: "white" }}
                  mr={5}
                  onClick={handleStartCall}
                >
                  <CallIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  sx={{ color: "white" }}
                >
                  <ImageSearchIcon />
                </IconButton>
              </ListItem>
            </List>
          )}
          {/* Usuario actual: {`${userState.username} - ${userState.id}`}. Nombre
            del chat {currentChatState.name} */}
        </Box>
      )}

      <Box xs={9} sx={{}}>
        {uiState.state === "loading" ? (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            flexDirection={"column"}
            sx={{}}
            marginTop={10}
          >
            <CircularProgress />
            <Typography color={"primary"} fontSize={26}>
              Loading chats...
            </Typography>
          </Grid>
        ) : currentChatState.name === null ? (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            flexDirection={"column"}
            height={720}
            maxHeight={720}
          >
            <MessageIcon color="primary" sx={{ fontSize: 100 }} />
            <Typography color={"primary"} fontSize={26}>
              Select a chat to start messaging
            </Typography>
          </Grid>
        ) : (
          <Box
            height={720}
            maxHeight={720}
            sx={{
              //   backgroundColor: "yellow",
              display: "grid",
              gridTemplateRows: "90% 7.5%",
              rowGap: "10px",
            }}
          >
            <Box
              sx={{
                overflowY: "auto",
                // backgroundColor: "blue",
              }}
            >
              <ChatMessages />
            </Box>
            <Box sx={{}}>
              <Grid container>
                <Grid item xs={11} sx={{ paddingLeft: "15px" }}>
                  <TextField
                    label="Write a message"
                    variant="filled"
                    multiline
                    fullWidth
                    value={currentChatState.newMessage}
                    onChange={(e) =>
                      setCurrentChatState({
                        ...currentChatState,
                        newMessage: e.target.value,
                      })
                    }
                    onKeyPress={(e) => {
                      if (e.which === 13 && !e.shiftKey) {
                        e.preventDefault();
                        // console.log("Envie");
                        handleSendMessage(e);
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={1}>
                  <Button
                    variant={
                      currentChatState.newMessage !== ""
                        ? "outlined"
                        : "disabled"
                    }
                    color="primary"
                    onClick={handleSendMessage}
                  >
                    Send
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
