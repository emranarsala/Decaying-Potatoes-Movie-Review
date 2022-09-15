const express = require('express');
const mysql = require('mysql');
const app = express();
const pool = dbConnection();
const fetch = require ('node-fetch');
const session = require('express-session');
const bcrypt = require('bcrypt');

var user;

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));


app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret: 'secret_key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))


app.get('/', async (req, res) => {

  let sql = `SELECT * 
              FROM p_movies
              ORDER BY
              Title ASC`;
  let data = await executeSQL(sql);  

  let sql2 = `SELECT * 
              FROM p_movies
              WHERE YEAR>=2018
              ORDER BY
              Year Desc`;
  let data2 = await executeSQL(sql2); 

  let sql3 = `SELECT Distinct Genre 
              FROM p_movies`;
  let data3 = await executeSQL(sql3); 

    let sql4 =`SELECT *
              FROM p_movies
              Where Genre ="${data3[0].Genre}"`;
  let data4 = await executeSQL(sql4);  

  let sql5 =`SELECT *
              FROM p_movies
              Where Genre ="${data3[1].Genre}"`;
  let data5 = await executeSQL(sql5);  

   res.render('home2',{"data":data, "user":user,"data2":data2,"data4":data4,"data5":data5})
});

app.get('/home2', async (req, res) => {

  let sql = `SELECT * 
              FROM p_movies`;
  let data = await executeSQL(sql);  

  let sql2 = `SELECT * 
              FROM p_movies`;
  let data2 = await executeSQL(sql); 

   res.render('home2',{"data":data, "user":user,"data2":data2,})
});

app.get('/genre', async (req, res) => {

   let sql = `SELECT DISTINCT Genre
              FROM p_movies`;
   let data = await executeSQL(sql);

   let arrayGenre = [];

   for(let x=0;x<data.length;x++){

    var random = Math.floor(Math.random() * 3) + 1;

    let bgUrl = `https://pixabay.com/api/?key=23643579-46b22be7a91c73f5afdaeee06&q=${data[x].Genre}&orientation=horizontal`;
    let bgData = await fetchData(bgUrl);
    
    arrayGenre[x]=bgData.hits[random].webformatURL;
  
    // console.log(bgData);
     
   }

  //  console.log(data.length);

     
   res.render('genre',{"data":data,"user":user,"pictures":arrayGenre})
});

app.get('/signIn', async (req, res) => {
   res.render('signIn',{"error":""});
});

app.get('/register', async (req, res) => {
   res.render('register',{"error":""});
});

app.get('/years', async (req, res) => {

   let sql = `SELECT DISTINCT Decade
              FROM p_movies
              ORDER BY Decade ASC`;
   let data = await executeSQL(sql);  

       let arrayDecade = [];

  //  for(let x=0;x<data.length;x++){

  //      sql = `SELECT Poster
  //             FROM p_movies
  //             WHERE Decade ="${data[x].Decade}"`;
  //      data2 = await executeSQL(sql);  

  //   arrayDecade[x]= data2[x].Poster; 
  //  }

   res.render('years',{"data":data,"user":user,"pictures":arrayDecade})
});

app.get('/topMovies', async (req, res) => {

  let sql =  `SELECT * 
              FROM p_movies
              WHERE imdbRating >=8
              ORDER BY imdbRating DESC`;
  let data = await executeSQL(sql);  

   res.render('topMovies',{"data":data,"user":user})
});


app.get('/search', async (req, res) => {

let title = req.query.title; 


let url = `https://www.omdbapi.com/?i=tt3896198&apikey=2f38f86b&plot=full&s=${title}`;


let response = await fetch(url);

let data = await response.json();

   res.render('search',{"data":data,"user":user})
//  }
});

app.get('/error',(req, res) => {

   res.render("error")
});

app.get('/getGenre', async(req, res) => {
  let genre=req.query.fGenre;
  // console.log(genre);
// console.log("genre");
  let sql = `SELECT * 
              FROM p_movies
              Where Genre ="${genre}"`;
  let data = await executeSQL(sql);  


   res.render('topMovies',{"data":data,"user":user})
});


app.get('/getYear', async(req, res) => {
  let year=req.query.fYear;
  let sql = `SELECT * 
              FROM p_movies
              Where Decade ="${year}"`;
  let data = await executeSQL(sql);  
   res.render('topMovies',{"data":data,"user":user})
});




app.get('/api/movieInfo', async (req, res) => {
   //searching quotes by authorId
   let movieId = req.query.movieId;

// let url = `http://www.omdbapi.com/?&apikey=2f38f86b&y=?i=${movieId}`;
   let url = `https://www.omdbapi.com/?i=${movieId}&apikey=2f38f86b&y=?`;
   let response = await fetch(url);
   let data = await response.json();
  //  console.log(data);

   let sql = `SELECT *
              FROM p_movies
              WHERE imdbId = "${movieId}"`;
   let data2 = await executeSQL(sql);  
  
   if (data2.length > 0) {  //checks if record found
      
   }
   else{
    let sql2 = `INSERT INTO p_movies (imdbID,Genre,Year,Title,Poster,Decade,imdbRating) VALUES (?, ?, ?, ?, ?,?,?)`;
    var decade = data.Year;
    decade=(Math.floor(decade / 10) * 10);
    if(isNaN(decade)){
      decade="";
    }
    else{
      

    }
    var genre=data.Genre;
    var genreArray = genre.split(',');
    let params = [data.imdbID,genreArray[0],data.Year,data.Title,data.Poster,decade,data.imdbRating];
    let rows = await executeSQL(sql2,params);
   }

  //  let data
  //  let rows = await executeSQL(sql);
   //console.log(author_id);
   res.send(data);
});


app.get('/api/submitReview', async (req, res) => {
   //searching quotes by authorId
   let review = req.query.review;
  //  alert(review);


    var d = new Date();
     
    var date = d.getUTCDate();
    var month = d.getUTCMonth() + 1;
    var year = d.getUTCFullYear();
     
    var fullDate =  month + "/"+ date +"/" + year;
    // alert(fullDate);


    var data=review;
    var dataArray = data.split('^');
    let sql = `INSERT INTO p_reviews (imdbID,Review,Date,userName,Rating) VALUES (?, ?, ?, ?,?)`;
    let params = [dataArray[0],dataArray[3],fullDate,dataArray[2],dataArray[1]];
    let rows = await executeSQL(sql,params);

   let sql2 = `SELECT *
              FROM p_reviews
              WHERE imdbId = "${dataArray[0]}"`;
   let data2 = await executeSQL(sql2); 
  
   res.send(data2);
});


app.get('/api/getReviews', async (req, res) => {
   //searching quotes by authorId
   let movieId = req.query.movieId;

   let sql2 = `SELECT *
              FROM p_reviews
              WHERE imdbId = "${movieId}"`;
   let data2 = await executeSQL(sql2); 
  
   res.send(data2);
});

app.get('/api/register', async (req, res) => {
   let info = req.query.info;
   let infoArray=info.split(",");

      let sql = `SELECT * 
              FROM p_users
              WHERE userName = ?`;
   let data = await executeSQL(sql, infoArray[0] );        
   if (data.length > 0) {  //checks if record found
  //  console.log(data.length);
   var x=1;
   res.send(x.toString());
   }
   else{

   let sql2 = `INSERT INTO p_users (userName,password) VALUES (?, ?)`;

   let params = [infoArray[0],infoArray[1]];

   let rows = await executeSQL(sql2,params);

   req.session.authenticated = true;
   res.render("login");

  //  user=infoArray[0];
   }

});


app.get('/api/delete', async (req, res) => {

   let id = req.query.reviewId;

  //  alert("hello");

   let sql = `DELETE FROM p_reviews WHERE reviewId = ${id} `;

   rows = await executeSQL(sql); 

   res.redirect("/");

});


app.get('/api/edit', async (req, res) => {

   let id = req.query.reviewId;
  //  alert(id);

      let sql = `SELECT *
              FROM p_reviews
              WHERE reviewId = ${id} `;

  //  let sql = `UPDATE p_reviews
  //             SET review = ?,
  //             rating = ?
  //             WHERE reviewId = ${reviewId} `;

  let data = await executeSQL(sql); 
  // alert(data[0].Review);
   res.render('editReview', {"data":data});
});


app.get('/api/editReview', async (req, res) => {

   let id = req.query.fReviewId;
   let review = req.query.fReview;
   let rating = req.query.rating;
  //  alert(id);

      // let sql = `SELECT *
      //         FROM p_reviews
      //         WHERE reviewId = ${id} `;

   let sql = `UPDATE p_reviews
              SET Review = ?,
              Rating = ?
              WHERE reviewId = ${id} `;


  let params = [review,rating];

   let rows = await executeSQL(sql,params);

   res.redirect("/");
});

app.get('/userReviews', async (req, res) => {


  //  let sql = `SELECT * from p_reviews WHERE userName = '${user}'`;

   let sql=`SELECT * from p_reviews NATURAL JOIN p_movies WHERE userName = '${user}'`



   let rows = await executeSQL(sql); 

   res.render("userReviews", {"review":
   rows,"user":user});

});




//functions
async function executeSQL(sql, params){
return new Promise (function (resolve, reject) {
pool.query(sql, params, function (err, rows, fields) {
if (err) throw err;
   resolve(rows);
});
});
}//executeSQL
//values in red must be updated

app.get('/review/edit', async (req, res) => {
 

    let reviewId = req.query.reviewId;

   let sql = `SELECT * from p_reviews
           WHERE reviewId=${reviewId}`;

   let rows = await executeSQL(sql);    

   res.render('editReview2',{"review":rows,"user":user});
});




app.post('/review/edit', async (req, res) => {

   let reviewId = req.body.fReviewId;
   

   let sql = `UPDATE p_reviews
              SET Review = ?,
              Rating = ?
              WHERE reviewId = ${reviewId} `;

  let params = [req.body.fReview,req.body.rating];
  let rows = await executeSQL(sql, params); 
   res.redirect('/userReviews');
});



app.get('/review/delete', async (req, res) => {

  let reviewId = req.query.reviewId;

   let sql = `DELETE 
              FROM p_reviews
              WHERE reviewId = ${reviewId} `;

   let rows = await executeSQL(sql);           
   res.redirect('/userReviews'); //displaying list of authors

});




app.post('/login', async (req, res) => {
   let username = req.body.username;
   let userPassword = req.body.pwd;
  //  console.log(userPassword);

   let passwordHash = "";
   
   let sql = `SELECT * 
              FROM p_users
              WHERE username = ?`;
   let data = await executeSQL(sql, [username] );        
   if (data.length > 0) {  //checks if record found
      passwordHash = data[0].password;
   }


   if(username.length ==0){
     res.render('signIn', {"error":"Username cannot be BLANK!!!"});
   }else if(userPassword.length == 0){
    res.render('signIn', {"error":"Password cannot be BLANK!!!"});
    }else{
        if(userPassword==passwordHash) {
         user=username;
        req.session.authenticated = true;
       res.redirect('/');
      }else {
     res.render('signIn', {"error":"Invalid credentials"});
   }
    }

});

// app.post('/registerCheck', async (req, res) => {

app.post('/register', async (req, res) => {
   let userName = req.body.userName;
   let userPassword = req.body.password;
  //  console.log(userPassword);
  //  console.log(userName);


    let check = "";
    let sql2 = "select * FROM p_users"

   let params = [userName,userPassword];

   let rows2 = await executeSQL(sql2);
   for(let i = 0; i < rows2.length; i++){
      if(userName == rows2[i].userName){
            check = "already in use";   
      }
    }
    

    if(check.length != 0){
      res.render('register', {"error":"Username already exists"});

    }else if(userName.length ==0){
     res.render('register', {"error":"Username cannot be BLANK!!!"});

    }else if(userPassword.length ==0){
     res.render('register', {"error":"Password cannot be BLANK!!!"});

     }else if(userName.length < 3){
     res.render('register', {"error":"Username is too short!!!"});
     
    }else if(userPassword.length < 3){
     res.render('register', {"error":"Password is too short!!!"});
     
     }else{
     let sql = `INSERT INTO p_users (userName,password) VALUES (?, ?)`;
     params = [userName,userPassword];
     let rows = await executeSQL(sql,params);
     user=userName;
     req.session.authenticated = true;
     res.redirect('/');
    }
});

function isAuthenticated(req, res, next){

  if (req.session.authenticated) {
      next();
  } else {
      res.redirect("/");
  }
}

app.get('/logout', (req, res) => {
  req.session.authenticated = false;
  user=undefined;
  req.session.destroy();
  res.redirect('/');
});

function dbConnection(){

   const pool  = mysql.createPool({

      connectionLimit: 10,
      host: "x8autxobia7sgh74.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
      user: "g027a72vvwlmwmtk",
      password: "c7mtd7mx3zxlh11d",
      database: "wzzkdk7ts6mvg4kq"
   }); 

   return pool;

} //dbConnection


app.listen(3000, () => {
   console.log('server started');
});


async function fetchData(url){
   let response = await fetch(url);
   let data = await response.json();
   //console.log(data);
   return data;
}