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
import SelectedUser from './SelectedUser';
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
const getDateString=(timeStamp)=>{
    let dateObj = new Date(timeStamp * 1000);
            let hours = dateObj.getUTCHours();
            let minutes = dateObj.getUTCMinutes();
            let seconds = dateObj.getSeconds();
            let timeString = hours.toString().padStart(2, '0')
                + ':' + minutes.toString().padStart(2, '0')
                + ':' + seconds.toString().padStart(2, '0');
    return timeString
  }
  return (
      
    <div className='w-2/3 border h-full rounded-lg bg-[#00BABE] text-white cursor-pointer flex justify-center items-center'>
        {
            visible && 
        <div className='h-40 flex flex-col items-center justify-center'>
            <h1 className='text-lg text-white text-center font-bold '>{props.name}</h1>
            <p>at {props.date}</p>
        </div>
        }
        {!visible && <div className='h-40  rounded-t-lg flex flex-col items-center'>
            
            <div className='h-5/6 flex flex-col items-center w-5/6'>
                <div className='flex justify-center text-xl h-1/6 font-bold'>
                    Users
                </div>
                <div className='flex justify-between flex-wrap h-1/3 w-full'>{
                    users.map((user)=>{
                        return <SelectedUser user={user}/>
                    })
                }</div>
            </div>
            <div className='text-md h-1/6 font-bold'>
                Starts at {getDateString(props.start)} and ends at {getDateString(props.end)}
            </div>
        </div>}

        <button className="bg-[#2c76d6] text-white rounded-lg p-2 m-2 font-semibold text-md" onClick={()=>{setVisibility(!visible)}}>{visible?<>See Details</>:<>Hide Details</>}</button>
        
        
    </div>
  )
}

export default Interview