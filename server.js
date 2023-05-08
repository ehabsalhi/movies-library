const express = require("express")
const cors = require("cors")
const app = express()
const data = require("./data.json")
const  axios  = require("axios")
require('dotenv').config();


app.use(express.json())
app.use(cors())

///////////////////////// lab 13 ////////////////////////////

function Movies(title , posterpath , overview){
     this.title = title;
     this.poster_path = posterpath;
     this.overview = overview;
     Movies.allMovies.push(this)
}
Movies.allMovies =[]

// Home page
app.get("/",(req , res) => {
     let endData = new Movies (data.title , data.poster_path , data.overview)
     res.status(200).json(Movies.allMovies)
} )

// Favorite page
app.get("/favorite", (req,res) =>{
     res.send("Welcome to Favorite Page")
})




////////////////////////// lab 14 /////////////////////////////

function Movies2 (title , posterpath , overview , id , release_date){
     this.title = title;
     this.poster_path = posterpath;
     this.overview = overview;
     this.id = id;
     this.release_date = release_date;
     Movies2.allMovies.push(this)
} 
Movies2.allMovies = []

// Trending page
let trendinglink = process.env.trenUrl
app.get('/trending',handelerMove)  
async function handelerMove (req , res){
     const axiosData = await axios.get(trendinglink)
     
     axiosData.data.results.map(ele => {
          new Movies2 (ele.title , ele.poster_path , ele.overview , ele.id , ele.release_date)
     })
     
     res.status(200).json({
          status : axiosData.status,
          trending : Movies2.allMovies
     })
}

// Search page
let search = process.env.searchURl
app.get('/search' , handelSearch)  // to search do that : /search?search=movie_title
function handelSearch (req ,res){
     const searchQuery = req.query.search
     let searchItem = []

     axios.get(`${search}&query=${searchQuery}`).then(result =>{
          result.data.results.map(item =>{

               let arr = ((item.title).toLocaleLowerCase())
               if(arr.includes(searchQuery)){
                    searchItem.push(item)
               }
          })

          res.status(200).json({
               status : result.status,
               trending :searchItem,
             })
     })
}

// Now playing page
playing = process.env.playing
app.get('/now_playing' ,handelVideo)
function handelVideo(req , res ){

     axios.get(playing).then(
          result => {
               
               res.status(200).json({
                    status : result.status,
                    now_playing : result.data.results,
                  })
          }
     )

}

// Top Rated page
topRated = process.env.topRated
app.get('/toprated' , handelTop)
function handelTop (req , res){
     axios(topRated).then(
          result =>{
               // console.log(result.data)
               res.status(200).json({
                    status : result.status,
                    topRated : result.data.results,
                  })
          }
     )
}


// Error handler
app.use(function (err, req, res, next) {
     res.status(500).json({
          "status": 500,
          "responseText": "Something broke!"
          })
   })

app.use('*',(req,res) =>{
     res.status(404).json({
          "status": 404,
          "responseText": "page not found error"
          })
})



app.listen(8080, () => console.log("lab 13"))