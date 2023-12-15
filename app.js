const express = require('express');
const lodash = require('lodash');
const itemRoutes = require('./src/Routes/itemRoutes');
// const { urlencoded } = require('body-parser');
const app = express();

const port = process.env.PORT || 8000;

app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());


app.use('/items', itemRoutes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})

module.exports = app;