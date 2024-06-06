const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const path = require('path');
const connectDB = require('./configs/db');

const app = express();
const port = 3000;
const ADMIN_EMAIL = '645021001161@mail.rmutk.ac.th';

// Connect to MongoDB
connectDB();

// Define the User schema and model
const UserSchema = new mongoose.Schema({
  googleId: String,
  displayName: String,
  email: String,
});
const User = mongoose.model('User', UserSchema);

// Define the Data schema and model
const DataSchema = new mongoose.Schema({
  studentId: String,
  name: String,
  grade1: String,
  grade2: String,
  grade3: String,
});

const DataModel = mongoose.model('Upload', DataSchema);

// Setup multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Setup EJS as the template engine
app.set('view engine', 'ejs');

app.use(express.static('public'));

// Configure session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Configure Google OAuth 2.0
passport.use(new GoogleStrategy({
  clientID: '39160225463-vea5s59jqecaa5css9copf53523silp2.apps.googleusercontent.com',
  clientSecret: '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',
  callbackURL: 'http://localhost:3000/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = new User({
          googleId: profile.id,
          displayName: profile.displayName,
          email: profile.emails[0].value,
        });
        await user.save();
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware to ensure admin access
function ensureAdmin(req, res, next) {
  console.log('User email:', req.user?.email);  // Debug log for user email
  if (req.user && req.user.email === ADMIN_EMAIL) {
    return next();
  } else {
    res.status(403).send('<script>alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้"); window.location.href = "/userprofile";</script>');
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/login.html'));
});

app.get('/importdata', (req, res) => {
  res.sendFile(path.join(__dirname, 'views/import.html'));
});

app.get('/userprofile', (req, res) => {
  res.render('user/user', { user: req.user });
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/switchaccount', (req, res) => {
  req.logout(() => {
    res.redirect('https://accounts.google.com/AccountChooser');
  });
});

app.get('/transcript', (req, res) => {
  res.render('user/transcript');
});

app.get('/admin', ensureAdmin, (req, res) => {
  res.render('admin/admin', { user: req.user });
});

app.get('/managedata', ensureAdmin, (req, res) => {
  res.render('admin/managedata');
});

app.get('/managemodel', ensureAdmin, (req, res) => {
  res.render('admin/managemodel');
});

// Fetch uploaded data from MongoDB
app.get('/uploadeddata', async (req, res) => {
  try {
    const data = await DataModel.find({});
    res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching uploaded data:', err);
    res.status(500).json({ success: false, message: 'Error fetching data' });
  }
});

// Handle CSV file upload and save data to MongoDB
app.post('/uploaddata', upload.single('csvFile'), async (req, res) => {
  console.log('File uploaded successfully:', req.file);
  const filePath = path.join(__dirname, req.file.path);
  const results = [];

  try {
    // Read the CSV file and push data into the results array
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Create a new object with trimmed keys and values
        const cleanedData = {};
        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            cleanedData[key.trim()] = data[key].trim();
          }
        }

        // Check if required fields exist
        const studentId = cleanedData['รหัสนักศึกษา'] || '';
        const name = cleanedData['ชื่อ-สกุล'] || '';
        const grade1 = cleanedData['ไทย'] || '';
        const grade2 = cleanedData['อังกฤษ'] || '';
        const grade3 = cleanedData['คณิตศาสตร์'] || '';

        // Log the raw data and cleaned values for debugging
        console.log('Raw data:', data);
        console.log('Cleaned values:', { studentId, name, grade1, grade2, grade3 });

        if (studentId && name && grade1 && grade2 && grade3) {
          const formattedData = {
            studentId: String(studentId),
            name: String(name),
            grade1: String(grade1),
            grade2: String(grade2),
            grade3: String(grade3),
          };
          results.push(formattedData);
        } else {
          console.error('Missing fields:', data);
        }
      })
      .on('end', async () => {
        try {
          console.log('Formatted data:', results); // Debug log for formatted data

          if (results.length > 0) {
            // Save data to MongoDB
            await DataModel.insertMany(results);
            console.log('Data successfully saved to MongoDB');
          } else {
            console.log('No valid data to save');
          }

          // Remove the uploaded CSV file
          fs.unlinkSync(filePath);

          // Send response to the client
          res.status(200).json({ success: true, message: 'File uploaded and data saved successfully' });
        } catch (err) {
          console.error('Error saving data to MongoDB:', err);
          res.status(500).json({ success: false, message: 'Error saving data to database' });
        }
      });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ success: false, message: 'Error uploading file' });
  }
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  console.log('User email after login:', req.user.email);  // Debug log for user email after login
  if (req.user.email.endsWith('@mail.rmutk.ac.th')) {
    if (req.user.email === ADMIN_EMAIL) {
      res.send('<script>alert("เข้าสู่ระบบแอดมินสำเร็จ"); window.location.href = "/admin";</script>');
    } else {
      res.send('<script>alert("เข้าสู่ระบบสำเร็จ"); window.location.href = "/userprofile";</script>');
    }
  } else {
    res.send('<script>alert("กรุณาใช้เมลของมหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพเท่านั้น"); window.location.href = "/";</script>');
  }
});

//Route for shie grade 
app.get('/usergrades', async (req, res) => {
  if (!req.user) {
    return res.status(401).send('Unauthorized');
  }

  try {
    // Split email and insert a hyphen before the 12th character
    let studentId = req.user.email.split('@')[0];
    if (studentId.length >= 12) {
      studentId = studentId.slice(0, 11) + '-' + studentId.slice(11);
    }

    const studentData = await DataModel.findOne({ studentId });

    if (studentData) {
      const grades = [
        { subject: 'ไทย', grade: studentData.grade1 },
        { subject: 'อังกฤษ', grade: studentData.grade2 },
        { subject: 'คณิตศาสตร์', grade: studentData.grade3 }
      ];
      res.json(grades);
    } else {
      res.json([]);
    }
  } catch (err) {
    console.error('Error fetching student grades:', err);
    res.status(500).send('Error fetching student grades');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
