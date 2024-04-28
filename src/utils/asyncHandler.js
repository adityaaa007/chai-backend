const asyncHandler = (func) => /* ---> this function will be used as a callback in express controllers*/async (req, res, next) => {
  try {
    await func(req, res, next);
  } catch (error) {
    next(error.message)
  }
};

export { asyncHandler };
