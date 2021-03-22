const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require("ejs-mate");
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const Profile = require('./models/profile');


mongoose.connect('mongodb://localhost:27017/matrimonial-website', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("once", () => {
    console.log("DATABaSE CONNECTED");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.engine('ejs', ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));



app.get('/', (req, res) => {
    res.render('index');
});

app.get('/profile', catchAsync(async (req, res) => {
    const profile = await Profile.find({});
    res.render('madeprofiles/index', { profile });
}));

app.get('/profile/new', (req, res) => {
    res.render('madeprofiles/new');
})

app.post('/profile', catchAsync(async (req, res, next) => {
    if (!req.body.profile) throw new ExpressError('invalid data', 400)
    const profile = new Profile(req.body.profile);
    await profile.save();
    res.redirect(`/profile/${profile._id}`)
}));

app.get('/profile/:id', catchAsync(async (req, res) => {
    const id = await Profile.findById(req.params.id);
    res.render('madeprofiles/show', { id });
}));

app.get('/profile/:id/edit', catchAsync(async (req, res) => {
    const profile = await Profile.findById(req.params.id);
    res.render('madeprofiles/edit', { profile });
}));

app.put('/profile/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const profile = await Profile.findByIdAndUpdate(id, { ...req.body.profile })
    res.redirect(`/profile/${profile._id}`)
}));

app.delete('/profile/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Profile.findByIdAndDelete(id);
    res.redirect('/profile');
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something is wrong' } = err;
    res.status(statusCode).render('error', { err });
})

app.listen(8080, () => {
    console.log('serving on port 8080');
})