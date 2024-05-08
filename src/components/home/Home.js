import React, { useEffect, useState } from "react";
import InfoCards from "./InfoCards";
import { Link } from "react-router-dom";
import './home.css'

const Home = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768); 
        };

        handleResize();


        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="menu-container">
            <h1 className="title">WELCOME TO YOUR FLEET MANAGER</h1>
            {!isMobile && <InfoCards />}
            <div className="fleet-checker">
                <div className="fleet-checkerbutton" to='/fleetmanagersignin' >Fleet Checker</div>
            </div>
            <div className="fleet-customer">
                <div className="fleet-checkerbutton" to='/customersignin' >Customer</div>
            </div>
            <div className="technician">
                <div className="technicianbutton" to='/techniciansignin'>Technician</div>
            </div>
        </div>
    )
}

export default Home;