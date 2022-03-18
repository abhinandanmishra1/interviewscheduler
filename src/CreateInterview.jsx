import {React,useState,useEffect,useRef} from 'react'
import {Multiselect} from "multiselect-react-dropdown";
import { db } from "./firebase-config";
import moment from 'moment';
import {
	collection,
	getDoc,
	getDocs,
	doc,
	updateDoc,
	addDoc,
  query,
  where,
} from "firebase/firestore";
const CreateInterview = () => {
  const [users, setUsers] = useState([]);
  const userCollectionRef = collection(db, "users");
  const selectedUsers = useRef([]);
  const startTime = useRef();
  const endTime = useRef();
  const date = useRef();
  
  const interviewName=useRef('');
  const [possible, setPossible] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  useEffect(() => {
		const getUsers = async () => {
			const data = await getDocs(userCollectionRef);
      const user=data.docs.map((doc) => ({ ...doc.data() }));
			setUsers(user); 
		};
		getUsers();
    
	}, []);
  const updateUser=async(id,newScheduledInterviews)=>{
    const userRef = doc(db, "users", id);
    const newField= {
      scheduledInterviews:newScheduledInterviews
};
    await updateDoc(userRef,newField);
  }
  const checkPossibilty=async()=>{
    const start=startTime.current.value;
    const end=endTime.current.value;
    const interview=interviewName.current.value;
    const usersSelected=[...selectedUsers.current.getSelectedItems()].map((user)=>user.email);
    const interviewDate=date.current.value;

    if(interviewDate<(new Date())){
        setPossible(false);
        setErrorMessage("This date is khatam! Tatat Bye bye !!");
        return;
    }
    const newObject={
      name:interview,
      startTime:start,
      endTime:end,
      date:interviewDate,
      users:usersSelected
    }
    const docRef = await addDoc(collection(db, "interviews"), newObject);

    // adding this interview to each user scheduled interviews

    usersSelected.map(async(userMail)=>{
        const userData= query(collection(db,'users'),where('email','==',userMail));
        const docSnap =await getDocs(userData);
        console.log(docSnap)
        docSnap.forEach((document) => {
            const newScheduledInterviews=[...document.data().scheduledInterviews,{startTime:start,endTime:end,interviewId:docRef.id}]; 
            console.log(document.id, " => ", document.data().scheduledInterviews,"=>",newScheduledInterviews);
            
          updateUser(document.id,newScheduledInterviews);
        });
    })
    // console.log(usersSelected);
  }
  return (
    <div className='w-1/2'>

     
        <div className='flex  m-4'>
        <label className='mr-4 font-semibold' htmlFor="name">Name of Interview</label>
        <input ref={interviewName} className='outline-none border-b-2 border-gray-400 w-1/2' type="text" placeholder='Enter Name of Interview' name='name' />
        </div>
        <div className='flex  m-4'>
        <label className='mr-4 font-semibold' htmlFor="date">Date</label>
        <input ref={date} type="date" name='date' />
        </div>
        <div className='flex  m-4'>
        <label className='mr-4 font-semibold' htmlFor="startTime">Start Time</label>
        <input ref={startTime} type="time" name='startTime' />
        </div>
        <div className='flex  m-4'>
        <label className='mr-4 font-semibold' htmlFor="endTime">End Time</label>
        <input ref={endTime} type="time"  name='endTime' />
        </div>
        <div className='flex  m-4'>
        <label className='mr-4 font-semibold' htmlFor="users">Select Users</label>
        <Multiselect options={users} ref={selectedUsers} displayValue="name"/>
        </div>
        <div className='flex justify-center w-2/3'>
        <button className="bg-[#2c76d6] text-white rounded-lg p-2 m-2 font-semibold text-md" onClick={()=>{
          checkPossibilty()}}>Add Interview</button>
        </div>
      
    </div>
  )
}

export default CreateInterview