import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import React, { useContext } from "react";
import { Waypoint } from "react-waypoint";
import { AppContext } from "../../context/AppContext";
import { HOSTNAME } from "../../utils";
import { Post } from "./Post";

export const MainScreenPostsLists = ({ loadMorePosts }) => {
  const {
    postsListState,
    setPostsListState,
    snackbarState,
    setSnackbarState,
    paginationState,
    setPaginationState,
  } = useContext(AppContext);

  const [openDeleteAlert, setOpenDeleteAlert] = React.useState(false);

  const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = React.useState({
    open: false,
    postId: null,
  });

  const handleClick = () => {
    setOpenDeleteAlert(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenDeleteAlert(false);
  };

  const handleConfirmDeleteDialogOpen = (postId) => {
    setOpenConfirmDeleteDialog({ open: true, postId });
  };

  const handleConfirmDeleteDialogClose = () => {
    setOpenConfirmDeleteDialog({ open: false, postId: null });
  };

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

  const handleDeletePost = async () => {
    // use axios.delete

    console.log("POST #1");
    const id = openConfirmDeleteDialog.postId;
    setOpenConfirmDeleteDialog({ open: false, postId: null });
    const response = await axios.delete(`http://localhost:5000/posts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    console.log("POST #2");
    console.log(response);

    if (response.status === 200) {
      console.log("POST #3");
      const newPostsList = postsListState.filter((post) => post.id !== id);
      console.log("POST #4");
      setPostsListState(newPostsList);
      console.log("POST #5");
      // handleClick();
      setSnackbarState({
        open: true,
        msg: "Post deleted successfully",
        severity: "success",
      });
      console.log("POST #6");
    }
  };

  return (
    <>
      {postsListState.length > 0 ? (
        postsListState.map((post, idx) => (
          <Waypoint
            key={idx}
            onEnter={async () => {
              if (
                idx === postsListState.length - 3 &&
                paginationState.hasNextPage
              ) {
                console.log("Llego al ultimo");
                await loadMorePosts();
              }
            }}
          >
            <Box marginTop={3} key={post.id}>
              <Post
                publisher={post.publisher}
                createdAt={post.createdAt}
                content={post.content}
                likesCount={post.likesCount}
                liked={post?.liked}
                handleLike={handleLike}
                handleUnlike={handleUnlike}
                id={post.id}
                setOpenConfirmDeleteDialog={() =>
                  handleConfirmDeleteDialogOpen(post.id)
                }
                bro={1}
              />
            </Box>
          </Waypoint>
        ))
      ) : (
        <Box>
          <Alert severity="warning" sx={{ width: "80%", margin: "0 auto" }}>
            No posts yet.
          </Alert>
        </Box>
      )}
      <Dialog
        open={openConfirmDeleteDialog.open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to delete this post?"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleConfirmDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeletePost} autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
