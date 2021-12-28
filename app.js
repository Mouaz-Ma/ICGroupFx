if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

// packeges
const createError = require('http-errors'),
          express = require('express'),
             path = require('path'),
             http = require('http'),
     cookieParser = require('cookie-parser'),
          session = require('express-session'),
            flash = require('connect-flash'),
   methodOverride = require('method-override'),
               fs = require('fs'),
           helmet = require("helmet"),
         passport = require('passport'),
    localStrategy = require('passport-local'),
         mongoose = require('mongoose'),
          ejsMate = require('ejs-mate'),
    mongoSanitize = require('express-mongo-sanitize'),
           logger = require('morgan');

// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Models
const User = require('./models/user');

const MongoDBStore = require("connect-mongo");

// dont forget to add process.env.DB_URL || 
const dbUrl = 'mongodb://localhost:27017/icgroupfx';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
    // useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


const app = express();

// view engine setup
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
  replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store =  MongoDBStore.create({ 
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});

const sessionConfig = {
  store,
  name: 'session',
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
      httpOnly: true,
      // secure: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7
  }
}

app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          connectSrc: ["'self'", ...connectSrcUrls],
          scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);


app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
})

app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


// Setting up the port for listening requests
const port = process.env.PORT || 5000;
app.listen(port, () => console.log("Server at 5000"));
