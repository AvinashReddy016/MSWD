const express=require('express')
const cors=require('cors')
const {MongoClient} =require('mongodb')
const bcrypt =require('bcrypt')
const jwt = require('jsonwebtoken')
const {expressjwt:exjwt}= require('express-jwt')
const jwt_decode=require('jwt-decode')
const fs=require('fs')

const app=express()
app.use(cors())
app.use(express.json())

var secretkey="abcd"
var algorithm="HS256"
var jwtmw=exjwt({
    secret:secretkey,
    algorithms:[algorithm]
})

const client=new MongoClient('mongodb+srv://admin:admin@cluster0.mrtyl5c.mongodb.net/?retryWrites=true&w=majority');
client.connect()
const db=client.db('s21')
const col=db.collection('register')

app.get('/home',(req,res)=>{
    res.send("welcome")
})

app.post('/insert',async (req,res)=>{
    console.log(req.body)
    req.body.password=await bcrypt.hash(req.body.password,5)
    col.insertOne(req.body)
    res.send("data recieved")
})

app.get('/show', jwtmw, async (req,res)=>{
    console.log(req.headers)
    console.log(jwt_decode.jwtDecode(req.headers.authorization.substring(7)))
    var result=await col.find().toArray()
    res.send(result)
})

app.post('/check',async (req,res)=>{
    console.log(req.body)
    var result=await col.findOne({name:req.body.un})
    console.log(result)
    if(await bcrypt.compare(req.body.pw,result.password)){
        var token=jwt.sign(result,secretkey,{
            algorithm:algorithm,
            expiresIn:"20m"
        })
        res.send({
            message:result,
            token:token
        })
    }
    else{
        res.send({
            message:"fail",
            token:null
        })
    }
})

app.get('/file',(request,response)=>{
    fs.writeFile("demo.txt","welcome",function(err){
        return err
    })
    response.send("written data")
})
app.get('/append',(request,response)=>{
    fs.appendFile("demo.txt","mswd class",function(err){
        return err
    })
    response.send("data appended")
})
app.get('/read',async (request,response)=>{
     fs.readFile("demo.txt","utf-8",function(err,data){
        console.log (data)
        response.send(data)
    })
    
})

app.delete('/delete',async (req,res)=>{
    console.log(req.query.name)
    await col.deleteOne({name:req.query.name})
    res.send("deleted")
})

app.put('/update',async (req,res)=>{
    console.log(req.body)
    var doc={
        $set:{
            password:await bcrypt.hash(req.body.pw, 5),
            email:req.body.email,
            role:req.body.roll
        }
    }
    col.updateOne({name:req.body.name},doc)
    res.send("updated")
})

app.listen(8081)
console.log("server running")