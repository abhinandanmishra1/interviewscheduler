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
  
  const interviewName=useRef('');
  const [possible, setPossible] = useState(true);
  useEffect(() => {
		const getUsers = async () => {
			const data = await getDocs(userCollectionRef);
      const user=data.docs.map((doc) => ({ ...doc.data() }));
			setUsers(user); 
		};
		getUsers();
    
	}, []);
  const checkPossibilty=async()=>{
    const start=startTime.current.value;
    const end=endTime.current.value;
    const interview=interviewName.current.value;
    const usersSelected=[...selectedUsers.current.getSelectedItems()].map((user)=>user.email);
    const date=moment(start,'YYY-MM-DD HH:mm').format('MMM Do YY').toLocaleString();

    const newObject={
      name:interview,
      startTime:start,
      endTime:end,
      date:date,
      users:usersSelected
    }
    const docRef = await addDoc(collection(db, "interviews"), newObject);

    // adding this interview to each user scheduled interviews

    usersSelected.map(async(userMail)=>{
        const userData= query(collection(db,'users'),where('email','==',userMail));
        const docSnap =await getDocs(userData);
        docSnap.forEach(async(document) => {
            const newScheduledInterviews=[...document.data().scheduledInterviews,{startTime:start,endTime:end,interviewId:docRef.id}]; 
            console.log(document.id, " => ", document.data().scheduledInterviews,"=>",newScheduledInterviews);
            const DocRef = document(db, "users", document.id);
            await updateDoc(DocRef, {
              scheduledInterviews:newScheduledInterviews
          });
        });
    })
    // console.log(usersSelected);
  }
  return (
    <div className='w-1/2'>

     
        <div className='flex  m-4'>
        <label className='mr-4' htmlFor="name">Name of Interview</label>
        <input ref={interviewName} className='outline-none border-b-2 w-1/2' type="text" placeholder='Enter Name of Interview' name='name' />
        </div>
        <div className='flex  m-4'>
        <label className='mr-4' htmlFor="startTime">Start Time</label>
        <input ref={startTime} type="datetime-local" name='startTime' />
        </div>
        <div className='flex  m-4'>
        <label className='mr-4' htmlFor="endTime">End Time</label>
        <input ref={endTime} type="datetime-local"  name='endTime' />
        </div>
        <div className='flex  m-4'>
        <label className='mr-4' htmlFor="users">Select Users</label>
        {/* <select id="select-role" placeholder="Select roles..." className='w-full form-multiselect inline-block mt-1' multiple name="users" >
          {users.map((user, index) => {
          return (
            
              <option key={index} value={user.id}>{user.name}</option>
          
          );
			})}
        </select> */}

        <Multiselect options={users} ref={selectedUsers} displayValue="name"/>
        {/* {console.log(selectedUsers.current.props.options)} */}

        <button onClick={()=>{
          checkPossibilty()}}>Add Interview</button>
        </div>
      
    </div>
  )
}

export default CreateInterview