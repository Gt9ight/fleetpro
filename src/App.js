import Fleetform from "./components/fleetmananger/FleetForm";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import Home from "./components/home/Home";
import Customerprogress from "./components/customer/CustomerProgress";
import FleetList from "./components/tech/FleetList";
function App() {
  // const { currentUser } = useContext(AuthContext);

  // const ProtectedRoute = ({ children }) => {
  //   if (!currentUser) {
  //     return <Navigate to="/" />;
  //   }
  //   return children;
  // };


  return (
    <div >
      <BrowserRouter basename="/fleetpro">
        <Routes>
          <Route path="/">
            <Route index element={<Home />} />
            <Route path="/fleetform" element={<Fleetform/>} />
            <Route path="/customer" element={<Customerprogress/>}/>
            <Route path="fleetlist" element={<FleetList/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
