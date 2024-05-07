import { useState } from "react"
import { createAuthUserWithEmailAndPassword, createUserDocumentFromAuthForTechs} from "../../utilis/Firebase";
import { Link, useNavigate } from "react-router-dom";


const defaultFormFields = {
    displayName:'',
    TechID:'',
    email:'',
    password:'',
    confirmPassword:''
}

const TechSignupForm = () => {
    const [formFields, setFormFields] = useState(defaultFormFields);
    const {displayName, TechID, email, password, confirmPassword} = formFields;
    const navigate = useNavigate()

    console.log(formFields)

    const resetFormFields = () => {
        setFormFields(defaultFormFields)
    }
    const handleSubmit = async (event) => {
        event.preventDefault();

        if(password !== confirmPassword){
            alert('passwords do not match')
            return
        }

        try {
            const {user} = await createAuthUserWithEmailAndPassword(email, password);

            await createUserDocumentFromAuthForTechs(user, {displayName, TechID});
            resetFormFields();
            navigate('/fleetlist')


        }catch(error) {
            if(error.code === 'auth/email-already-in-use'){
                alert('Cannot create user, email already in use')
            }else{
             console.log('user creation encountered an error', error)
            }
        }
    }

    const handleChange = (event) => {
        const {name, value} = event.target
        setFormFields({...formFields, [name]: value})
    }
 return (
    <div className='form-container'>
        <div className='form-wrapper'>
            <span className='logo'>Ace Fleeting</span>
            <span className='title'>Tech Registration</span>
            <form onSubmit={handleSubmit}>
                <input type='text' required onChange={handleChange} name="displayName" value={displayName} placeholder='display name'/>
                <input type='number' required onChange={handleChange} name="TechID" value={TechID} placeholder='Tech Number'/>
                <input type='email' required onChange={handleChange} name="email" value={email} placeholder='email'/>
                <input type='password' required onChange={handleChange} name="password" value={password} placeholder='password'/>
                <input  type='password' required onChange={handleChange} name="confirmPassword" value={confirmPassword} placeholder="Confirm Password"/>
                <button>Sign up</button>
            </form>
            <p>You do have an account? <Link to='/techniciansignin '>Login</Link></p>
        </div>
    </div>
  )
}

export default TechSignupForm