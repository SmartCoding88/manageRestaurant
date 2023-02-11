const express = require('express');
const connection = require('../connection');
const router = express.Router();

let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
let fs = require('fs');
let uuid = require("uuid");

var auth = require("../services/authentication");

//generate Report
router.post("/generateReport", auth.authenticateToken, (req,res)=>{

    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
    const productDetailsReport = JSON.parse(orderDetails.productDetails);
    var options = {
        childProcessOptions: {
          env: {
            OPENSSL_CONF: '/dev/null',
          },
        }
      };


    query="insert into bill(name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) values(?,?,?,?,?,?,?,?)";

    connection.query(query, [orderDetails.name,generatedUuid,orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.totalAmount, orderDetails.productDetails, res.locals.email], (err,reslt)=>{
        if(!err){

            ejs.renderFile(path.join(__dirname,"","report.ejs"), {productDetails:productDetailsReport, name: orderDetails.name, email:orderDetails.email, contactNumber:orderDetails.contactNumber,paymentMethod:orderDetails.paymentMethod, totalAmount:orderDetails.totalAmount}, (err, result)=>{
               
                if(err){

                    return res.status(500).json(err);
                    
                }else{       
                    
                    pdf.create(result,options).toFile('./generated_pdf/'+ generatedUuid +'.pdf',function(err, data){
                        console.log(('here'))
                        if(err){
                            return res.status(500).json(err);
                        }else{
                            return res.status(200).json({uuid: generatedUuid});
                        }
                    })
                }
            });

        }else{
            return res.status(500).json(err);
        }
    })

});

module.exports = router;

