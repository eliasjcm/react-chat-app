import { Grid, LinearProgress, Typography } from "@mui/material";
import React from "react";

export const Loading = () => {
  return (
    <Grid
      container
      sx={{ marginTop: 2, marginBottom: 3, alignItems: "stretch" }}
      flexDirection="column"
    >
      <Grid item justifyContent={"center"} alignItems={"center"}>
        <Typography align="center" fontSize={25}>
          Loading
        </Typography>
      </Grid>
      <Grid item>
        <LinearProgress />
      </Grid>
    </Grid>
  );
};
