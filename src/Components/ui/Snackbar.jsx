import { Alert, Stack } from "@mui/material";
import React from "react";

export const SnackbarMsg = ({ open, message, severity, setOpen }) => {
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <SnackbarMsg
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        key={"bottom" + "center"}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </SnackbarMsg>
    </Stack>
  );
};
