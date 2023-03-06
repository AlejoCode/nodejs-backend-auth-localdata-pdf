module.exports = app => {
    app.get('/api/', function(req,res) {
        res.send('Hello Wolrd dev.to')
    })
}