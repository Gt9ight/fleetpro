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
                <Link className="fleet-checkerbutton" to='/fleetform' >Fleet Checker</Link>
            </div>
            <div className="fleet-customer">
                <Link className="fleet-checkerbutton" to='/customer' >Customer</Link>
            </div>
            <div className="technician">
                <Link className="technicianbutton" to='/fleetlist'>Technician</Link>
            </div>
        </div>
    )
}

export default Home;
