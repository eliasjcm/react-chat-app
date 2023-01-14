import React, { useContext, useEffect, useRef, useState } from "react";
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
  Backdrop,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import Peer from "simple-peer";
import MessageIcon from "@mui/icons-material/Message";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import CallIcon from "@mui/icons-material/Call";

import "../../styles.scss";
import { AppContext, contextStructure } from "../../context/AppContext";
import { useNavigate } from "react-router-dom";
import { ChatsList } from "./ChatsList";
import { ChatMessages } from "./ChatMessages";
import { deepOrange } from "@mui/material/colors";
import { CALL_DEVELOPMENT } from "../../utils";
import { closeCallStream } from "../../helpers/calls";

const ENDPOINT = "http://192.168.100.47:5000";

const strToDate = (date) => {
  var dateObj = new Date(date);
  var month = dateObj.getUTCMonth() + 1; //months from 1-12
  var day = dateObj.getUTCDate();
  var year = dateObj.getUTCFullYear();
  return year + "/" + month + "/" + day;
};

const addDateToList = (messagesList, currentList) => {
  let newMessagesList = [];
  let currentDate = "";
  if (currentList) {
    for (let i = currentList.length - 1; i >= 0; i--) {
      if (currentList[i].type === "date") {
        currentDate = currentList[i].content;
        break;
      }
    }
  }
  messagesList.forEach((msg) => {
    let newDate = strToDate(msg.createdAt);
    if (currentDate !== newDate) {
      currentDate = newDate;
      newMessagesList.push({
        content: currentDate,
        type: "date",
      });
    }
    newMessagesList.push(msg);
  });
  return newMessagesList;
};
export const ChatsScreen = () => {
  let {
    setChatsListState,
    currentChatState,
    setCurrentChatState,
    socket,
    setSocket,
    refChatBox,
    userState,
    stream,
    setStream,
    otherUser,
    setOtherUser,
    setOtherUserStream,
    uiState,
    setUiState,
  } = useContext(AppContext);

  // simple-peer

  const userVideo = useRef();

  const navigate = useNavigate();

  const [isCallingActive, setIsCallingActive] = useState(false);

  const handleCloseNotAnswered = () => {
    setIsCallingActive(false);
    setCallStatus("NONE");
  };

  const handleCloseCallDeclined = () => {
    setIsCallingActive(false);
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    setCallStatus("NONE");
  };

  // NONE, FAILED
  const [callStatus, setCallStatus] = useState("NONE");

  const [timeoutID, setTimeoutID] = useState(null);

  // const [callStatus, setCallStatus] = useState("declin");

  /////////////////////////////

  useEffect(() => {
    setUiState({ state: "loading", message: "Loading chats..." });
    if (socket) {
      console.log("Ahora si");
      console.log(socket);
      socket.emit("chats-list", 5);

      socket.on("chats-list", (chatsList) => {
        console.log(chatsList);
        console.log("Ya llego");
        setChatsListState(chatsList);
        
      });

      socket.on("chat-info", (chatInfo) => {
        /////
        let newMessagesList = addDateToList(chatInfo.chatMessages);
        /////
        // console.log("newMessagesList", newMessagesList);
        setCurrentChatState({
          ...chatInfo,
          newMessage: "",
          chatMessages: newMessagesList,
        });
      });

      socket.on("new-message", (newMessage) => {
        setCurrentChatState((currentChatState) => {
          let newMessages = addDateToList(
            [newMessage],
            currentChatState.chatMessages
          );
          // console.log("FROM STATE", currentChatState);
          return {
            ...currentChatState,
            chatMessages: [...currentChatState.chatMessages, ...newMessages],
          };
        });

        console.log(currentChatState);
        console.log("MENSAJE RECIBIDO");
        socket.emit("chats-list", 5);
      });
    }
    setUiState({ state: "ready", message: "" });
  }, [socket]);



  useEffect(() => {
    return () => {
      console.log("UNMOUNTING with timeoutID", timeoutID);
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
    };
  }, [timeoutID]);

  useEffect(() => {
    console.log(
      "-------------------------------------- OTHER USER CHANGED NOW IT IS ",
      otherUser
    );
  }, [otherUser]);

  useEffect(() => {
    // Scroll to the bottom of the screen every time a new chat is loaded
    if (currentChatState.name !== null) {
      refChatBox.current.scrollTop = refChatBox.current.scrollHeight;
    }

    // console.log(refChatBox.current.scrollTop);
  }, [currentChatState]);

  const handleSendMessage = (e) => {
    if (currentChatState.newMessage === "") return;
    console.log(currentChatState.newMessage);
    socket.emit("send-message", {
      content: currentChatState.newMessage,
      senderId: userState.id,
      chatId: currentChatState.id,
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
    <Grid
      container
      alignItems="center"
      direction="column"
      sx={{
        width: "100%",
        maxWidth: { md: "90vw" },
        margin: "0 auto",
        paddingTop: "2vh",
      }}
    >
      <Grid
        container
        direction="row"
        sx={{ border: "1px red solid", borderColor: "primary.dark" }} 
      >
        <Grid
          item
          xs={12}
          md={3}
          sx={{ borderRight: "1px solid", borderRightColor: "primary.dark" }}
        >
          <ChatsList />
        </Grid>
        <Grid
          item
          xs={0}
          display={{ xs: "none", md: "block",  height: "89vh", backgroundColor: "red" }}
          md={9}
          container
          direction="column"
        >
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
              <List sx={{ display: "flex", margin: "auto 0", height: "100%" }}>
                <ListItem>
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

          <Box xs={9} sx={{height: "100%"}} >
            {uiState.state === "loading" ? (
              <Grid
                container
                justifyContent="center"
                alignItems="center"
                flexDirection={"column"}
                sx={{ height: "100%" }}
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
                sx={{ height: "100%" }}
                marginTop={10}
              >
                <MessageIcon color="primary" sx={{ fontSize: 100 }} />
                <Typography color={"primary"} fontSize={26}>
                  Select a chat to start messaging
                </Typography>
              </Grid>
            ) : (
              <Grid container sx={{backgroundColor: "blue", height: "100%"}}>
                <ChatMessages />
                <Grid container sx={{ paddingTop: 2, paddingLeft: 2}}>
                  <Grid item xs={9}>
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
                  <Grid item xs={3}>
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
              </Grid>
            )}
          </Box>
        </Grid>
      </Grid>
      {/* BACKDROP FOR MESSAGE: */}
      <Backdrop
        sx={{ color: "#fff", zIndex: 5 }}
        // open={open}
        open={
          (isCallingActive && callStatus === "NONE") ||
          (isCallingActive &&
            (callStatus === "FAILED" || callStatus === "DECLINED"))
        }
        // onClick={handleClose}
      >
        {isCallingActive && (
          <Grid
            container
            justifyContent={"center"}
            alignItems={"center"}
            flexDirection="column"
          >
            <Grid item>
              <CircularProgress color="inherit" />
            </Grid>
            <Grid item mt={5}>
              <Typography variant="h6" color="inherit">
                Trying to call {currentChatState.name}
              </Typography>
            </Grid>
          </Grid>
        )}
        <Dialog
          open={callStatus === "FAILED"}
          onClose={handleCloseNotAnswered}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            User cannot be contacted. Call finished.
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseNotAnswered}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={callStatus === "DECLINED"}
          onClose={handleCloseCallDeclined}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            User declined the call.
          </DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseCallDeclined}>Close</Button>
          </DialogActions>
        </Dialog>
      </Backdrop>
    </Grid>
  );
};
