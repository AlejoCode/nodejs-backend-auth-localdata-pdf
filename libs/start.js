module.exports = app => {
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, function () {
      console.log(`Server running on port ${PORT}`);
    });
}