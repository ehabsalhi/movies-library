const express = require("express")
const cors = require("cors")
const app = express()
const data = require("./data.json")
const  axios  = require("axios")
require('dotenv').config();



app.use(express.json())
app.use(cors())

///////////////////////// lab 13 ////////////////////////////
////////////////////////////////////////////////////////////

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
app.get("/favorite1", (req,res) =>{
     res.send("Welcome to Favorite Page")
})




////////////////////////// lab 14 ////////////////////////////
/////////////////////////////////////////////////////////////

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
     try {
          Movies2.allMovies = []
          const axiosData = await axios.get(trendinglink)
          
          axiosData.data.results.map(ele => {
               new Movies2 (ele.title , ele.poster_path , ele.overview , ele.id , ele.release_date)
          })
          
          res.status(200).json({
               status : axiosData.status,
               trending : Movies2.allMovies
          })
     }
     catch{
          errorHandler(err, req ,res,next)
     }

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
     }).catch(err =>{
          errorHandler(err, req ,res,next)
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
     ).catch(err =>{
          errorHandler(err, req ,res,next)
     })

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
     ).catch(err =>{
          errorHandler(err, req ,res,next)
     })
}



////////////////////////// lab 15 ////////////////////////////
/////////////////////////////////////////////////////////////


// database connect 
const pg = require("pg")
const client = new pg.Client(process.env.DBURL)


app.get('/getmovies' , getMovies )

function getMovies(req ,res){
    const sql = `select * from all_movies`;

    client.query(sql).then(data =>{
     res.json(data.rows)
    }).catch(err =>{
     errorHandler(err , req , res,next)
    })
}

app.post('/addmovies' , addMOvies )

function addMOvies(req ,res){
     const userInput = req.body
     sql = `insert into all_movies (title , overview , poster_path , release_date) values ( $1 ,$2 , $3, $4) returning *`
     let values = [ userInput.title ,userInput.overview ,userInput.poster_path ,userInput.release_date ]
     
    // '${userInput.title}','${userInput.overview}' , '${userInput.poster_path}','${userInput.release_date}'

     client.query(sql , values).then(data =>{
          res.status(201).json(data.rows)
     }).catch(err =>{
          errorHandler(err, req ,res,next)
     })

}


/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

app.post('/favorite' , addFavMOvies )
function addFavMOvies(req ,res){
     const userInput = req.body
     console.log(userInput);
     sql = `insert into favorite (title , overview , poster_path , release_date , movie_id , comment) values ( $1 ,$2 , $3, $4 , $5 , $6) returning *`
     let values = [ userInput.title ,userInput.overview ,userInput.poster_path ,userInput.release_date  ,userInput.id , userInput.comment ]
     

     client.query(sql , values).then(data =>{
          res.status(201).json(data.rows)
     }).catch(err =>{
          console.log(err);
          // errorHandler(err, req ,res)   
     })
}



function Favorite(id ,title , overview,poster_path, release_date,comment ){
     this.id = id ,
     this.title = title ,
     this.overview = overview ,
     this.poster_path = poster_path ,
     this.release_date = release_date ,
     this.comment = comment ,
     Favorite.all.push(this)
}
Favorite.all = []



app.get("/favorite", getfavorite)
function getfavorite (req ,res ) {
     sql = `select * from favorite`;
     Favorite.all = []
     client.query(sql).then(data => {
          data.rows.map(item => new Favorite(item.movie_id ,item.title ,item.overview ,item.poster_path ,item.release_date ,item.comment ))
          res.json({
               status : 200,
               result : Favorite.all
          })
     }).catch(err =>{
          errorHandler(err, req ,res)
     })
}


app.put('/favorite/:id', updateFav)

function updateFav(req , res){
     const id = req.params.id
     const userInput = req.body

     const sql = `update favorite set comment = $1 where movie_id = $2 returning *`
     const values = [userInput.comment , id]

     client.query(sql , values).then(result =>{
          res.status(201).json({
               code : 201,
               movie: result.rows
          })
     })
     .catch(err => errorHandler(err,req ,res))
}



app.delete('/favorite/:id',deleteFav)


function deleteFav(req ,res){
     const id = req.params.id
     const sql = `delete from favorite where movie_id = ${id} `

     client.query(sql).then(result => {
          res.status(204).json(result)
     })
     .catch(err => errorHandler(err,req , res))
}




/////////////////////////////////////////////////////////////
////////////////////////// lab 16 ////////////////////////////



app.get('/getmovies/:id',getSpecificMov)
function getSpecificMov ( req , res){
     const id = req.params.id
     const sql = `select * from all_movies where id = ${id} `
     client.query(sql).then(data =>
      res.status(200).json(data.rows)
      ).catch(err =>{
          errorHandler(err, req ,res,next)
     })
}


app.put('/updatemovie/:id', updateMov)
function updateMov ( req , res){
     const id = req.params.id
     const newData = req.body
     sql = `update all_movies set title = $1, overview = $2, poster_path = $3 , release_date = $4 where id = $5 returning * `
     const updatedValue = [ newData.title ,newData.overview ,newData.poster_path ,newData.release_date , id] 

     client.query(sql , updatedValue ).then(data =>
          res.status(202).json(data.rows)
     ).catch(err =>{
          errorHandler(err, req ,res,next)
     })
}


app.delete('/deletemovie/:id',deleteMov)

function deleteMov(req , res ){
     const id = req.params.id
     const sql = `delete from all_movies where id = ${id} `

     client.query (sql).then(() => {
         return res.status(204).json({
          message : `The movie has been Deleted`
         })
     }).catch(err =>{
          errorHandler(err, req ,res,next)
     })
}


/////////////////////// Error handler ////////////////////////////

app.use(errorHandler)
function errorHandler (err, req, res,next) {
     res.status(500).json({
          "status": 500,
          "responseText": err.message ||"Something broke!"
          })
   }

app.use('*',(req,res) =>{
     res.status(404).json({
          "status": 404,
          "responseText": "page not found error"
          })
})





client.connect().then((con) =>{
     console.log(con);
     app.listen(process.env.PORT || 5000, () => console.log("lab 13"))
})