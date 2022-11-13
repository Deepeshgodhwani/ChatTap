const passport = require('passport');

const localStrategy = require('passport-local').Strategy;

const User= require('../models/user')


passport.use( new localStrategy({
    usernameField : 'email',
    passReqToCallback: true
},
async function(req,email, password, done){     
       let user= await User.findOne({email:email});   
         if(user){
            const check= await user.matchPassword(password);
            if(!check){
                 return done(null , false);    
            }

            return done(null,user);
        }else{
            return done(null , false);    
        }      
}
));

//serializing the user to decide which key is to be kept in the cookies//


passport.serializeUser(function(user,done){

       return done(null , user.id);

})


//deserializing the user from the key in the cookies//

passport.deserializeUser(function(id, done){
     User.findById(id, function(err, user){
         if(err){

            console.log('ERROR IN FINDING USER ---> PASSPORT');
             return done(err);
             
         }
         return done(null, user);
     });
});

//check if the user is authenticated //
passport.checkAuthenticatedUser= function(req ,res ,next)
{
    if(req.isAuthenticated())
    {
         return next();
    }
    return res.redirect('/');
}

//

passport.setAuthenticatedUser= function(req , res , next){
   //req.user contains the correct signed in user from the session cookie  and we are just sending this 
   // to the locals for the veiws//
    if(req.isAuthenticated()){
         res.locals.user= req.user;
    }

    next();
}

module.exports= passport;