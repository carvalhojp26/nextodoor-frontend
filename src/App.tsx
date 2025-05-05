import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Home } from "./pages/home"
import { Login } from "./pages/login"

function App() {

  	return (
    	<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/login" element={<Login />}></Route>
			</Routes>
    	</BrowserRouter>
  	)
}

export default App
