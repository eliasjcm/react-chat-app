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

export const MainScreen = () => {
  const [ui, setUi] = useState("loading");
  const {
    userState,
    postsListState,
    setPostListState,
    decodedToken,
    setPostsListState,
  } = useContext(AppContext);
  const [postText, setPostText] = useState("");

  const [open, setOpen] = React.useState(false);

  const handleCreatePost = () => {
    console.log(postText);
    setOpen(true);
    setPostText("");
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {
    (async () => {
      // const handleFindFriends = async (e) => {
      // console.log("Asking for a friend");
      // e.preventDefault();
      // console.log("USERSTATE", decodedToken);
      const request = await fetch(`${HOSTNAME}/posts/${userState.id}}`, {
        headers: {
          authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      // console.log(request);
      const response = await request.json();
      setPostsListState(response);
      // console.log(response);
      // const friendsRes = await request.json();
      // console.log(friendsRes);
      // setUsersListState(friendsRes);
      // setScreenState({ ...screenState, inSearch: true });
      // };
      // const request = await fetch(`${HOSTNAME}/posts/` )
      setUi("loaded");
    })();
  }, []);

  const navigate = useNavigate();
  return (
    <div style={{ backgroundColor: "#fafbfc", minHeight: "90vh", padding: "0 2vw" }}>
      {/* <div>Welcome {userState.username}</div> */}
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
          onChange={(e) => setPostText(e.target.value)}
          {...(postText.length == 0 && {
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
        My Posts
      </Typography>

      {ui === "loading" ? (
        <Box sx={{ width: "80%", margin: "0 auto" }}>
          <LinearProgress />
        </Box>
      ) : postsListState.length > 0 ? (
        postsListState.map((post) => (
          <Box marginTop={3} key={post.id}>
            <Post
              publisher={post.publisher}
              createdAt={post.createdAt}
              content={post.content}
              likesCount={post.likesCount}
            />
          </Box>
        ))
      ) : (
        <Box>

        <Alert 
                    severity="warning"
                    sx={{ width: "80%", margin: "0 auto"}}>
          No posts yet.
        </Alert>
        </Box>
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
