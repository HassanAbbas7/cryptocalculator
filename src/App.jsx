import { useState, Link } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { getData } from '../components/constants'
import Index from '../pages'

function App() {
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const [loggedin, setLoggedin] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    getData(username, password).then((data)=>{
      setLoggedin(data)
    })
  }


  return (
    <>
    <Index username="hassan" password="123" />
    {/* {loggedin ? <Index username={username} password={password} /> : <form>
  <div className="form-group my-3">
    <label htmlFor="exampleInputEmail1">Username</label>
    <input type="text" className="form-control" value={username} onChange={(e)=>{setUsername(e.target.value)}} id="exampleInputEmail1" aria-describedby="usernameHelp" placeholder="Enter username" />
    <small id="usernameHelp" className="form-text text-muted">Username provided by your Admin</small>
  </div>
  <div className="form-group my-3">
    <label htmlFor="exampleInputPassword1">Password</label>
    <input type="password" value={password} onChange={(e)=>{setPassword(e.target.value)}} className="form-control" id="exampleInputPassword1" placeholder="Password" />
  </div>
  <button type="submit" className="btn btn-primary" onClick={handleSubmit}>Submit</button>
</form>
} */}
    </>
  )
}

export default App
