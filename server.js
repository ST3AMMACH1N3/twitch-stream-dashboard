require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const routes = require('./routes');
const db = require('./models');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.engine('handlebars',
    exphbs({
        defaultLayout: 'main',
        partialsDir: __dirname + '/views/partials'
    })
);

app.set('view engine', 'handlebars');

app.use(routes);

db.sequelize
    .sync({ force: false })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`App listening on PORT: ${PORT}`);
        });
    })
    .catch(err => console.log(err));