const express = require('express');
const connection = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");


router.get("/details",auth.authenticateToken, (req, res, next)=>{

    var categoriesCount;
    var productsCount;
    var billsCount;

    var category_query="select count(id) as categoriesCount from category";
    connection.query(category_query, (err, results)=>{
        if(!err){
            categoriesCount = results[0].categoriesCount;
           
        }else{
            return res.status(500).json(err)
        }
    });

    var product_query="select count(id) as productsCount from product";
    connection.query(product_query, (err, results)=>{
        if(!err){
            productsCount = results[0].productsCount;
        }else{
            return res.status(500).json(err)
        }
    });

    var bill_query="select count(id) as billsCount from bill";
    connection.query(bill_query, (err, results)=>{
        if(!err){
            billsCount = results[0].billsCount;
            var data={
                categories: categoriesCount,
                product: productsCount,
                bills: billsCount
            }
            return res.status(200).json(data);
        }else{
            return res.status(500).json(err)
        }
    });
});

module.exports = router;