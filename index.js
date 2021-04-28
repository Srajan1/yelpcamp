const express = require("express");
const app = express();
const {campgroundSchema} = require('./schemas'); 
const Campground = require("./models/campground");
const mongoose = require("mongoose");
const ExpressError = require('./utils/expressErrors');
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const catchAsync = require("./utils/catchAsync");
mongoose
  .connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Connection open");
  })
  .catch((err) => {
    console.log(`error occured ${err}`);
  });
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const validateCampground = (req, res, next) => {
  const error = campgroundSchema.validate(req.body);
  if(error.error) { 
    // console.log(error.error.details);
    const msg = error.error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }else{
    next();
  }
  
}

const path = require("path");
const { join } = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

app.post(
  "/campgrounds",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // if(!req.body.campground)    throw new ExpressError('Invalid Data', 400);

    // console.log(campground.price);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const id = req.params.id;
  const campground = await Campground.findById(id);
  // console.log(campground);
  res.render("campgrounds/show", { campground });
}));

app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  console.log(campground);
  res.render("campgrounds/edit", { campground });
}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}));

app.all('*', (req, res, next) => {
    console.log('Here');
    next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
    const {statusCode = 500, message = 'Something went wrong'} = err;
    if(!err.message) err.message = 'Something went wrong';
    res.status(statusCode).render('error', {err});
//   res.send("Something went wrong");
});

app.listen(3000, (req, res) => {
  console.log("Server is up");
});
