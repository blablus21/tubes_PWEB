const { PDFDocument } = require('pdf-lib');
const PNGReader = require('png-js');
const fs = require('fs');
const express = require('express')
const mysql = require('mysql2')
const expressLayouts = require('express-ejs-layouts')
const path = require('path')
const moment = require('moment');
const multer = require('multer');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const flash = require('connect-flash');
const app = express()


//memanggil modul biar bisa bikin layout
app.use(expressLayouts);

   
//koneksi database
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'db_signs'
  });

  db.connect((err)=>{
    if(err) throw err
   console.log('Database terkoneksi!')
   })

// Middleware session
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

// Middleware flash messages
app.use(flash());


//buat folder penampung file jika tidak ada
if (!fs.existsSync('./uploads')) { //fs adalah sebuah modul
  fs.mkdirSync('./uploads');
}

// Create multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create multer upload configuration
const upload = multer({//multer sebuah modul dan middleware
  storage: storage
});

const saltRounds = 10;

//middleware untuk parsing request body
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

    app.set('views',__dirname)
    app.set('views', path.join(__dirname, '/views'));
    //biar bisa pakai kodingan format ejs(yg % itu lohh)
    app.set('view engine', 'ejs')
    //biar bisa pake css,img dan js
    app.use('/css', express.static(path.resolve(__dirname, "assets/css")));
    // app.use('/js', express.static(path.resolve(__dirname, "assets/js")));
    app.use('/img', express.static(path.resolve(__dirname, "assets/img")));

   

//========================================
//                 IQBAL 
//========================================

app.get('/login', function (req, res) {
      res.render('login',{
        title : 'Login',
        layout : 'layouts/authLayout'
  });
})

  app.post('/login', function (req, res) {
    const { usernameOrEmail, password } = req.body;
  
    const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(sql, [usernameOrEmail, usernameOrEmail], function(err, result) {
      if (err) throw err;
  
      if (result.length === 0) {
        res.status(401).send('Username or password is incorrect!');
        return;
      }
  
      const user = result[0];
  
      // compare password
      bcrypt.compare(password, user.password, function(err, isValid) {
        if (err) throw err;
  
        if (!isValid) {
          res.status(401).send('Username or password is incorrect!');
          return;
        }
        
        //generate token
        const token = jwt.sign({ user_id: user.user_id }, 'secret_key');
        res.cookie('token', token, { httpOnly: true });
        console.log({token:'ini token :'},token)
        res.redirect('/');
      });
    });
  });

  app.get('/register', function (req, res) {
    res.render('register',{
      title : 'Register',
      layout : 'layouts/authLayout'
  });
})
  //register
  app.post('/register', function (req, res) {
    const { email, username, password, confirm_password } = req.body;
    let account = [username, email]
    // check if username already exists
    const sqlCheck = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(sqlCheck, account, (err, result) => {
      if (err) throw err;
  
      if (result.length > 0) {
        // username already exists, send error response
        return res.status(400).send('Username atau email sudah terdaftar');
      }
  
      if (password !== confirm_password) {
        // Passwords do not match, send error response
        return res.status(400).send('Konfirmasi password tidak cocok!');
      }
  
      // hash password
      bcrypt.hash(password, saltRounds, function(err, hash) {
        if (err) throw err;
  
        // insert user to database
        const sqlInsert = 'INSERT INTO users (email, username, password) VALUES (?, ?, ?)';
        const values = [email, username, hash];
        db.query(sqlInsert, values, (err, result) => {
          if (err) throw err;
          console.log('user terdaftar');
          res.redirect('/login');
        });
      });
    });
  });

// logout
app.get('/logout', function(req, res) {
  res.clearCookie('token');
  res.redirect('/login');
});

function requireAuth(req, res, next) {
    const token = req.cookies.token;
  
    if (!token) {
      res.redirect('/login');
      return;
    }
  
    jwt.verify(token, 'secret_key', function(err, decoded) {
      if (err) {
        res.redirect('/login');
        return;
      }
  
      req.user_id = decoded.user_id;
      next();
    });
  }

  //Home dan upload dokumen FE
  app.get('/', requireAuth, function (req, res) {
    if (!req.user_id) {
      res.redirect('/login');
      return;
    }
    const user_id = req.user_id;
  
    const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
    db.query(selectUserSql, (err, Result) => {
      if (err) throw err;
      res.render('index', {
        user: Result[0],
        title: 'Home',
        layout: 'layouts/mylayout'
      });
    });
  });


  
//========================================
//                 NISA 
//========================================

  //profil page
  app.get('/profil', requireAuth, function (req, res) {
    const profilsuccessMessage = req.session.profilsuccessMessage;
    const profilerrorMessage = req.session.profilerrorMessage; // Menambahkan profilerrorMessage
    delete req.session.profilsuccessMessage;
    delete req.session.profilerrorMessage; // Menghapus profilerrorMessage setelah digunakan
    let user_id = req.user_id;
    const selectSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
    db.query(selectSql, (err,result)=>{
      if (err) throw err;
      // Periksa apakah user sudah login dan aktif
      if (result[0].active === 0) {
        res.render('profil',{
          user: result[0],
          title:'Profil',
          layout:'layouts/mylayout',
          profilsuccessMessage: profilsuccessMessage,
          profilerrorMessage: profilerrorMessage // Menambahkan profilerrorMessage ke dalam objek yang dikirim ke view
        });
      } else {
        // Jika user tidak aktif, arahkan kembali ke halaman login
        res.redirect('/login');
      }
    });
  });
  

  app.post('/edit-profil', upload.fields([{ name: 'sign_img' }, { name: 'avatar' }]), requireAuth, (req, res) => {
    let user_id = req.user_id;
    const { username, email } = req.body;
    const signImg = req.files['sign_img'] ? req.files['sign_img'][0].filename : null;
    const avatar = req.files['avatar'] ? req.files['avatar'][0].filename : null;
  
    // Validate file format
    const allowedExtensions = ['.png'];
    const avatarAllowedExtensions = ['.jpg', '.jpeg', '.png'];
    const signImgExtension = req.files['sign_img'] ? path.extname(req.files['sign_img'][0].originalname).toLowerCase() : null;
    const avatarExtension = req.files['avatar'] ? path.extname(req.files['avatar'][0].originalname).toLowerCase() : null;
  
    if (signImg && !allowedExtensions.includes(signImgExtension)) {
      // Delete the invalid file
      if (req.files['sign_img'][0].path) {
        fs.unlinkSync(req.files['sign_img'][0].path);
      }
      req.session.profilerrorMessage = 'Format file tanda tangan harus berupa PNG';
      res.redirect('/profil');
      return;
    }
  
    if (avatar && !avatarAllowedExtensions.includes(avatarExtension)) {
      // Delete the invalid file
      if (req.files['avatar'][0].path) {
        fs.unlinkSync(req.files['avatar'][0].path);
      }
      req.session.profilerrorMessage = 'Format file avatar harus berupa JPG, JPEG, atau PNG';
      res.redirect('/profil');
      return;
    }
  
    // Build update query and values
    let updateQuery = 'UPDATE users SET username=?, email=?';
    let values = [username, email];
  
    if (signImg) {
      updateQuery += ', sign_img=?';
      values.push(signImg);
    }
  
    if (avatar) {
      updateQuery += ', avatar=?';
      values.push(avatar);
    }
  
    updateQuery += ' WHERE user_id=?';
    values.push(user_id);
  
    // Update data in MySQL
    db.query(updateQuery, values, (err, result) => {
      if (err) {
        throw err;
      }
      console.log('Data updated in MySQL!');
  
      // Copy files to img directory
      if (signImg) {
        const signImgSource = path.join(__dirname, 'uploads', signImg);
        const signImgDestination = path.join(__dirname, 'assets', 'img', signImg);
        fs.copyFileSync(signImgSource, signImgDestination);
      }
  
      if (avatar) {
        const avatarSource = path.join(__dirname, 'uploads', avatar);
        const avatarDestination = path.join(__dirname, 'assets', 'img', avatar);
        fs.copyFileSync(avatarSource, avatarDestination);
      }
  
      req.session.profilsuccessMessage = 'Profil berhasil diubah';
      res.redirect('/profil');
    });
  });


//change-password (Iqbal)
app.post('/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;
  const userId = req.user_id;

  const sql = 'SELECT password FROM users WHERE user_id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.log({ pesan: 'Terjadi Kesalahan Server', err });
      res.redirect('/profil');
      return;
    }

    const hashedPassword = result[0].password;
    bcrypt.compare(currentPassword, hashedPassword, (error, isMatch) => {
      if (error) {
        console.log({ pesan: 'Terjadi Kesalahan Server', error });
        res.redirect('/profil');
        return;
      }

      if (isMatch) {
        if (newPassword === confirmNewPassword) {
          bcrypt.hash(newPassword, saltRounds, (err, hashedNewPassword) => {
            if (err) {
              console.log({ pesan: 'Terjadi Kesalahan Server', err });
              res.redirect('/profil');
              return;
            }

            const updateSql = 'UPDATE users SET password = ? WHERE user_id = ?';
            const values = [hashedNewPassword, userId];
            db.query(updateSql, values, (err, result) => {
              if (err) {
                console.log({ pesan: 'Terjadi Kesalahan Server', err });
                res.redirect('/profil');
                return;
              }
              console.log({ pesan: 'Password berhasil diubah', values });
              req.session.profilsuccessMessage = 'Password berhasil diubah!!';
              res.redirect('/profil');
            });
          });
        } else {
          console.log({ pesan: 'Password baru dan konfirmasi password baru tidak cocok' });
          res.redirect('/profil');
        }
      } else {
        console.log({ pesan: 'Password saat ini tidak valid' });
        res.redirect('/profil');
      }
    });
  });
});



//Document
  app.get('/document', requireAuth, function (req, res) {
    const user_id = req.user_id;
  
    const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
    db.query(selectUserSql, (err, userResult) => {
      if (err) throw err;
      //received document(TIARA)
      const receiveddocSql = `
      SELECT documents.*, signature.*
      FROM documents
      JOIN signature ON documents.document_id = signature.document_id
      WHERE signature.user_id = ${user_id}
      `;
      db.query(receiveddocSql, (err, receivedResult) => {
        if (err) throw err;
  
        //your document(NISA)
        const selectDocSql = `
        SELECT *
        FROM documents WHERE documents.user_id = ${user_id}
      `;
        db.query(selectDocSql, (err, docResult) => {
          if (err) throw err;
  
          res.render('document', {
            user: userResult[0],
            documents: receivedResult,
            yourDocs: docResult,
            updocsuccessMessage:req.session.updocsuccessMessage,
            moment: moment,
            title: 'Request Signature',
            layout: 'layouts/mylayout'
          });
        });
      });
    });
  });
  
  app.get('/document/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', `${filename}`);
  
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(err);
        res.status(404).send('Document not found');
      }
    });
  });
  
  app.get('/download/:document_id', requireAuth, (req, res) => {
    const document_id = req.params.document_id;
      const docSql = 'SELECT * FROM documents WHERE document_id = ?';
      db.query(docSql, [document_id], function(err, docResult) {
        if (err) throw err;
        if (docResult.length === 0) {
          res.status(404).send('Doc not found');
          return;
        }
  
        const doc = docResult[0];
        const filePath = `uploads/${doc.filename}`;
  
        res.download(filePath, doc.file_name, function(err) {
          if (err) {
            console.log(err);
            res.status(500).send('Internal server error');
          }
      });
    });
  });
  
  //upload dokumen yang bukan request
    app.post('/upload-doc', requireAuth, upload.single('filename'), (req, res) => {
      const {  name, description } = req.body;
      const filename = req.file ? req.file.filename : null;
      const user_id = req.user_id;
      // Insert data ke tabel document di MySQL
      const insertdocumentql = `INSERT INTO documents ( user_id, name, filename, description) VALUES ( ?, ?, ?, ?)`;
      const values = [  user_id, name, filename, description];
      db.query(insertdocumentql, values, (err, result) => {
        if (err) {
          throw err;
        }
        console.log('Data inserted to MySQL!');
    
        req.session.updocsuccessMessage = 'Document uploaded successfully';
        res.redirect('/document');
      });
    });
      
  
//========================================
//                 TIARA 
//======================================== 
app.get('/request', requireAuth, function (req, res) {
  let user_id = req.user_id;

  const selectAllUserSql = `SELECT * FROM users WHERE user_id != ${user_id}`;
  db.query(selectAllUserSql, (err,AllUserResult)=>{
    if (err) throw err;
  
  const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
  db.query(selectUserSql, (err, Result) => {
    if (err) throw err;
    res.render('request', {
      allUsers: AllUserResult,
      user: Result[0],
      title: 'request',
      layout: 'layouts/mylayout',
      successMessage: req.session.successMessage
    });
    delete req.session.successMessage;
    });
  })
});

app.post('/upload-doc-request', upload.single('filename'), (req, res) => {
  const { user_id, name, description, jabatan, status } = req.body;
  const filename = req.file ? req.file.filename : null;

  // Insert data ke tabel document di MySQL
  const insertdocumentql = 'INSERT INTO documents (user_id, name, filename, description) VALUES (?, ?, ?, ?)';
  const documentValues = [user_id, name, filename, description];

  db.query(insertdocumentql, documentValues, (err, documentResult) => {
    if (err) {
      throw err;
    }

    console.log({msg:'Data inserted to document table!'},documentValues);

    // Get the newly inserted document ID
    const documentId = documentResult.insertId;

    // Insert data ke tabel signature di MySQL
    const insertSignatureSql = 'INSERT INTO signature (user_id, document_id, jabatan, status) VALUES (?, ?, ?, ?)';
    const signatureValues = [user_id, documentId, jabatan, status];

    db.query(insertSignatureSql, signatureValues, (err, signatureResult) => {
      if (err) {
        throw err;
      }

      console.log({msg:'Data inserted to document table!'},documentValues);

      req.session.successMessage = 'Dokumen request berhasil diunggah';
      res.redirect('/request');
    });
  });
});

  app.get('/sign', requireAuth,function (req, res) {
    let user_id = req.user_id;
  
  const selectUserSql = `SELECT * FROM users WHERE user_id = ${user_id}`;
  db.query(selectUserSql, (err, Result) => {
    if (err) throw err;
    res.render('sign', {
      user: Result[0],
      title: 'sign',
      layout: 'layouts/mylayout'
    });
  });
})



app.listen(3000,()=>{
    console.log("server sudah hidup")
  })