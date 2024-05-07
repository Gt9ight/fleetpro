import { useState } from "react"
import { signInWithGooglePopup, signInAuthUserWithEmailAndPassword, createUserDocumentFromAuthForTechs } from "../../utilis/Firebase";
import { useNavigate, Link } from "react-router-dom";



const defaultFormFields = {
    email:'',
    password:''
}

const TechSignInForm = () => {
    const [formFields, setFormFields] = useState(defaultFormFields);
    const {email, password} = formFields;
    const navigate = useNavigate()

    console.log(formFields)

    const resetFormFields = () => {
        setFormFields(defaultFormFields)
    }


    const signInWithGoogle = async() => {
        const {user} = await signInWithGooglePopup();
        await createUserDocumentFromAuthForTechs(user)
        navigate('/fleetlist')
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        


    try {
        const response = await signInAuthUserWithEmailAndPassword(email, password)
        console.log(response)
    resetFormFields();
    navigate('/fleetlist')
    }catch(error) {
    switch(error.code){
        case 'auth/wrong-passwoird':
            alert('incorrect password for email')
            break
            case'auth/user-not-found':
            alert('no user associated with this email');
            break;
            default:
            console.log(error)
        }
    }
    }

    const handleChange = (event) => {
        const {name, value} = event.target
        setFormFields({...formFields, [name]: value})
    }
    return (
        <div className='signinform-container'>
            <div className='form-wrapper'>
                <span className='logo'>Ace Fleeting</span>
                <span className='title'>Technician Login</span>
                <form onSubmit={handleSubmit}>
                    <input type='email' required onChange={handleChange} name="email" value={email} placeholder='email'/>
                    <input type='password' required onChange={handleChange} name="password" value={password} placeholder='password'/>
                    <button>Sign in</button>
                    <button onClick={signInWithGoogle}>Sign in with Google</button>
                </form>
                <p>You dont have an account? <Link to='/techsignup'>Register</Link></p>
            </div>
        </div>
      )
    }

export default TechSignInForm