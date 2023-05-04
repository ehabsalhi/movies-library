const express = require("express")
const cors = require("cors")
const app = express()
const data = require("./data.json")

app.use(express.json())
app.use(cors())

function Movies(title , posterpath , overview){
     this.title = title;
     this.poster_path = posterpath;
     this.overview = overview;
     Movies.allMovies.push(this)
}

Movies.allMovies =[]

app.get("/",(req , res) => {
     let endData = new Movies (data.title , data.poster_path , data.overview)
     res.status(200).json(Movies.allMovies)
} )

app.get("/favorite", (req,res) =>{
     res.send("Welcome to Favorite Page")
})


// Error handler


app.use(function (err, req, res, next) {
     console.log(err) 
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