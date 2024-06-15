import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import  axios  from 'axios';

const Signup = () => {
  const [user, setUser] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
 const navigate = useNavigate();

 //handle form data 
  function handleChange(e) {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  }
  //post the user data 
  async function handleClick(e) {
    e.preventDefault();
    console.log(user);
    try{
      const res=await axios.post('http://localhost:8000/register',user);
      console.log(res.data);
      if(res.data.status===201){
        alert(res.data.message)
        navigate('/login')
      }
      else{
        alert(res.data.error)
      }
    }
    catch(err){
      console.log(err);
    }
  }



  return (
    <div>
      <div className="navbar">
        <h2>
          Todo<span style={{ color: "tomato" }}>App</span>
        </h2>
        <div>
          <Link to={"/"}>Home</Link>
          <Link to={"/login"}>Login</Link>
          <Link to={"/signup"}>Signup</Link>
        </div>
      </div>
      <div className="loginCard">
        <form>
          <h1>SignUp</h1>
          <input
            type="text"
            placeholder="Enter Your Username"
            name="username"
            onChange={handleChange}
          />
          <input type="text" placeholder="Enter Your Name" name="name"  onChange={handleChange}/>
          <input type="text" placeholder="Enter Your Email" name="email" onChange={handleChange}/>
          <input
            type="text"
            placeholder="Enter Your Password"
            name="password"
            onChange={handleChange}
          />
          <button className="btn" onClick={handleClick}>
            Sign Up
          </button>
          <p>
            Already have an account ?
            <Link to={"/login"} style={{ color: "red", fontSize: "16px" }}>
              {" "}
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
