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
    localStrategy = require('passport-local').Strategy,
         mongoose = require('mongoose'),
    mongoSanitize = require('express-mongo-sanitize'),
           logger = require('morgan'),
              jwt = require('jsonwebtoken'),
               io = require("socket.io")(http),
             cors = require('cors'),
            https = require('https'),
           crypto = require('crypto'),
           buffer = require('buffer'),
             cron = require('node-cron');

const { getNewsData } = require('./middleware');
// ssl certificate options 
var ssl_options = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem'),
}

const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Hello World!');
}

// const server = https.createServer(ssl_options, requestListener)
// // testing meta connection
// function MT5Request(server, port) {
//   this.server = server;
//   this.port = port;
//   this.https = new https.Agent();
//   this.https.maxSockets = 1; // only one connection is used
// }

// MT5Request.prototype.Get = function (path, callback) {
//   var options = {
//     hostname: this.server,
//     port: this.port,
//     path: path,
//     agent: this.https,
//     headers: { "Connection": "keep-alive" },    
//     rejectUnauthorized: false, // comment out this line if you use self-signed certificates
//   };
//   var req = https.get(options, function (res) {
//     res.setEncoding('utf8');
//     var body = "";
//     res.on('data', function (chunk) {
//       body += chunk;
//     });
//     res.on('end', function () {
//       callback(null, res, body);
//     });
//   });
//   req.on('error', function (e) {
//     console.log(e);
//     return callback(e);
//   });
// };

// MT5Request.prototype.Post = function (path, body, callback) {
//   var options = {
//     hostname: this.server,
//     port: this.port,
//     path: path,
//     agent: this.https,
//     method: "POST",
//     headers: {
//       "Connection": "keep-alive",
//       "Content-Type": "application/x-www-form-urlencoded",
//       "Content-Length": body.length,
//     },
//     // rejectUnauthorized: false, // comment out this line if you use self-signed certificates
//   };
//   var req = https.request(options, function (res) {
//     res.setEncoding('utf8');
//     var body = "";
//     res.on('data', function (chunk) {
//       body += chunk;
//     });
//     res.on('end', function () {
//       callback(null, res, body);
//     });
//   });
//   req.on('error', function (e) {
//     console.log(e);
//     return callback(e);
//   });
//   req.write(body);
//   req.end();
// };

// MT5Request.prototype.ParseBodyJSON = function (error, res, body, callback) {
//   if (error) {
//     callback && callback(error);
//     return (null);
//   }
//   if (res.statusCode != 200) {
//     callback && callback(res.statusCode);
//     return (null);
//   }
//   var answer = null;
//   try {
//     answer = JSON.parse(body);
//   }
//   catch {
//     console.log("Parse JSON error");
//   }
//   if (!answer) {
//     callback && callback("invalid body answer");
//     return (null);
//   }
//   var retcode = parseInt(answer.retcode);
//   if (retcode != 0) {
//     callback && callback(answer.retcode);
//     return (null);
//   }
//   return (answer);
// }

// MT5Request.prototype.ProcessAuth = function (answer, password) {
//   //---
//   var pass_md5 = crypto.createHash('md5');
//   var buf = buffer.transcode(Buffer.from(password, 'utf8'), 'utf8', 'utf16le');
//   pass_md5.update(buf, 'binary');
//   var pass_md5_digest = pass_md5.digest('binary');
//   //---
//   var md5 = crypto.createHash('md5');
//   md5.update(pass_md5_digest, 'binary');
//   md5.update('WebAPI', 'ascii');
//   var md5_digest = md5.digest('binary');
//   //---
//   var answer_md5 = crypto.createHash('md5');
//   answer_md5.update(md5_digest, 'binary');
//   var buf = Buffer.from(answer.srv_rand, 'hex');
//   answer_md5.update(buf, 'binary');
//   //---
//   return (answer_md5.digest('hex'));
// }

// MT5Request.prototype.ProcessAuthFinal = function (answer, password, cli_random) {
//   //---
//   var pass_md5 = crypto.createHash('md5');
//   var buf = buffer.transcode(Buffer.from(password, 'utf8'), 'utf8', 'utf16le');
//   pass_md5.update(buf, 'binary');
//   var pass_md5_digest = pass_md5.digest('binary');
//   //---
//   var md5 = crypto.createHash('md5');
//   md5.update(pass_md5_digest, 'binary');
//   md5.update('WebAPI', 'ascii');
//   var md5_digest = md5.digest('binary');
//   //---
//   var answer_md5 = crypto.createHash('md5');
//   answer_md5.update(md5_digest, 'binary');
//   answer_md5.update(cli_random, 'binary');
//   return (answer.cli_rand_answer == answer_md5.digest('hex'));
// }


// MT5Request.prototype.Auth = function (login, password, build, agent, callback) {
//   if (!login || !password || !build || !agent)
//     return;
//   var self = this;
//   self.Get("/api/auth/start?version=" + build + "&agent=" + agent + "&login=" + login + "&type=manager", function (error, res, body) {
//     var answer = self.ParseBodyJSON(error, res, body, callback);
//     if (answer) {
//       var srv_rand_answer = self.ProcessAuth(answer, password);
//       var cli_random_buf = crypto.randomBytes(16);
//       cli_random_buf_hex = cli_random_buf.toString('hex');
//       self.Get("/api/auth/answer?srv_rand_answer=" + srv_rand_answer + "&cli_rand=" + cli_random_buf_hex, function (error, res, body) {
//         var answer = self.ParseBodyJSON(error, res, body, callback);
//         if (answer) {
//           if (self.ProcessAuthFinal(answer, password, cli_random_buf))
//             callback && callback(null);
//           else
//             callback && callback("invalid final auth answer");
//         }
//       });
//     }
//   });
//   return (true);
// };

// Example of use
// var req = new MT5Request("51.77.118.184", 443);
// // Authenticate on the server using the Auth command
// req.Auth(1000, "Hymt74nhr", 1985, "2221", function (error) {
//   if (error) {
//     console.log(error);
//     return;
//   }
//   // Let us request the symbol named TEST using the symbol_get command
//   req.Get("/api/symbol/get?symbol=TEST", function (error, res, body) {
//     if (error) {
//       console.log(error);
//       return;
//     }
    
//     var answer = req.ParseBodyJSON(error, res, body, null);
//     var symbol = answer.answer;
//     console.log(symbol);
//     // Changing the description
//     symbol.Description = 'My Description';
//     // Sending changes to the server using the symbol_add command
//     req.Post('/api/symbol/add', JSON.stringify(symbol), function (error, res, body) {
//       if (error) {
//         console.log(error);
//         return;
//       }
//       var answer = req.ParseBodyJSON(error, res, body, null);
//       var symbol = answer.answer;
//       console.log(symbol);
//     });
//   });
// });



// Routes
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const blogsRouter = require('./routes/blogs');
const newsRouter = require('./routes/news');
const analysisRouter = require('./routes/analysis');

// error
const ExpressError = require('./utils/ExpressError');
// Models
const User = require('./models/user');

const MongoDBStore = require("connect-mongo");

// dont forget to add process.env.DB_URL || 
const dbUrl = process.env.DATABASE;

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
// app.engine('ejs', ejsMate)
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'))

app.use(cors());
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

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
      directives: {
          defaultSrc: [],
          // connectSrc: ["'self'", ...connectSrcUrls],
          // scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
          // styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
          workerSrc: ["'self'", "blob:"],
          objectSrc: [],
          imgSrc: [
              "'self'",
              "blob:",
              "data:",
              "https://res.cloudinary.com/douqbebwk/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
              "https://images.unsplash.com/",
          ],
          // fontSrc: ["'self'", ...fontSrcUrls],
      },
  })
);


app.use(passport.initialize());
app.use(passport.session());
// passport.use(new localStrategy(User.authenticate()));

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/blogs', blogsRouter);
app.use('/api/news', newsRouter);
app.use('/api/analysis', analysisRouter);

// the cron job to get the news data every 30 minutes
cron.schedule("*/30 * * * *", function() {
  getNewsData();
});

  //  web sockets
  io.on("connect", function(socket) {
    console.log(`A user connected`);
  });

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
// const server = https.createServer(ssl_options, app)
//     .listen(port, () => {
//         console.log('server running at ' + port)
//     })
