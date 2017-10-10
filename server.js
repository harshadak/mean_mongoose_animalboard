// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();

var mongoose = require('mongoose');

// This is how we connect to the mongodb database using mongoose -- "basic_mongoose" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/animal_data');

var AnimalSchema = new mongoose.Schema({
    animal: {type: String, required: true, minlength: 3},
    name: {type: String, required: true, maxlength: 20 },
    age: {type: Number, required: true, min: 1, max: 150}
}, {timestamps: true})
mongoose.model('Animal', AnimalSchema); // We are setting this Schema in our Models as 'Animal'
// Use native promises
mongoose.Promise = global.Promise;

var Animal = mongoose.model('Animal') // We are retrieving this Schema from our Models, named 'Animal'

// Require body-parser (to receive post data from clients)
var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

// Routes

// Root Request
// Route to display all the animals
app.get('/', function(req, res) {
    // This is where we will retrieve the users from the database and include them in the view page we will be rendering.

    Animal.find({}, function(err, animals) {
        if(err) {
            console.log("Something went wrong");
        } else {
            console.log("All the animals: ", animals);
            res.render('index', {animalBank: animals});
        }  
    })
});

// Route to display the form for adding a new animal
app.get('/animals/new', function(req, res) {
    res.render('animal_form');
});

// Add Animal Request 
app.post('/animals', function(req, res) {
    console.log("POST DATA", req.body);
    // create a new User with the name and age corresponding to those from req.body
    var animal = new Animal({animal: req.body.animal, name: req.body.name, age: req.body.age});
    // Try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
    animal.save(function(err) {
        // if there is an error console.log that something went wrong!
        if(err) {
            console.log('something went wrong');
            console.log(err.errors);
            res.render('animal_form', {errors: err.errors});
        } else { // else console.log that we did well and then redirect to the root route
            console.log('successfully added an animal!');
            res.redirect('/');
        }
    })
});

// NEED TO WORK ON THIS
// Route to display form for editing an animal
app.get('/animals/edit/:id', function(req, res) {
    console.log("!!!!!!!!!!!!!!!!!!!!", req.params.id);
    Animal.findOne({_id: req.params.id}, function(err, animals) {
        if(err) {
            console.log('something went wrong', err);
            res.render('index');
        } else {
            console.log("successfully edited", animals);
            res.render('animal_form', {animalBank: animals});
        }
    })
});

app.post('/animals/edit/:id', function(req, res) {
    console.log("**###############*******", req.body);
    Animal.update({_id: req.params.id}, req.body, function(err, animals) {
        if(err) {
            console.log('something went wrong', err);
            res.render('animal_form', {errors: err.errors});
        } else {
            console.log("successfully edited animal", animals);
            res.redirect('/');
        }
    })
})

// Deleting an animal
app.post('/animals/destroy/:id', function(req, res) {
    console.log("*********", req.params.id);
    Animal.remove({_id: req.params.id}, function(err, result) {
        if(err) {
            console.log('something went wrong', err);
        } else { // else console.log that we did well and then redirect to the root route
            console.log('successfully deleted an animal!', Animal.id);
            res.redirect('/');
        }
    })
});

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
});
