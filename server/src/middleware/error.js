export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function notFound(_req, res) {
  res.status(404).json({ error: "Resource not found" });
}

export function errorHandler(err, _req, res, _next) {
  console.error("[api] Error:", err.message);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation failed", details: err.message });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  if (err.code === 11000) {
    return res.status(409).json({ error: "A record with that value already exists" });
  }

  res.status(500).json({ error: "Something went wrong on the server" });
}
