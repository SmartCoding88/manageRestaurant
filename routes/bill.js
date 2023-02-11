const express = require('express');
const connection = require('../connection');
const router = express.Router();

let ejs = require("ejs");
let pdf = require("html-pdf");
let path = require("path");
let fs = require('fs');
let uuid = require("uuid");
var options = {
    childProcessOptions: {
        env: {
            OPENSSL_CONF: '/dev/null',
        },
    }
};

var auth = require("../services/authentication");

//generate Report
router.post("/generateReport", auth.authenticateToken, (req, res) => {

    const generatedUuid = uuid.v1();
    const orderDetails = req.body;
    const productDetailsReport = JSON.parse(orderDetails.productDetails);

    query = "insert into bill(name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) values(?,?,?,?,?,?,?,?)";

    connection.query(query, [orderDetails.name, generatedUuid, orderDetails.email, orderDetails.contactNumber, orderDetails.paymentMethod, orderDetails.totalAmount, orderDetails.productDetails, res.locals.email], (err, reslt) => {
        if (!err) {

            ejs.renderFile(path.join(__dirname, "", "report.ejs"), { productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount }, (err, result) => {

                if (err) {

                    return res.status(500).json(err);

                } else {

                    pdf.create(result, options).toFile('./generated_pdf/' + generatedUuid + '.pdf', function (err, data) {
                        console.log(('here'))
                        if (err) {
                            return res.status(500).json(err);
                        } else {
                            return res.status(200).json({ uuid: generatedUuid });
                        }
                    })
                }
            });

        } else {
            return res.status(500).json(err);
        }
    })

});

router.post('/getPDF', auth.authenticateToken, (req, res) => {

    const orderDetails = req.body;
    const pdfPath = './generated_pdf/' + orderDetails.uuid + ".pdf";
    if (fs.existsSync(pdfPath)) {
        res.contentType("application/pdf");
        fs.createReadStream(pdfPath).pipe(res);
    } else {
        var productDetailsReport = JSON.parse(orderDetails.productDetails);
        ejs.renderFile(path.join(__dirname, "", "report.ejs"), { productDetails: productDetailsReport, name: orderDetails.name, email: orderDetails.email, contactNumber: orderDetails.contactNumber, paymentMethod: orderDetails.paymentMethod, totalAmount: orderDetails.totalAmount }, (err, result) => {

            if (err) {

                return res.status(500).json(err);

            } else {

                pdf.create(result, options).toFile('./generated_pdf/' + orderDetails.uuid + '.pdf', function (err, data) {
                    if (err) {
                        return res.status(500).json(err);
                    } else {
                        res.contentType("application/pdf");
                        fs.createReadStream(pdfPath).pipe(res);
                    }
                })
            }
        });

    }


});

router.get("/getBills", auth.authenticateToken, (req, res) => {

    var query = "select * from bill order by id DESC";

    connection.query(query, (err, results) => {
        if (!err) {

            return res.status(200).json(results);

        } else {

            return res.status(500).json(err);

        }
    })
});

router.delete("/delete/:id", auth.authenticateToken, (req, res, next) => {
    const id = req.params.id;

    var delete_query = "delete from bill where id=?";

    connection.query(delete_query, [id], (err, results) => {
        if (!err) {
            if (results.affectedRows == 0) {
                return res.status(404).json({ message: "Bill id is not found" });
            } else {
                return res.status(200).json({ message: "Bill deleted successfully" });
            }
        } else {
            return res.status(500).json(err);
        }
    })
})

module.exports = router;

