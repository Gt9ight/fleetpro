import { onAuthStateChanged } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth } from "../../utilis/Firebase";

export const AuthContext = createContext()

export const AuthContextProvider = ({children}) => {
    const [currentUser, setCurrentUSer] = useState({})

    useEffect(() => {
       const unsub = onAuthStateChanged(auth,(user) =>{
            setCurrentUSer(user)
            console.log(user)
        });


        return() =>{
            unsub()
        }    
    }, []);
    return(
    <AuthContext.Provider value={{currentUser}}>
        {children}
    </AuthContext.Provider>
    )
}