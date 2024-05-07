import {BrowserRouter ,Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home/Home";
import FleetList from "./components/tech/FleetList";
import FleetForm from "./components/fleetmanager/Fleetform";
import Customerprogress from "./components/customer/CustomerProgress";
import CustomerSignInForm from "./components/customer/CustomerSignin";
import { AuthContext } from "./components/context/AuthContext";
import { useContext } from "react";
import FleetmanagerSignInForm from "./components/fleetmanager/Fleetmanagersignin";
import TechSignInForm from "./components/tech/Techsignin";
import TechSignupForm from "./components/tech/Techsignup";
import CustomerSignupForm from "./components/customer/CustomerSignup";
import FleetManagerSignupForm from "./components/fleetmanager/Fleetmanagersignup";
function App() {

  const {currentUser} = useContext(AuthContext)
  

  const ProtectedRoute = ({children}) =>{
    if(!currentUser){
      return <Navigate to='/'/>
    }

    return children
  }
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/">
          <Route index element={<Home />} />
          <Route path="/customersignin" element={<CustomerSignInForm />} />
          <Route path="/customersignup" element={<CustomerSignupForm />} />
          <Route path="/fleetmanagersignin" element={<FleetmanagerSignInForm/>}/>
          <Route path="/fleetmanagersignup" element={<FleetManagerSignupForm/>}/>
          <Route path="/techsignup" element={<TechSignupForm />}/>
          <Route path="/techniciansignin" element={<TechSignInForm/>}/>
          <Route path="/fleetform" element={<ProtectedRoute><FleetForm /></ProtectedRoute>}/>
          <Route path="/customer" element={<ProtectedRoute><Customerprogress/></ProtectedRoute>}/>
          <Route path="fleetlist" element={<ProtectedRoute><FleetList/></ProtectedRoute>}/>
        </Route>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
