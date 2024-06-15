const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const session = require("express-session");
const userModel = require("./models/userModel");
const todoModel = require("./models/todoModel");
const mongodbSession = require("connect-mongodb-session")(session);
const bcrypt = require("bcrypt");
const validator = require("validator");
const cors = require('cors');

//files
const { cleanUpAndValidate } = require("./utiles/authUtile");
const { isAuth } = require("./middlewares/authMiddleware");
const { validateToDo } = require("./utiles/todoUtile");

//constatns
const app = express();
const PORT = process.env.PORT || 8000;
const store = new mongodbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

//middlewares
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    cookie:{maxAge:1000*60*60*24},
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//mongodb connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));


app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Registration Api
app.post("/register", async (req, res) => {
  const { name, email, password, username } = req.body;
 
  console.log(req.body)
  //Data Validation
  try {
    await cleanUpAndValidate(req.body);
  } catch (err) {
    return res.send({
      status: 400,
      error: err,
    });
  }

  try {
    //Email and Username should not be there in database already
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return res.send({
        status: 400,
        message: "Email already exists",
      });
    }
    const isUsernameExist = await userModel.findOne({ username });
    if (isUsernameExist) {
      return res.send({
        status: 400,
        message: "Username already exists",
      });
    }
    //Password hashing
    const hashPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT)
    );

    //create user in db
    const userObj = new userModel({
      name: name,
      email: email,
      password: hashPassword,
      username: username,
    });

    //make entry in db
    const userdb = await userObj.save();
    return res.send({
        status:201,
        message:'User register successfully',
        data:userObj
    })

  } catch (err) {
    console.log(err);
    return res.send({
      status: 500,
      message: "Database error",
      error: err,
    });
  }
});


//Login Api
app.post('/login',async(req,res)=>{
  const{loginId,password} = req.body;

  //Data Validation
  if(!loginId || !password){
     return res.send({
         status:400,
         message:"Please enter loginId and password"
     })
  }
  try{
     let user={};

     //checking whether loginId is email or username and it is present in Db or not
     if(validator.isEmail(loginId)){
         //Email
         user = await userModel.findOne({email:loginId});
     }
     else{
         //Username
         user = await userModel.findOne({username:loginId});
     }

     //if loginId is not present in db 
     if(!user){
         return res.send({
             status:400,
             message:"User not found"
         })
     }
  
     //password comparision
     const isMatch = await bcrypt.compare(password,user.password);

     //if password is not matched
     if(!isMatch){
         return res.send({
             status:400,
             message:"Invalid password"
         })
     }
     //session based Auth
     req.session.isAuth=true;
     req.session.user={
         userID:user._id,
         username:user.username,
         email:user.email,
     };
     
  
     return res.send({
         status:200,
         message:"User login successfully",
         data:user
     })
  }
  catch(err){
     return res.send({
         status:500,
         message:"Database error",
         error:err
     })
  }

});

//Add todo route
app.post('/add-todo',isAuth,async(req,res)=>{

  //username and todo from req
  const {todoText} = req.body;
  const userId = req.session.user.userId;
  
  console.log(todoText)

  //Todo validation 
  try{
      const validate = await validateToDo(todoText);
  }catch(err){
      return res.send({
          status:400,
          error:err
      })
  }
  //save todo in db
  const todoObj = new todoModel({
      todo:todoText,
      userId:userId,
      status:"Pending"
  });

  try{
     const todoDb = await todoObj.save();
      return res.send({
          status:201,
          message:"Todo created successfully",
           data:todoDb
      })
  }
  catch(err){ 
      return res.send({
          status:500,
          message:"Database error",
          error:err
      })
  }
})

//get todo
app.get('/get-todo',isAuth,async(req,res)=>{
  const userId = req.session.user.userId;
  console.log(userId)
  try{
    const todos = await todoModel.findById({userId:userId});
    res.send({
      status:200,
      message:"success",
      data:todos
    })
  }
  catch(err){
    res.send({
      status:500,
      error:err
    })
  }
})
//update status on action
app.post('/update-status',isAuth,async(req,res)=>{
  const {id,action}= req.body;
  const userId= req.session.user.userId
  
  console.log(userId)
  try{
    const todo = await todoModel.findOne({_id:id ,userId:userId})
    
    if(!todo){
      res.send({
        status:404,
        message:"Todo not found",
      })
    }
    switch (action) {
      case 'start':
        await todoModel.findOneAndUpdate({_id:id},{status:"Ongoing"});
        break;
      case 'end':
        await todoModel.findOneAndUpdate({_id:id},{status:"Completed"});
        break;
      case 'resume':
        await todoModel.findOneAndUpdate({_id:id},{status:"Ongoing"});
        break;
      case 'pause':
        await todoModel.findOneAndUpdate({_id:id},{status:"Pending"});
        break;
      default:
          return res.status(400).send('Invalid action');
  }
  res.send({
    status:200,
    message:"Todo updated successfully",
  })
  }
  catch(error){
   res.send({
     status:500,
     message:"Database error",
     error:error 
   })
  }

})

//delete todo route
app.post("/delete-todo", isAuth, async (req, res) => {
  //todoId
  const { id } = req.body;

  //data validation

  if (!id) {
    return res.send({
      status: 400,
      message: "Missing credentials",
    });
  }

  //find the todo from db

  try {
    const todoDb = await todoModel.findOne({ _id: id });
    if (!todoDb) {
      return res.send({
        status: 400,
        message: "Todo not found",
      });
    }

    //check ownership
    if (todoDb.username !== req.session.user.username) {
      return res.send({
        status: 401,
        message: "Not allowed to delete, authorization failed",
      });
    }

    //update the todo in DB
    const todoPrev = await todoModel.findOneAndDelete({ _id: id });

    return res.send({
      status: 200,
      message: "Todo deleted successfully",
      data: todoPrev,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
