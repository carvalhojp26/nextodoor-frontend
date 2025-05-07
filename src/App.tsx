import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Home } from "./pages/home"
import { Login } from "./pages/login"
import TasksPage from "./pages/tasksPage"

function App() {

  	return (
    	<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route path="/tasks" element={<TasksPage />}></Route>
			</Routes>
    	</BrowserRouter>
  	)
}

export default App
