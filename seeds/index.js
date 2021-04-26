const Campground = require('../models/campground')
const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('../seeds/seedHelpers');
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

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i<50; ++i){
        const rand100 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20)+10;
        const camp = new Campground({
            location: `${cities[rand100].city}, ${cities[rand100].state}`,
            title: `${sample(descriptors)} ${sample(places)}` ,
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum dolor, sit amet consectetur adipisicing elit. Autem fuga eveniet neque beatae eligendi possimus porro ullam praesentium quod! Magnam tempore modi eveniet dicta molestias blanditiis ut culpa alias aliquid?',
            price: price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});