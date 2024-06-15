import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios  from 'axios';

const Login = () => {
  
    const [loginData, setLoginData] = useState({loginId :"",password:""});
    const navigate = useNavigate();
    
    //handle form data
    function handleChange(e){
        setLoginData({...loginData,[e.target.name]:e.target.value})
    }
   
    //login with user data
    async function handleClick(e){
        e.preventDefault()
        console.log(loginData)
       try{
          const res = await  axios.post('http://localhost:8000/login', loginData)
          console.log(res.data)
          if(res.data.status===200)
            {
              localStorage.setItem('token', res.data.data._id);
              navigate('/');
            }
            else{
              alert(res.data.message)
            }
          
       }
       catch(err){
        console.log(err)
       }
    }

  return (
    <div>
        <div className='navbar'>
        <h2>Todo<span style={{color:"tomato"}}>App</span></h2>
        <div>
            <Link to={'/'}>Home</Link>
            <Link to={'/login'}>Login</Link>
            <Link to={'/signup'}>Signup</Link>
        </div>
        </div>
      {/* Login form */}
      <div className='loginCard'>
       <form >
        <h1>Login</h1>
        <input type='text' placeholder='Enter Your LoginId' name='loginId'  onChange={handleChange}/>
        <input type='text' placeholder='Enter Your Password' name='password'onChange={handleChange} />
        <button className='btn' onClick={handleClick}>Login</button>
        <p>Don't have an account ?<Link to={'/signup'} style={{color:'red',fontSize:'16px'}}> Register here</Link></p>
       </form>
      </div>
    </div>
  )
}

export default Login
