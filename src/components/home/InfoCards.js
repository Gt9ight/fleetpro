import './infocards.css'

const InfoCards = () =>{
    return(
        <div className="cardsContainer">
            <div className="card">
                <h1>Manage</h1>
                <div className='card-content'>
                    <p>                    
                    Our app empowers fleet managers with data analytics and real-time tracking, enhancing maintenance, compliance, and overall efficiency. With its user-friendly interface, it simplifies fleet management, leading to increased productivity and reduced costs. A vital tool for modern logistics, it elevates decision-making and asset coordination, revolutionizing fleet management.
                    </p>
                    </div>
            </div>

            <div className="card">
                <h1>Complete</h1>
                <div className='card-content'>
                <p>Our user-friendly interface simplifies task completion and information sharing for technicians. They can quickly update job statuses and input data with ease, saving time and promoting transparency in fleet management. Our app ensures a seamless process for technicians, allowing them to focus on their core tasks.
                </p>
                </div>
            </div>

            <div className="card">
                <h1>Fleet-Managers</h1>
                <div className='card-content'>
                <p>Our innovative app simplifies creating comprehensive fleet sheets with essential features. It helps catalog critical data like wheel positions, work details, unit ID, and urgency. This streamlined approach enhances maintenance tracking, safety, and compliance efforts, making fleet management more advanced and effective.
                </p>
                </div>
            </div>


            <div className="card">
                
                <h1>Records</h1>
                <div className='card-content'>
                <p>Our app maintains comprehensive records of past fleets, benefiting customers and vendors. It allows easy access to historical data for reviewing transactions, services, and maintenance. Customers can budget and make decisions based on this history, while vendors can ensure accurate invoicing and build trust with clients. Our app serves as a valuable reference point for all fleet management stakeholders.
                </p>
                </div>
            </div>
        </div>
    )
}

export default InfoCards;