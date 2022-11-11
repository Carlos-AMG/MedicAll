const express = require("express")
const { faker } = require('@faker-js/faker');
const app = express()
const mysql = require("mysql")
let bodyParser = require("body-parser")

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));

const db = mysql.createPool({
   connectionLimit: 100,
   host: "localhost",       //This is your localhost IP
   user: "",         // "newuser" created in Step 1(e)
   password: "",  // password for the new user
   database: "medicAll",      // Database name
   port: "3306"             // port name, "3306" by default
});

app.get("/", function(req, result){
    let users;
    db.query("select count(*) from cita", (err, res, fields) => {
        if (err) throw err;
        // console.log(res[0]['count(*)']);
        users = res[0]['count(*)'];
        result.render("index", {users});
    })

})
app.get("/citasClientes", function(req, res){
    res.render("citasClientes");
})

app.get("/pacientesPadecimiento", function(req, res){
    // console.log(data);
    res.render("pacientesPadecimiento", {data: []});
})

app.post("/prueba", function(req, result){
    let data = req.body.padecimientos;
    let query = `select cliente.nombre, cliente.apellido, cliente.edad, cliente.nss, padecimiento.enfermedad, 
    padecimiento.tipoEnfermedad, diagnostico.fechaPadecimiento from cliente join diagnostico on cliente.nss = diagnostico.cliente_nss join 
    padecimiento on padecimiento.id = diagnostico.idPadecimiento where padecimiento.enfermedad like ?`
    db.query(query, data, function(err, res){
        if (err) throw err;
        // console.log(res);
        data = res;
        console.log(data);
        result.render("pacientesPadecimiento", {data})
    })
});


let userName;
app.post("/loginUser", function(req, result){
    // console.log(req.body);
    let name = {username: req.body.username}.username
    console.log("This is the body", req.body)
    let passwd = {password: req.body.password}.password
    console.log(name, passwd);
    db.query("select * from users where name = ? and passwd = ?", [name, passwd], function(err, res){
        if (err) throw err;
        console.log("This is the result", res);
        console.log("This is the first result", res[0]);
        if (res.length === 0){
            console.log("User not found in query, redirect");
            return;
        }
        let actualName = res[0].name 
        let actualPasswd = res[0].passwd
        console.log(actualName, actualPasswd)
        console.log(actualName, actualPasswd, name, passwd)
        if (actualName === name && actualPasswd === passwd){
            console.log("It will run");
            userName = actualName;
            result.redirect("/loggedIn")
        }else{
            console.log("User doesn't match");
        }
    })
})

app.get("/login", function(req, res){
    res.render("signIn", {userName});
})

app.get("/loggedIn", function(req, res){
    res.render("loggedIn", {userName});
})

app.get("/signup", function(req, res){
    res.render("signUp")
})

db.getConnection( (err, connection)=> {
   if (err) throw (err)
   console.log ("DB connected successful: " + connection.threadId)
})


app.listen(3000, function(){
   console.log("Server running on port 3000")
})