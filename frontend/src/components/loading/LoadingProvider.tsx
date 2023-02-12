import React, { useEffect, useMemo, useState } from "react";
import LoadingContext from "./LoadingContext";

import {
  addGlobalRequestInterceptor,
  addGlobalResponseInterceptor,
  removeGlobalRequestInterceptor,
  removeGlobalResponseInterceptor,
} from "../../util/http";

export const LoadingProvider = (props) => {
  const [loading, setLoading] = useState(false);
  const [countRequest, setCountRequest] = useState(0);

  useMemo(() => {
    let isSuscribed = true;

    const requestIds = addGlobalRequestInterceptor((config) => {
      if (isSuscribed) {
        setLoading(true);
        setCountRequest((prevCountRequest) => prevCountRequest + 1);
      }
      return config;
    });

    const responseIds = addGlobalResponseInterceptor(
      (response) => {
        if (isSuscribed) {
          decreaseCountRequest();
        }
        return response;
      },
      (error) => {
        if (isSuscribed) {
          decreaseCountRequest();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      isSuscribed = false;
      removeGlobalRequestInterceptor(requestIds);
      removeGlobalResponseInterceptor(responseIds);
    };
  }, [true]);

  useEffect(() => {
    if (!countRequest) {
      setLoading(false);
    }
  }, [countRequest]);

  const decreaseCountRequest = () => {
    setCountRequest((prevCountRequest) => prevCountRequest - 1);
  };

  return (
    <LoadingContext.Provider value={loading}>
      {props.children}
    </LoadingContext.Provider>
  );
};
