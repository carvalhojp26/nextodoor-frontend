import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Home } from "./pages/home"
import { Login } from "./pages/login"
import TasksPage from "./pages/tasksPage"
import { AdminDashboard } from "./pages/AdminDashboard"
import { AdminUsers } from "./components/dashboard/pages/AdminUser"
import { AdminProduct } from "./components/dashboard/pages/AdminProduct"
import { AdminCategory } from "./components/dashboard/pages/AdminCategory"
import { AdminReport } from "./components/dashboard/pages/AdminReport"
import { AdminEstablishments } from "./components/dashboard/pages/AdminEstablishments"
import { AdminTask} from "./components/dashboard/pages/AdminTask"
import { UserProduct} from "./pages/User/UserProduct"

function App() {

  	return (
    	<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />}></Route>
				<Route path="/login" element={<Login />}></Route>
				<Route path="/tasks" element={<TasksPage />}></Route>
				<Route path="/admin" element={<AdminDashboard />}></Route> 
				<Route path="/admin-user" element={<AdminUsers />} />
				<Route path="/admin-product" element={<AdminProduct />} />
				<Route path="/task-categories" element={<AdminCategory />} />
				<Route path="/reports" element={<AdminReport />} />
				<Route path="/admin-establishments" element={<AdminEstablishments />} />
				<Route path="/admin-task" element={<AdminTask />} />
				<Route path="/user-product" element={<UserProduct />} />

			</Routes>
    	</BrowserRouter>
  	)
}

export default App
