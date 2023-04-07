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
    let isSubscribed = true;

    const requestIds = addGlobalRequestInterceptor((config) => {
      if (
        isSubscribed &&
        (!config.headers || config.headers.hasOwnProperty("x-ignore-loading"))
      ) {
        setLoading(true);
        setCountRequest((prevCountRequest) => prevCountRequest + 1);
      }
      return config;
    });

    const responseIds = addGlobalResponseInterceptor(
      (response) => {
        if (
          isSubscribed &&
          !response.config.headers.hasOwnProperty("x-ignore-loading")
        ) {
          decreaseCountRequest();
        }
        return response;
      },
      (error) => {
        if (
          isSubscribed &&
          (!error.config ||
            !error.config.headers.hasOwnProperty("x-ignore-loading"))
        ) {
          decreaseCountRequest();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      isSubscribed = false;
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
