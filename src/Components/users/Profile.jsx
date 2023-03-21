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
import UsersListTable from "../friends/UsersListTable";
import { MainScreenPostsLists } from "../posts/MainScreenPostsLists";

export const Profile = () => {
  const [ui, setUi] = useState("loading");
  const {
    userState,
    postsListState,
    setPostsListState,
    uiState,
    setUiState,
    currentChatState,
    setCurrentChatState,
    paginationState,
    setPaginationState,
  } = useContext(AppContext);

  const [open, setOpen] = React.useState(false);
  const [profileState, setProfileState] = useState({});
  const [currentSection, setCurrentSection] = useState("posts");

  const [followersList, setFollowersList] = useState(null);

  const [followingList, setfollowingList] = useState(null);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const { username } = useParams();

  useEffect(() => {
    (async () => {
      let newPaginationState = {
        ...paginationState,
        page: 1,
        pageSize: 7,
        hasNextPage: true,
      };

      setFollowersList(null);
      setfollowingList(null);
      setCurrentSection("posts");

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
      const postsReq = await fetch(
        `${HOSTNAME}/posts/${profileInfoRes.id}}?page=${newPaginationState.page}&page_size=${newPaginationState.pageSize}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log(request);
      const postsRes = await postsReq.json();
      if (postsRes.length < newPaginationState.pageSize) {
        newPaginationState.hasNextPage = false;
      }

      setPaginationState(newPaginationState);
      setPostsListState(postsRes);
      setUi("loaded");
      setUiState({ ...uiState, userInputPost: false });
    })();
  }, [username]);

  const handleLoadMorePosts = () => {
    (async () => {
      let newPaginationState = {
        ...paginationState,
        page: paginationState.page + 1,
      };
      const request = await fetch(
        `${HOSTNAME}/posts/${profileState.id}}?page=${newPaginationState.page}&page_size=${newPaginationState.pageSize}`,
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // console.log(request);
      const response = await request.json();
      if (response.length < newPaginationState.pageSize) {
        newPaginationState = { ...newPaginationState, hasNextPage: false };
      }
      setPaginationState(newPaginationState);
      setPostsListState([...postsListState, ...response]);
    })();
  };

  useEffect(() => {}, [currentChatState]);

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
        setFollowersList([userState, ...followersList]);
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
        setFollowersList(
          followersList.filter((user) => user.id !== userState.id)
        );
      } else {
        alert(response.error);
      }
    })();
  };

  useEffect(() => {
    switch (currentSection) {
      case "followers":
        (async () => {
          if (followersList) {
            return;
          }
          setUi("loadingFollowers");
          const { id: otherUserId } = profileState;

          const followersReq = await fetch(
            `${HOSTNAME}/users/followers/${otherUserId}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const followersRes = await followersReq.json();

          setFollowersList(followersRes);

          console.log("Followers loaded");

          setUi("loaded");
        })();
        break;
      case "following":
        (async () => {
          if (followingList) {
            return;
          }
          setUi("loadingFollowing");
          const { id: otherUserId } = profileState;

          const followingReq = await fetch(
            `${HOSTNAME}/users/following/${otherUserId}`,
            {
              headers: {
                authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );

          const followingRes = await followingReq.json();

          setfollowingList(followingRes);

          setUi("loaded");
        })();
        break;
      default:
        break;
    }
  }, [currentSection, followersList, profileState, followingList]);

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

  // useEffect(() => {
  // }, []
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
          {/* User Header */}
          <Box>
            <Grid
              container
              display={"flex"}
              direction={"row"}
              wrap={"nowrap"}
              alignContent={"center"}
              alignItems={"center"}
              mt={5}
              sx={{
                marginLeft: "auto",
                marginRight: "auto",
                width: "max-content",
              }}
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
                  <Grid
                    item
                    container
                    ml={0.5}
                    sx={{
                      width: "initial",
                      cursor: "pointer",
                      ...(currentSection === "posts" && {
                        borderBottom: "1px solid #1976D9",
                      }),
                    }}
                    onClick={() => {
                      setCurrentSection("posts");
                    }}
                  >
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
                    sx={{
                      width: "initial",
                      cursor: "pointer",
                      ...(currentSection === "followers" && {
                        borderBottom: "1px solid #1976D9",
                      }),
                    }}
                    onClick={() => {
                      console.log(followersList);
                      setCurrentSection("followers");
                    }}
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
                  <Grid
                    item
                    container
                    ml={2}
                    sx={{
                      width: "initial",
                      cursor: "pointer",
                      ...(currentSection === "following" && {
                        borderBottom: "1px solid #1976D9",
                      }),
                    }}
                    onClick={() => {
                      setCurrentSection("following");
                    }}
                  >
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
          {/* Section Title */}
          <Typography variant="h5" marginTop={5} marginBottom={3}>
            {currentSection === "posts"
              ? "Posts"
              : currentSection === "followers"
              ? "Followers"
              : "Following"}
          </Typography>

          {currentSection === "posts" ? (
            <MainScreenPostsLists loadMorePosts={handleLoadMorePosts} />
          ) : currentSection === "followers" ? (
            <Box>
              {ui === "loadingFollowers" ? (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      height: "50vh",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <CircularProgress size={60} />
                    <Typography mt={7} fontSize={30}>
                      Loading Followers List...
                    </Typography>
                  </Box>
                </Box>
              ) : !followersList || followersList.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    height: "50vh",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <Typography fontSize={30}>
                    No followers yet. Follow someone to see them here!
                  </Typography>
                </Box>
              ) : (
                <UsersListTable
                  usersList={followersList}
                  setUsersList={setFollowersList}
                />
              )}
            </Box>
          ) : (
            <Box>
              {ui === "loadingFollowing" ? (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      height: "50vh",
                      alignItems: "center",
                      flexDirection: "column",
                    }}
                  >
                    <CircularProgress size={60} />
                    <Typography mt={7} fontSize={30}>
                      Loading Following List...
                    </Typography>
                  </Box>
                </Box>
              ) : !followingList || followingList.length === 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    height: "50vh",
                    alignItems: "center",
                    flexDirection: "column",
                  }}
                >
                  <Typography fontSize={30}>
                    You are not following anyone yet. Follow someone to see them
                    here!
                  </Typography>
                </Box>
              ) : (
                <UsersListTable
                  usersList={followingList}
                  setUsersList={setfollowingList}
                />
              )}
            </Box>
          )}
        </>
      )}

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
