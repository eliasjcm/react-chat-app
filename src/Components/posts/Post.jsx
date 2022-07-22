import React from "react";
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
} from "@mui/material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { deepOrange } from "@mui/material/colors";

export const Post = ({
  publisher,
  createdAt,
  content,
  likesCount,
}) => {
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
        <ListItem disablePadding>
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
        </ListItem>
        <Typography marginTop={2}>{content}</Typography>
        {likesCount > 0 && (
          <Box display="flex" alignItems="center" marginTop={2}>
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
        <Button startIcon={<ThumbUpIcon />}>Like</Button>
      </Box>
    </Box>
  );
};
