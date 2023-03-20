import {
  Alert,
  Avatar,
  Button,
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
import { useNavigate } from "react-router-dom";
import { Box, minHeight } from "@mui/system";
import { AppContext } from "../../context/AppContext";
import { deepOrange } from "@mui/material/colors";
import { Post } from "../posts/Post";
import { HOSTNAME } from "../../utils";
import { SnackbarMsg } from "./Snackbar";
import axios from "axios";
import { PostsList } from "../posts/PostsList";
import { MainScreenPostsLists } from "../posts/MainScreenPostsLists";

export const MainScreen = () => {
  const [ui, setUi] = useState("loading");
  const {
    userState,
    postsListState,
    setPostListState,
    decodedToken,
    setPostsListState,
    uiState,
    setUiState,
    paginationState,
    setPaginationState,
  } = useContext(AppContext);
  const [postText, setPostText] = useState("");

  const [open, setOpen] = React.useState(false);

  const handleCreatePost = () => {
    (async () => {
      // const request = await fetch(`${HOSTNAME}/posts/${userState.id}}`, {
      //   headers: {
      //     authorization: `Bearer ${localStorage.getItem("token")}`,
      //   },
      // });
      const post = await axios.post(
        `${HOSTNAME}/posts/create`,
        {
          content: postText,
        },
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(post);
      const response = post.data;

      if (post.status === 200) {
        setOpen(true);
        setPostText("");

        const request = await fetch(`${HOSTNAME}/posts/${userState.id}}`, {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        // console.log(request);
        const response = await request.json();
        setPostsListState(response);
      } else {
        alert(response.error);
      }

      // if (post.error) {
      //   alert(response.error);
      // } else {
      //   setOpen(true);
      //   setPostText("");
      // }
    })();
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    (async () => {
      let newPaginationState = {
        ...paginationState,
        page: 1,
        pageSize: 7,
        hasNextPage: true,
      };
      const request = await fetch(
        `${HOSTNAME}/posts?page=${newPaginationState.page}&page_size=${newPaginationState.pageSize}`,
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
      setPostsListState(response);
      setUi("loaded");
      setUiState({ ...uiState, userInputPost: false });
    })();
  }, []);

  const handleLike = (postId) => {
    console.log("handleLike was called with postId: ", postId);
    (async () => {
      const post = await axios.post(
        `${HOSTNAME}/posts/like/${postId}`,
        {},
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(post);
      const response = post.data;

      if (post.status === 200) {
        console.log("like");
        setPostsListState(
          postsListState.map((post) => {
            if (post.id === postId) {
              console.log("current post LIKES: ", post.likes);
              let currentPostLikes = post.likesCount || 0;
              return { ...post, likesCount: currentPostLikes + 1, liked: true };
            }
            return post;
          })
        );
      } else {
        alert(response.error);
      }
    })();
  };

  const handleUnlike = (postId) => {
    console.log("handleUnlike was called with postId: ", postId);
    (async () => {
      const post = await axios.post(
        `${HOSTNAME}/posts/unlike/${postId}`,
        {},
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(post);

      const response = post.data;
      if (post.status === 200) {
        console.log("unlike");
        setPostsListState(
          postsListState.map((post) => {
            if (post.id === postId) {
              console.log("current post LIKES: ", post.likes);

              return { ...post, likesCount: post.likesCount - 1, liked: false };
            }
            return post;
          })
        );
      } else {
        alert(response.error);
      }
    })();
  };

  const handleLoadMorePosts = () => {
    (async () => {
      let newPaginationState = {
        ...paginationState,
        page: paginationState.page + 1,
      };
      const request = await fetch(
        `${HOSTNAME}/posts?page=${newPaginationState.page}&page_size=${newPaginationState.pageSize}`,
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

  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: "#fafbfc",
        minHeight: "90vh",
        padding: "0 2vw",
      }}
    >
      <div>Welcome @{userState.username}</div>
      <Box
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
          {...(postText.length === 0 &&
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
      </Box>

      <Typography variant="h5" marginTop={5} marginBottom={3}>
        Posts
      </Typography>

      {ui === "loading" ? (
        <Box sx={{ width: "80%", margin: "0 auto" }}>
          <LinearProgress />
        </Box>
      ) : postsListState.length > 0 ? (
        <MainScreenPostsLists loadMorePosts={handleLoadMorePosts} />
      ) : (
        <Box>
          <Alert severity="warning" sx={{ width: "80%", margin: "0 auto" }}>
            No posts yet.
          </Alert>
        </Box>
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
