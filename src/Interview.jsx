import React from 'react'
import { useState,useEffect } from 'react';
import { db } from "./firebase-config";
import {
	getDoc,
	doc,
    query,
    collection,
    where,
    getDocs,
} from "firebase/firestore";
const Interview = (props) => {
    const [users, setUsers] = useState([]);
    const [visible,setVisibility]=useState(true);
    useEffect(() => {
        setUsers([]);
        props.users.map(async(userMail)=>{
            const userData= query(collection(db,'users'),where('email','==',userMail));
        const docSnap =await getDocs(userData);
        docSnap.forEach((doc) => {
            const user=doc.data();
            setUsers(users=>[...users,{name:user.name,email:user.email}])
          });
    })
    }, []);
  return (
      
    <div className='md:w-96 sm:w-80 w-64 ml-2 mt-2 border h-full rounded-lg bg-[#00BABE] text-white flex flex-col justify-center items-center'>
        {
            visible && 
        <div className='h-40 w-full flex flex-col items-center justify-center'>
            <h1 className='text-lg text-white text-center font-bold '>{props.name}</h1>
            <p>on {props.date}</p>
        </div>
        }
        {!visible && <div className='h-40 w-full rounded-t-lg flex flex-col items-center'>
            
            <div className='h-5/6 flex flex-col items-center w-5/6'>
                <div className='flex justify-center items-center text-xl h-1/3 font-bold'>
                    Users
                </div>
                <div className='flex flex-col justify-center items-center h-2/3 w-full mt-2'>{
                    users.map((user)=>{
                        return <h1 className='ml-2'>{user.name}</h1>
                    })
                }</div>
            </div>
            <div className='text-md h-1/6 font-bold'>
                Starts at {props.start} and ends at {props.end}
            </div>
        </div>}

        <button className="bg-[#2c76d6] text-white rounded-lg p-2 m-2 font-semibold text-md hover:-translate-y-1" onClick={()=>{setVisibility(!visible)}}>{visible?<>See Details</>:<>Hide Details</>}</button>
        
        
    </div>
  )
}

export default Interview