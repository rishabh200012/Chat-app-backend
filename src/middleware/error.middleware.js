const errormiddleware = (error, req, res, next) => {
  const errorMessage = error.message || "Internal server error";
  const errorStatus = error.status || 500;

  return res
    .status(errorStatus)
    .json({ success: false, message: errorMessage });
};
export default errormiddleware;
