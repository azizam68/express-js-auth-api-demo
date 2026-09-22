export function notFound(req, res) {
  res.status(404).sendFile("404.html", {
    root: "public"
  });
}