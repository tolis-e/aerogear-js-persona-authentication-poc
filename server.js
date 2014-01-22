var express = require('express'),
    app = express(),
    request = require('request'),
    https = require("https"),
    querystring = require("querystring");

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ( 'OPTIONS' === req.method ) {
      res.send( 200 );
    }
    else {
      next();
    }
};

app.configure(function () {
    app.use( allowCrossDomain );
    app.use( express.json() );
    app.use( express.urlencoded() );
});

// to be sent to the verification API
var PORT = 3000,
    audience = "http://127.0.0.1:" + PORT;

// https://developer.mozilla.org/en-US/Persona/Remote_Verification_API?redirectlocale=en-US&redirectslug=Persona%2FRemote_Verification_API
app.post("/verify", function ( req, res ) {
    var vreq = https.request({
                host: "verifier.login.persona.org",
                path: "/verify",
                method: "POST"
            }, function ( vresp ) {
                var body = "";
                vresp.on( 'data', function ( chunk ) { body += chunk; } )
                .on('end', function() {
                    try {
                        console.log( "Response body: " + body );
                        var verifierResp = JSON.parse(body),
                            valid = verifierResp && verifierResp.status === "okay",
                            email = valid ? verifierResp.email : null;

                        if ( valid ) {
                            console.log( "Assertion verified successfully for email: " + email );
                            res.json(email);
                        } else {
                            console.log( "Failed to verify assertion:" + verifierResp.reason );
                            res.send( verifierResp.reason, 403 );
                        }
                    } catch( e ) {
                        console.log("Error while processing the response from verification API: " + e );
                        res.send("Error while processing the response from verification API", 403);
                    }
                });
            });

    vreq.setHeader('Content-Type', 'application/x-www-form-urlencoded');
    
    console.log( 'Posted assertion:' + req.body.assertion );

    var data = querystring.stringify({
        assertion: req.body.assertion,
        audience: audience
    });

    vreq.setHeader( 'Content-Length', data.length );
    vreq.write( data );
    vreq.end();

    console.log( "Assertion Verification Completed" );
});

// serve static files
app.use( express.static( __dirname + "/static" ) );
app.listen( PORT );
console.log( 'Mozilla Persona Server Listening on port ' + PORT );
