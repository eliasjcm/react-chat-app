import { Alert, Box } from "@mui/material";
import axios from "axios";
import React, { useContext } from "react";
import { AppContext } from "../../context/AppContext";
import { HOSTNAME } from "../../utils";
import { Post } from "./Post";

export const PostsList = () => {
  const { postsListState, setPostsListState } = useContext(AppContext);

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

  return (
    <>
      {postsListState.length > 0 ? (
        postsListState.map((post) => (
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
            />
          </Box>
        ))
      ) : (
        <Box>
          <Alert severity="warning" sx={{ width: "80%", margin: "0 auto" }}>
            No posts yet.
          </Alert>
        </Box>
      )}
    </>
  );
};
