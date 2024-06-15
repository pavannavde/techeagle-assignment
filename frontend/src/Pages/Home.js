import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [todo,setTodo] =useState({todoText:""})
  const navigate = useNavigate();

  //handle todo
  function handleChange(e){
    setTodo({...todo,[e.target.name]:e.target.value})
  }
 
  //add todo
  async function handleClick(e){
    try{
      const res = await axios.post('http://localhost:8000/add-todo',todo)
      console.log(res)
    }
    catch(err){
      console.log(err)
    }
  }
   async function getTodo(){
    try{
      const res = await axios.get('http://localhost:8000/get-todo');
      console.log(res.data)
    }
    catch(err){
      console.log(err)
    }
   }
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
    else{
      getTodo()
    }
  }, []);

  return (
    <div className="home">
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
      <div className="inputDiv">
        <input type="text" placeholder="Add a Activity" onChange={handleChange}  name="todoText"/>
        <button onClick={handleClick}>Add</button>
      </div>
      <div className="list">
        <table>
          <thead>
            <tr>
              <td>Serial No.</td>
              <td>Activity</td>
              <td>Duration</td>
              <td>Action</td>
              <td>Status</td>
            </tr>
          </thead>
          <tbody>
            {

            }
            <tr>
              <td>1</td>
              <td>1</td>
              <td>1</td>
              <td>1</td>
              <td>1</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
