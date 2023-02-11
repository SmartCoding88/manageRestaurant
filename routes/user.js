const express = require('express');
const { query } = require('../connection');
const connection = require('../connection');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { MailtrapClient } = require("mailtrap");

const auth = require("../services/authentication")
const checkRole = require("../services/checkRole");


require('dotenv').config();

//register
router.post("/signup",(req,res)=>{

    let user = req.body;
    register_query = "select email, password, role, status from user where email=?";
    connection.query(register_query, [user.email], (err,results)=>{

        if(!err){

            if(results.length <=0){
                query = "insert into user(name, contactNumber, email, password, status, role) values(?,?,?,?,'false','user')";
                connection.query(query, [
                    user.name,
                    user.contactNumber,
                    user.email,
                    user.password

                ] ,
                (err, resp)=>{
                    if(!err){
                        return res.status(200).json({message: "Successfully Registered !"});
                    }else{
                        return res.status(500).json(err);
                    }

                })
            }else{
                return res.status(400).json({message: "Email Already Exists !"});
            }

        }else{
    
            return res.status(500).json(err);
        }

    });
    
    

});

//login
router.post("/login", (req,res)=>{

    const user = req.body;

    login_query= "select email, password, role, status from user where email=?";

    connection.query(login_query, [user.email], (err, results)=>{

        if(!err){
            if(results.length <= 0 || results[0].password !==user.password){

                res.status(401).json({message: "Incorrect Username or Password"});

            }else if(results[0].status === 'false'){

                return res.status(401).json({message:"Wait for Admin Approval"});

            }else if(results[0].password == user.password){

                const response = {
                    email: results[0].email,
                    role: results[0].role
                };
                const accessToken = jwt.sign(response, process.env.ACCESS_TOKEN, {expiresIn:'8h'});

                res.status(200).json({token: accessToken});

            }else{
                return res.status(400).json({message: "Something went wrong.Please try later"});
            }
        }else{

            return res.status(500).json(err);

        }

    });
});

//forgot password
// var transporter_gmail = nodemailer.createTransport({
//     service: 'gmail',
//     auth:{
//         user: process.env.EMAIL,
//         pass: process.env.PASSWORD
//     }
// });
var transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "8931b30b37788a",
      pass: "e86b381bf81e4f"
    }
  });

router.post("/forgotpassword",(req,res)=>{

    const user = req.body;
    forgot_query = "select email, password from user where email=?";
    connection.query(forgot_query, [user.email], (err, results) =>{

        if(!err){

            if(results.length <=0 ){
                return res.status(200).json({message: "Password sent successfully to your email"});
            }
            else{
               
                var mailOptions = {
                    from: process.env.SENDER_EMAIL,
                    to: results[0].email,
                    subject: 'Password by Restaurant Management System',
                    html: '<p><b>Your Login Details for Restaurant Management System</b><br/><b>Email:</b>'+results[0].email+'<br/><b>Password:</b>'+results[0].password+'<br/><a href="http://localhost:3000/user/login">Click here to login</a></p>'
                };
                transporter.sendMail(mailOptions, function(error, info){
                    if(error){
                        console.log(error);
                    }else{
                        console.log('Email Sent: '+info.response)
                    }
                });

                return res.status(200).json({message: "Password sent successfully to your email"});
            }
            
        }else{

            return res.status(500).json(err);

        }

    });

});

//get users
router.get("/get", auth.authenticateToken,checkRole.checkRole, (req, res)=>{

    const users_query = "select id, name, email, contactNumber, status from user where role='user'";

    connection.query(users_query, (err, results)=>{

        if(!err){

            return res.status(200).json(results);

        }else{

            return res.status(500).json(err);

        }

    })

});

//patch
router.patch("/update", auth.authenticateToken, (req, res)=>{

    let user = req.body;

    const patch_query = "update user set status=? where id=?";
    connection.query(patch_query, [user.status, user.id], (err, results)=>{
        if(!err){
            if(results.affectedRows == 0){

                return res.status(404).json({message: "User id does not exist !"});

            }

            return res.status(200).json({message: "User updated successfully"});
        }else{
            return res.status(300).json(err);
        }
    })

});

router.get("/checkToken", auth.authenticateToken, (req,res)=>{
    
    return res.status(200).json({message: "true"});

});

router.post("/changePassword",auth.authenticateToken, (req,res)=>{

    const user = req.body;
    const email = res.locals.email;

    var change_pwd_query = "select * from user where email=? and password=?";
    connection.query(change_pwd_query, [email, user.oldPassword],(err,results)=>{
        if(!err){

            if(results.length <=0){
                return res.status(400).json({message:"Incorrect Old Password"});
            }else if(results[0].password == user.oldPassword){

                update_query = "update user set password=? where email=?"; 
                connection.query(update_query, [user.newPassword, email], (err, results)=>{

                    if(!err){

                        return res.status(200).json({message: "Password Updated Succesfully !"});

                    }else{
                        return res.status(500).json(err);
                    }

                })

            }else{
                return res.status(400).json({message: "Something went wrong. Please try later."});
            }

        }else{
            return res.status(500).json(err);
        }
    })

});


module.exports = router;