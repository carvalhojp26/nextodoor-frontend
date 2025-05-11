import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Home } from "./pages/home"
import { Login } from "./pages/login"
import TaskCreated from "./pages/taskCreatedPage"
import TaskRealization from "./pages/taskRealizationPage"
import Notification from "./pages/notificationPage"

function App() {

  	return (
    	<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route path="/tasksCreated" element={<TaskCreated />}></Route>
				<Route path="/tasksRealization" element={<TaskRealization />}></Route>
				<Route path="/notifications" element={<Notification />}></Route>
			</Routes>
    	</BrowserRouter>
  	)
}

export default App
