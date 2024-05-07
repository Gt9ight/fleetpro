import { useState } from "react"
import { createAuthUserWithEmailAndPassword, createUserDocumentFromAuthForCustomers} from "../../utilis/Firebase";
import { Link, useNavigate } from "react-router-dom";


const defaultFormFields = {
    displayName:'',
    CompanyName:'',
    email:'',
    password:'',
    confirmPassword:''
}

const CustomerSignupForm = () => {
    const [formFields, setFormFields] = useState(defaultFormFields);
    const {displayName, CompanyName, email, password, confirmPassword} = formFields;
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

            await createUserDocumentFromAuthForCustomers(user, {displayName, CompanyName});
            resetFormFields();
            navigate('/customer')


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
            <span className='title'>Customer Registration</span>
            <form onSubmit={handleSubmit}>
                <input type='text' required onChange={handleChange} name="displayName" value={displayName} placeholder='display name'/>
                <input type='text' required onChange={handleChange} name="CompanyName" value={CompanyName} placeholder='Company name'/>
                <input type='email' required onChange={handleChange} name="email" value={email} placeholder='email'/>
                <input type='password' required onChange={handleChange} name="password" value={password} placeholder='password'/>
                <input  type='password' required onChange={handleChange} name="confirmPassword" value={confirmPassword} placeholder="Confirm Password"/>
                <button>Sign up</button>
            </form>
            <p>You do have an account? <Link to='/customersignin '>Login</Link></p>
        </div>
    </div>
  )
}

export default CustomerSignupForm