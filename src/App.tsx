import { BrowserRouter, Routes, Route } from "react-router-dom"
import PrivateRoute from './auth/privateRoute'
import { Home } from "./pages/home"
import { Login } from "./pages/login"
import { Register } from "./pages/register"

function App() {

  	return (
    	<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route path="/register" element={<Register/>}></Route>
			</Routes>
    	</BrowserRouter>
  	)
}

export default App
