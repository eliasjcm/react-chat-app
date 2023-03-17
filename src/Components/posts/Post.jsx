import React, { useState } from "react";
import {
  Avatar,
  Button,
  Divider,
  Grid,
  ListItem,
  ListItemAvatar,
  ListItemText,
  SvgIcon,
  TextField,
  Typography,
  Box,
  Modal,
  Backdrop,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { deepOrange } from "@mui/material/colors";
import { Delete, ThumbUpOffAlt, TryOutlined } from "@mui/icons-material";
import UsersListTable from "../friends/UsersListTable";
import UsersLikesList from "./UsersLikesList";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { AppContext } from "../../context/AppContext";

export const Post = ({
  publisher,
  createdAt,
  content,
  likesCount,
  liked,
  id,
  handleLike,
  handleUnlike,
}) => {
  const { userState } = React.useContext(AppContext);

  const [showLikesList, setShowLikesList] = useState(false);

  const [usersList, setUsersList] = useState(null);

  const [likesList, setLikesList] = useState(null);

  const closeLikesList = () => {
    setShowLikesList(false);
  };

  const openLikesList = async () => {
    // http://localhost:5000/posts/likes/1

    const response = await fetch(`http://localhost:5000/posts/likes/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await response.json();

    console.log(data);

    setLikesList(data);

    setShowLikesList(true);
  };

  return (
    <Box
      width="85%"
      sx={{
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: 4,
        boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 15px",
      }}
    >
      <Box sx={{ padding: "17px 25px" }}>
        <ListItem disablePadding alignItems="center">
          <ListItemAvatar>
            <Avatar
              sx={{
                bgcolor: deepOrange[500],
                width: "42px",
                height: "42px",
                marginRight: 2,
              }}
            >
              {publisher.name[0]}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography fontWeight={"bold"}>{publisher.name}</Typography>
            }
            secondary={createdAt}
          />
          {/* <Button variant="outlined" color="primary" size="small">
            Follow
          </Button> */}
          {publisher.id === userState.id && (
            <Button
              color="error"
              // variant="outlined"
              // size="small"
            >
              <DeleteForeverIcon />
            </Button>
          )}
        </ListItem>
        <Typography marginTop={2} sx={{ overflowWrap: "anywhere" }}>
          {content}
        </Typography>
        {likesCount > 0 && (
          <Box
            display="flex"
            alignItems="center"
            marginTop={2}
            sx={{
              width: "fit-content",
              ":hover": {
                backgroundColor: "#f5f5f5",
                cursor: "pointer",
              },
            }}
            onClick={() => openLikesList()}
          >
            <Avatar
              // color
              sx={{ bgcolor: "#1976d2", width: "20px", height: "20px" }}
            >
              <ThumbUpIcon sx={{ fontSize: 12 }} color="white" />
            </Avatar>

            <Typography color="primary" fontSize={14} marginLeft={1}>
              {likesCount}
            </Typography>
          </Box>
        )}
        <Divider light sx={{ marginTop: 2, marginBottom: 1 }} />
        {liked ? (
          <Button startIcon={<ThumbUpIcon />} onClick={() => handleUnlike(id)}>
            Like
          </Button>
        ) : (
          <Button startIcon={<ThumbUpOffAlt />} onClick={() => handleLike(id)}>
            Like
          </Button>
        )}
      </Box>
      {/* <Backdrop open={true} sx={{
        backgroundColor: "red"
      }}> */}
      <Dialog
        open={showLikesList}
        onClose={closeLikesList}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        sx={{
          "& .MuiDialog-container": {
            "& .MuiPaper-root": {
              width: "100%",
              maxWidth: "80vw", // Set your width here
            },
          },
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            // width: "100%",
            // maxWidth: "500px",
            backgroundColor: "white",
            boxShadow: "rgba(0, 0, 0, 0.05) 0px 5px 15px",
            borderRadius: "10px",
          },
        }}
        BackdropProps={{
          sx: {
            background: "rgba(0,0,0,0.2)",
          },
        }}
      >
        <Box
          sx={{
            paddingLeft: 3,
            paddingRight: 3,
            paddingTop: 1,
            paddingBottom: 1.5,
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ marginBottom: 2, marginTop: 2 }}
          >
            Likes
          </Typography>

          <UsersLikesList inline={true} usersList={likesList} />
        </Box>
      </Dialog>
      {/* </Backdrop> */}
    </Box>
  );
};
