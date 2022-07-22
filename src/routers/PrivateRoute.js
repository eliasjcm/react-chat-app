import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export const PrivateRoute = ({ children }) => {
  const { userState } = useContext(AppContext);
  // console.log(user);

  const { pathname, search } = useLocation();
  // console.log(location);

  localStorage.setItem("lastPath", pathname + search);
  console.log("PRIVATE: ", userState);
  return userState?.id ? children : <Navigate to="/login" />;
};
