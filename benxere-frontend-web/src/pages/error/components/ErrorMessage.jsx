import React from 'react';
import Typography from "../../../components/core/typography";

const ErrorMessage = ({ errorDetails }) => {
  return (
    <>
      <Typography variant="h1">Oops!</Typography>
      <Typography variant="body">
        Sorry, an unexpected error has occurred.
      </Typography>
      <Typography variant="body">
        <i>{errorDetails.statusText || errorDetails.message}</i>
      </Typography>
    </>
  );
};

export default ErrorMessage;