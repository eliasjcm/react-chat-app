import {
  Alert,
  Avatar,
  Button,
  CircularProgress,
  Divider,
  Grid,
  LinearProgress,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Snackbar,
  Stack,
  SvgIcon,
  TextField,
  Typography,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import MarkUnreadChatAltIcon from "@mui/icons-material/MarkUnreadChatAlt";
import PeopleIcon from "@mui/icons-material/People";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, minHeight } from "@mui/system";
import { AppContext } from "../../context/AppContext";
import { deepOrange } from "@mui/material/colors";
import { Post } from "../posts/Post";
import { HOSTNAME } from "../../utils";
import { SnackbarMsg } from "../ui/Snackbar";
import axios from "axios";
import ErrorIcon from "@mui/icons-material/Error";
import { PostsList } from "../posts/PostsList";

export const Profile = () => {
  const [ui, setUi] = useState("loading");
  const {
    userState,
    postsListState,
    setPostListState,
    decodedToken,
    setPostsListState,
    uiState,
    setUiState,
    currentChatState,
    setCurrentChatState,
  } = useContext(AppContext);
  const [postText, setPostText] = useState("");

  const [open, setOpen] = React.useState(false);
  const [profileState, setProfileState] = useState({});

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const { username } = useParams();

  useEffect(() => {
    (async () => {
      if (!username) {
        // TODO: Handle no username given
        setProfileState(null);
        return;
      }
      const profileInfoReq = await fetch(
        `${HOSTNAME}/users/profile-info/${username}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const profileInfoRes = await profileInfoReq.json();
      console.log(profileInfoRes);
      console.log("ERROR: ", profileInfoReq.ok);
      if (!profileInfoReq.ok) {
        setProfileState(null);
        setUi("loaded");
        return;
      } else {
        setProfileState(profileInfoRes);
      }
      const postsReq = await fetch(`${HOSTNAME}/posts/${profileInfoRes.id}}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // console.log(request);
      const postsRes = await postsReq.json();
      setPostsListState(postsRes);

      setUi("loaded");
      setUiState({ ...uiState, userInputPost: false });
    })();
  }, [username]);

  const handleFollow = () => {
    const { id: otherUserId } = profileState;

    (async () => {
      // use axios to make a post request to the follow-system/follow endpoint
      // pass otherUserId in the body
      const follow = await axios.post(
        `${HOSTNAME}/follow-system/follow`,
        {
          otherUserId,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const response = follow.data;

      if (follow.status === 200) {
        setProfileState({
          ...profileState,
          isBeingFollowedByMe: true,
          followersCount: profileState.followersCount + 1,
        });
      } else {
        alert(response.error);
      }
    })();
  };

  const handleUnfollow = () => {
    const { id: otherUserId } = profileState;

    (async () => {
      // use axios to make a post request to the follow-system/unfollow endpoint
      // pass otherUserId in the body
      const unfollow = await axios.post(
        `${HOSTNAME}/follow-system/unfollow`,
        {
          otherUserId,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const response = unfollow.data;

      if (unfollow.status === 200) {
        setProfileState({
          ...profileState,
          isBeingFollowedByMe: false,
          followersCount: profileState.followersCount - 1,
        });
      } else {
        alert(response.error);
      }
    })();
  };

  const navigate = useNavigate();

  const handleSendMessage = () => {
    // use axios to make a get request to the chats/findChatByUserId?userId=? endpoint

    const { id: otherUserId } = profileState;

    (async () => {
      try {
        const chat = await axios.get(
          `${HOSTNAME}/chats/findChatByUserId?userId=${otherUserId}`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (chat.status === 200) {
          const response = chat.data;
          console.log("ChatID response:", response);
          navigate(`/chats/${response.chatId}`);
        } else {
          setCurrentChatState({
            ...currentChatState,
            newChat: true,
            otherUsername: profileState.username,
          });
          navigate(`/chats/`);
        }
      } catch (error) {
        console.log(error);
        setCurrentChatState({
          ...currentChatState,
          newChat: true,
          otherUsername: profileState.username,
        });
        navigate(`/chats/`);
      }
    })();
  };

  return (
    <div
      style={{
        backgroundColor: "#fafbfc",
        minHeight: "88vh",
        padding: "0 2vw",
      }}
    >
      {ui === "loading" ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            height: "88vh",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <CircularProgress size={60} />
          <Typography mt={7} fontSize={30}>
            Loading Profile...
          </Typography>
        </Box>
      ) : profileState == null ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            height: "88vh",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <ErrorIcon sx={{ fontSize: 100, color: "primary.dark" }} />
          <Typography mt={7} fontSize={30}>
            User not found
          </Typography>
        </Box>
      ) : (
        <>
          <Box>
            <Grid
              container
              display={"flex"}
              direction={"row"}
              wrap={"nowrap"}
              alignContent={"center"}
              alignItems={"center"}
              mt={5}
            >
              <Grid item>
                <Avatar
                  sx={{
                    bgcolor: deepOrange[500],
                    width: "150px",
                    height: "150px",
                    marginRight: 2,
                    fontSize: 50,
                  }}
                >
                  P
                </Avatar>
              </Grid>
              <Grid item container direction={"row"}>
                <Grid item container>
                  <Grid item>
                    <Typography variant={"h5"} fontWeight="bold">
                      {profileState.name}
                    </Typography>
                  </Grid>
                  <Grid item container alignItems={"center"}>
                    <Typography variant={"h6"}>
                      @{profileState.username}
                    </Typography>
                    {profileState.isMyFollower === 1 && (
                      <Grid
                        item
                        sx={{
                          backgroundColor: "rgba(06, 42, 78, 0.71)",
                          borderRadius: 2,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                        ml={2}
                      >
                        <Typography
                          ml={1}
                          mr={1}
                          color="white"
                          fontWeight={"bold"}
                          fontSize={14}
                          mt={0.5}
                          mb={0.5}
                        >
                          Follows You!
                        </Typography>
                      </Grid>
                    )}

                    {profileState.id !== userState.id && (
                      <Grid
                        item
                        container
                        direction={"row"}
                        justifyContent={"flex-end"}
                        alignItems={"center"}
                        sx={{ width: "initial", marginLeft: "auto" }}
                      >
                        {profileState.isBeingFollowedByMe ? (
                          <Grid item ml={3}>
                            {/* Follow button */}
                            <Button
                              variant="contained"
                              onClick={handleUnfollow}
                              color={"error"}
                            >
                              Unfollow
                            </Button>
                          </Grid>
                        ) : (
                          <Grid item ml={3}>
                            {/* Follow button */}
                            <Button variant="contained" onClick={handleFollow}>
                              Follow
                            </Button>
                          </Grid>
                        )}
                        <Grid item ml={3}>
                          {/* Follow button */}
                          <Button
                            variant="contained"
                            onClick={handleSendMessage}
                          >
                            Send Message
                          </Button>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </Grid>
                <Grid
                  item
                  container
                  direction={"row"}
                  sx={{
                    flexWrap: "nowrap",
                  }}
                  mt={2}
                >
                  <Grid item container ml={0.5} sx={{ width: "initial" }}>
                    <Typography
                      fontSize={16}
                      color={"primary.dark"}
                      fontWeight={"bold"}
                    >
                      {profileState.postsCount}
                    </Typography>
                    <Typography fontSize={16} ml={1.5} fontWeight={"bold"}>
                      posts
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    container
                    direction={"row"}
                    ml={2}
                    sx={{ width: "initial" }}
                  >
                    <Typography
                      fontSize={16}
                      color={"primary.dark"}
                      fontWeight={"bold"}
                    >
                      {profileState.followersCount}
                    </Typography>
                    <Typography fontSize={16} ml={1.5} fontWeight={"bold"}>
                      followers
                    </Typography>
                  </Grid>
                  <Grid item container ml={2} sx={{ width: "initial" }}>
                    <Typography
                      fontSize={16}
                      color={"primary.dark"}
                      fontWeight={"bold"}
                    >
                      {profileState.followingCount}
                    </Typography>
                    <Typography fontSize={16} ml={1.5} fontWeight={"bold"}>
                      following
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
          {/* <div>Welcome {userState.username}</div> */}
          {/* <Box
        sx={{
          backgroundColor: "rgba(200, 255, 255, 0.5)",
          display: "flex",
          alignItems: "center",
          padding: "10px 15px",
          width: "70%",
          margin: "0 auto",
          marginTop: 5,
        }}
      >
        <Avatar
          sx={{
            bgcolor: deepOrange[500],
            width: "42px",
            height: "42px",
            marginRight: 2,
          }}
        >
          {userState?.username && userState.username[0]}
        </Avatar>
        <TextField
          variant="standard"
          placeholder="What's in your mind?"
          multiline
          InputProps={{ disableUnderline: true }}
          sx={{ width: "50vw" }}
          value={postText}
          onChange={(e) =>
            setPostText(() => {
              setUiState({ ...uiState, userInputPost: true });
              return e.target.value;
            })
          }
          {...(postText.length == 0 &&
            uiState.userInputPost && {
              error: true,
              helperText: "Post must not be empty.",
            })}
        />
        <Button
          variant="contained"
          sx={{ marginLeft: "auto" }}
          onClick={handleCreatePost}
        >
          Post it!
        </Button>
      </Box> */}

          <Typography variant="h5" marginTop={5} marginBottom={3}>
            Posts
          </Typography>
          <PostsList />
        </>
      )}

      {/* <Snackbar open={open} setOpen={setOpen} message="Post published successfully!" severity={"success"} /> */}
      <Stack spacing={2} sx={{ width: "100%" }}>
        <Snackbar
          open={open}
          autoHideDuration={2000}
          onClose={handleClose}
          key={"bottom" + "center"}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
            Post published successfully!
          </Alert>
        </Snackbar>
      </Stack>
    </div>
  );
};
