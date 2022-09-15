window.onload = bgImageGeneration;

var x = 0;
bgImageGeneration();

$(".movieClick").on("click", displayMovieInfo2);
$("#submitReviewButton").on("click", displayReviews);
$("#registerButton").on("click", register);

var movieId;
var reviewId;

var userName=document.getElementsByName("hiddenUser")[0].value;

async function register() {
  $("#registerMessage").html(" ");

  var username = document.getElementById("user_name").value;
  var password = document.getElementById("user_password").value;

  if (username.length <= 0) {
    $("#registerMessage").append("Enter a username!");
    $("#registerMessage").append(`<br>`);
    $("#registerMessage").append(`<br>`);
  }
  else if (password.length <= 0) {
    $("#registerMessage").append("Enter a password!");
    $("#registerMessage").append(`<br>`);
    $("#registerMessage").append(`<br>`);
  }

  else if (username.length >= 20) {
    $("#registerMessage").append("Username too long!");
    $("#registerMessage").append(`<br>`);
    $("#registerMessage").append(`<br>`);
  }
  else if (password.length >= 20) {
    $("#registerMessage").append("Password too long!");
    $("#registerMessage").append(`<br>`);
    $("#registerMessage").append(`<br>`);
  }
  else {
    var info = username + "," + password;
    let url = `/api/register?info=${info}`;
    let response = await fetch(url);
    let data = await response.json();
    // alert(data);
    // $("#registerMessage").append(data);
    if (data == 0) {
    }
    else {
      $("#registerMessage").append("Username Taken!");
    }
  }

}
async function displayMovieInfo2() {

  movieId = this.id;
  $("#movieInfo").empty();
  $("#moviePhoto").empty();
  $("#movieRating").empty();
  $("#reviews").empty();
  $("#errorMessage").html(" ");

  // $('#reviewToggle').removeClass('active');
  var myModal = new bootstrap.Modal(document.getElementById('movieModal'));
  
  myModal.show();

  let url = `/api/movieInfo?movieId=${movieId}`;
  let response = await fetch(url);
  let data = await response.json();
  //  alert(data);
  // $(".modal-title").html(data.Poster);
  $(".modal-title").html(` <b>${data.Title} (${data.Year}) </b><br>`);
  $("#moviePhoto").append(`<img src="${data.Poster}" width="200"> <br>`);

   $("#movieRating").append(` <b>${data.imdbRating}</b>`);
  $("#movieInfo").append(`<br>`);
  $("#movieInfo").append(` <i>${data.Plot}</i> <br>`);
  $("#movieInfo").append(` <b>Rating:</b> ${data.Rated} <br>`);
  $("#movieInfo").append(` <b>Genre:</b> ${data.Genre} <br>`);
  $("#movieInfo").append(` <b>Director:</b> ${data.Director} <br>`);
  $("#movieInfo").append(` <b>Cast:</b> ${data.Actors} <br>`);
  
  url = `/api/getReviews?movieId=${movieId}`;
  response = await fetch(url);
  data = await response.json();
    for (var x = 0; x < data.length; x++) {
      $("#reviews").append(`<b>${data[x].userName}</b>` + "  ");
      data[x].Date
      $("#reviews").append(data[x].Date);
      $("#reviews").append(`<br>`);
      $("#reviews").append(data[x].Review);
      $("#reviews").append(`<br>`);

            if(userName==data[x].userName){
               $("#reviews").append(`<br>`);

              let reviewId=data[x].reviewId;
              // alert(reviewId);

              var link = document.createElement('a');
              link.setAttribute('href',`/api/delete?reviewId=${reviewId}`);
               link.innerText = "Delete";

               $("#reviews").append(link); 

  

              var link2 = document.createElement('a');
              link2.setAttribute('href',`/api/edit?reviewId=${reviewId}`);
              link2.innerText = "Edit";
              $("#reviews").append(link2);
              $("#reviews").append("  ");
              $("#reviews").append("  ");
              $("#reviews").append(link); 
              $("#reviews").append(`<br>`);
              $("#reviews").append(`<br>`);

           }

    for(var z=0;z<data[x].Rating;z++){
         document.getElementById("reviews").innerHTML+= '<img src="img/star.png" width=20 height=20>';
    }
    $("#reviews").append(`<br>`);
      $("#reviews").append(`<br>`);
      $("#reviews").append(`<br>`);
    }
}

async function displayReviews() {

  $("#errorMessage").html(" ");

  if(userName.length<=0){
    $("#errorMessage").html("You must sign in to write a review!");
  }

  else{
  $("#reviews").html("");
  // $("#errorMessage").html(" ");
  var error = document.getElementById("errorMessage");
  error.style.display = "none";
  var review = document.getElementById('reviewBox').value;
  // var rating = document.getElementById('rating').value;

  let rating = $("input[name = rating]:checked").val();
  if(rating<=0){
    rating=0;
  }

  // alert(rating);
  
  var revId = movieId;
  if (review.length <= 0) {
    error.style.display = "block";
    $("#errorMessage").html("Write a review!");
  }
  else if (review.length < 5) {
    error.style.display = "block";
    $("#errorMessage").html("Review too short!");
  }
  else if (review.length > 999) {
    error.style.display = "block";
    $("#errorMessage").html("Review too long!");
  }
  else {
    // $("#errorMessage").html(movieId);
    let url = `/api/submitReview?review=${movieId + "^" + rating + "^" + userName+"^"+ review}`;
    let response = await fetch(url);
    let data = await response.json();
    for (var x = 0; x < data.length; x++) {
      $("#reviews").append(`<b>${data[x].userName}</b>` + "  ");
      data[x].Date
      $("#reviews").append(data[x].Date);
      $("#reviews").append(`<br>`);
      $("#reviews").append(data[x].Review);
      $("#reviews").append(`<br>`);

      if(userName==data[x].userName){
                       $("#reviews").append(`<br>`);

              let reviewId=data[x].reviewId;
              // alert(reviewId);

              var link = document.createElement('a');
              link.setAttribute('href',`/api/delete?reviewId=${reviewId}`);
               link.innerText = "Delete";

               $("#reviews").append(link); 

  

              var link2 = document.createElement('a');
              link2.setAttribute('href',`/api/edit?reviewId=${reviewId}`);
              link2.innerText = "Edit";
              $("#reviews").append(link2);
              $("#reviews").append("  ");
              $("#reviews").append("  ");
              $("#reviews").append(link); 
              $("#reviews").append(`<br>`);
              $("#reviews").append(`<br>`);

      }

    for(var z=0;z<data[x].Rating;z++){
         document.getElementById("reviews").innerHTML+= '<img src="img/star.png" width=20 height=20>';
    }

      $("#reviews").append(`<br>`);
      $("#reviews").append(`<br>`);
    }
    $('#reviewBox').val('');
  }


  }
}




async function bgImageGeneration() {
  if (x == 0) {
    let bgUrl = `https://pixabay.com/api/?key=23643579-46b22be7a91c73f5afdaeee06&q=movie theater&orientation=horizontal`;
    let bgData = await fetchData(bgUrl);
    // console.log(bgData[0].webformatURL);
    var id = $('Body').attr('id');
    $("#" + id).css('background-image', 'url(' + bgData + ')');
    x++;
  }
}


async function fetchData(url) {
  let response = await fetch(url);
  let data = await response.json();
  var keywordsArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  var index = _.shuffle(keywordsArray);
  return data.hits[index[0]].webformatURL;
}
