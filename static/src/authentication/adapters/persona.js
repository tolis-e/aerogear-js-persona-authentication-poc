/* AeroGear JavaScript Library
* https://github.com/aerogear/aerogear-js
* JBoss, Home of Professional Open Source
* Copyright Red Hat, Inc., and individual contributors
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/
/**
    The Persona adapter is an authentication adapter based on the Mozilla's Persona sign-in system. It uses jQuery.ajax to communicate with the verification API.
    Persona allows you to sign in to sites using any of your existing email addresses; and if you use Yahoo! or Gmail for email, you will be able to sign in without having to create a new password.
    @status Experimental
    @constructs AeroGear.Authentication.adapters.Persona
    @param {String} name - the name used to reference this particular authentication module
    @param {Object} settings={} - the settings to be passed to the adapter
    @param {String} [settings.verificationEndpoint] - the required endpoint to verify the generated signed assertions
    @returns {Object} The created authentication module
    @example
    var persona = AeroGear.Auth({
        name: 'persona',
        type: 'Persona',
        settings: {
            verificationEndpoint: "http://127.0.0.1:3000/verify"
        }
    }).modules.persona;
 */
AeroGear.Auth.adapters.Persona = function( name, settings ) {
    // Allow instantiation without using new
    if ( !( this instanceof AeroGear.Auth.adapters.Persona ) ) {
        return new AeroGear.Auth.adapters.Persona( name, settings );
    }

    settings = settings || {};

    // Private Instance vars
    var type = "Persona",
        email = null,
        localStorageName = "ag-auth-persona",
        verificationEndpoint = settings.verificationEndpoint;

    // Privileged methods
    /**
        Returns the value of the private settings var
        @private
        @augments Persona
     */
    this.getSettings = function() {
        return settings;
    };

    /**
     * Returns the value of the private settings var
     * @private
     * @augments Persona 
     */
    this.getLocalStorageName = function() {
        return localStorageName;
    }
    
    /**
     * Returns the value of the private settings var
     * @private
     * @augments Persona 
     */
    this.getEmail = function() {
        return localStorage[ localStorageName ] || email;
    }

    /**
     * Stores the email value in local storage
     * @private
     * @augments Persona 
     */ 
    this.setEmail = function( email ) {
        localStorage.setItem( localStorageName, email );
    }

    /**
     * Removes the email from local storage
     * @private
     * @augments Persona
     */ 
    this.removeEmail = function() {
        localStorage.removeItem( localStorageName );
    }

    /**
        Returns the value of the private name var
        @private
        @augments Persona
     */
    this.getName = function() {
        return name;
    };

    /**
     * Returns the value of the private settings var
     * @private
     * @augments Persona
     */
    this.getVerificationEndpoint = function() {
        return verificationEndpoint;
    };

    /**
     * Process the options passed to a method
     * @private
     * @augments Persona
     * */
    this.processOptions = function( options ) {
        var processedOptions = {};
        if ( options.contentType ) {
            processedOptions.contentType = options.contentType;
        }

        if ( options.dataType ) {
            processedOptions.dataType = options.dataType;
        }

        if ( options.verificationEndpoint ) {
            processedOptions.url = options.verificationEndpoint;
        } else {
            processedOptions.url = verificationEndpoint;
        }

        if( options.xhrFields ) {
            processedOptions.xhrFields = options.xhrFields;
        }

        return processedOptions;
     };
};

/**
    Initiates the Mozilla Persona authentication procedure by enabling the BrowserID and generating a signed assertion
    @param {Object} [options={}] - An object containing key/value pairs representing options
    @param {AeroGear~onAssertionREST} [options.onAssertion] - a callback to be called when the BrowserID is enabled and a signed assertion is generated
    @param {AeroGear~errorCallbackREST} [options.error] - callback to be executed when the signed assertion generation fails
    @example
    var persona = AeroGear.Auth({
        name: 'persona',
        type: 'Persona',
        settings: {
            verificationEndpoint: "http://127.0.0.1:3000/authenticate"
        }
    }).modules.persona;
    
    var onSuccessVerification = function( email ) {
            console.log( "Assertion was successfully verified email: '" + email  + "'" );
        },
        onFailedVerification = function( error ) {
            console.log( "Assertion verification failed" );
        },
        onLogout = function () {
            console.log( "Logout callback called" );
        },
        onError = function () {
            console.log( "Could not create signed assertion " );
        }

    persona.watch({
        success: function ( assertion ) {
            persona.verify( { assertion: assertion }, { success: onSuccessVerification, error: onFailedVerification } );
        },
        error: onError,
        
    });
 */
AeroGear.Auth.adapters.Persona.prototype.watch = function( options ) {
    var that = this,
        onLogin = function ( assertion ) {
            if ( assertion ) {
                 options.onLogin.apply ( that, arguments );
             } else {
                 options.onLoginError.apply( that, arguments );
             }
         },
        onLogout = function () {
            that.removeEmail();
            options.onLogout.apply( that, arguments );
        };
 
     navigator.id.watch ({
         loggedInUser: that.getEmail(),
         onlogin: onLogin, 
         onlogout: onLogout
     });
};

/**
    Enables the Persona authentication sign-in procedure
    @example
    var persona = AeroGear.Auth({
        name: 'persona',
        type: 'Persona',
        settings: {
            verificationEndpoint: "http://127.0.0.1:3000/authenticate"
        }
    }).modules.persona;
    
    persona.login();
 */
AeroGear.Auth.adapters.Persona.prototype.login = function() {
    navigator.id.request();
};

/**
    Verifies the generated signed assertion
    @param {Object} data - A set of key value pairs representing the signed assertion
    @param {Object} [options={}] - An object containing key/value pairs representing options
    @param {AeroGear~onSuccessVerificationREST} [options.success] - a callback to be called when the assertion is successfully verified
    @param {AeroGear~onFailedVerificationREST} [options.error] - callback to be executed when the signed assertion verification fails
    @example
    var persona = AeroGear.Auth({
        name: 'persona',
        type: 'Persona',
        settings: {
            verificationEndpoint: "http://127.0.0.1:3000/authenticate"
        }
    }).modules.persona;

    var onSuccessVerification = function( email ) {
            console.log( "Assertion was successfully verified email: '" + email  + "'");
        },
        onFailedVerification= function( error ) {
            console.log( "Assertion verification failed");
        },
        onLoginError = function () {
            console.log("ERROR during Mozilla Persona login");
        };

    persona.login({
        onAssertion: function ( assertion ) {
            persona.verify( { assertion: assertion }, { success: onSuccessVerification, error: onFailedVerification } );
        },
        error: onLoginError
    });
*/
AeroGear.Auth.adapters.Persona.prototype.verify = function( data, options ) {
    options = options || {};

    var that = this,
        success,
        error,
        extraOptions;

    success = function( data, textStatus, jqXHR ) {
        if ( options.success ) {
            options.success.apply( this, arguments );
        }
    };
    
    error = function( jqXHR, textStatus, errorThrown ) {

        that.logout();

        var args;

        try {
            jqXHR.responseJSON = JSON.parse( jqXHR.responseText );
            args = [ jqXHR, textStatus, errorThrown ];
        } catch( error ) {
            args = arguments;
        }

        if ( options.error ) {
            options.error.apply( this, args );
        }
    };

    extraOptions = jQuery.extend( {}, this.processOptions( options ), {
        complete: options.complete,
        success: success,
        error: error,
        data: data
    });

    if ( extraOptions.contentType === "application/json" && extraOptions.data && typeof extraOptions.data !== "string" ) {
        extraOptions.data = JSON.stringify( extraOptions.data );
    }

    return jQuery.ajax( jQuery.extend( {}, this.getSettings(), { type: "POST" }, extraOptions ) );
};

/**
    Causes the browser to reset the automatic login flag
    @example
    var persona = AeroGear.Auth({
        name: 'persona',
        type: 'Persona',
        settings: {
            verificationEndpoint: "http://127.0.0.1:3000/authenticate"
        }
    }).modules.persona;

    persona.logout();
*/
AeroGear.Auth.adapters.Persona.prototype.logout = function() {
    navigator.id.logout();
};
