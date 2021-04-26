const express = require('express');
const app = express();
const Campground = require('./models/campground')
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
})
.then(() => {
  console.log('Connection open');
}).catch((err) => {
  console.log(`error occured ${err}`);
});
app.engine('ejs', ejsMate);
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const path = require('path');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
    res.render('home')
});

app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
});

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)

})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', async (req, res) => {
    const id = req.params.id;
    const campground = await Campground.findById(id);
    // console.log(campground);
    res.render('campgrounds/show', {campground});
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    console.log(campground);
    res.render('campgrounds/edit', {campground});
});

app.put('/campgrounds/:id', async(req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`)
});

app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen(3000, (req, res) => {
    console.log('Server is up');
})