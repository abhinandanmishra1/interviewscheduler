import { useState, useEffect, useRef } from "react";
import { db } from "./firebase-config";
import { Multiselect } from "multiselect-react-dropdown";
import moment from "moment";
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
const UpdateInterview = () => {
	const userCollectionRef = collection(db, "users");

	const [interviews, setInterviews] = useState([]);
	const interviewCollectionRef = collection(db, "interviews");
	const [users, setUsers] = useState([]);
	const selectedUsers = useRef([]);
	const startTime = useRef();
	const endTime = useRef();
	const date = useRef();
  const [possible, setPossible] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const interviewName = useRef("");
  const [interviewId,setInterviewId]=useState("");
  const [intialMails,setInitialMails]=useState([]);
  // this function is to set already present values in the interview
  const setAttributes=async(interview)=>{
    console.log(interview)
    interviewName.current.value=interview.name;
    startTime.current.value=interview.start;
    endTime.current.value=interview.end;
    date.current.value=interview.date
    selectedUsers.current.getSelectedItems().forEach((user)=>{
      setInitialMails(intialMails=>[...intialMails,user.mail]);
    })
    const interviewData = query(
      collection(db, "interviews"),
     where("date", "==", date.current.value),
     where("startTime","==",startTime.current.value),
     where("endTime","==",endTime.current.value)
   );
   console.log(date.current.value,startTime.current.value,endTime.current.value)
   const docSnap = await getDocs(interviewData);

   console.log(docSnap)
   docSnap.forEach((document) => {
     setInterviewId(document.id);
      console.log("set id")
   });
  }

  useEffect(() => {
		const getUsers = async () => {
			const data = await getDocs(userCollectionRef);
			const user = data.docs.map((doc) => ({ ...doc.data() }));
			setUsers(user);
		};
		getUsers();

	}, []);

	useEffect(() => {
		const getInterviews = async () => {
			const data = await getDocs(interviewCollectionRef);
			setInterviews(data.docs.map((doc) => ({ ...doc.data() })));
		};
		getInterviews();
	}, []);
  //pasted
  
  const updateInterview=async (id, updatedInterview) => {
    if(id===""){
      setPossible(false);
      setErrorMessage("Please select any interview to update");
      setTimeout(() => {
        setPossible(true);
        setErrorMessage("");
      }, 2000);
      return;
    }
		const interrviewRef = doc(db, "interviews", id);
		await updateDoc(interrviewRef, updatedInterview);
    console.log("Data Updated")
	};
  // interview component
  const update=async()=>{
    const mailsOfSelectedUsers=[];
    const start = startTime.current.value;
		const end = endTime.current.value;
		const interview = interviewName.current.value;
		const interviewDate = date.current.value;
    selectedUsers.current.getSelectedItems().forEach((user) => {
      const scheduled=user.scheduledInterviews;
      let elig=true;
      mailsOfSelectedUsers.push(user.email);
      scheduled.forEach((value)=>{
        
        const startTime=value.startTime;
        const endTime=value.endTime;
        const date=value.date;
        if(date===interviewDate && ((start>=startTime && start<=endTime) || (end>=startTime && end<=endTime))){
          setPossible(false);
          setErrorMessage("Hey "+user.name+" is not available for the given time slot");
          elig=false;
          if(mailsOfSelectedUsers[mailsOfSelectedUsers.length-1]===user.email){
            mailsOfSelectedUsers.pop();
          }
          setTimeout(() => {
            setPossible(true);
            setErrorMessage("");
          }, 2000);
          return false;
        }
      })
      
      
      return elig;
    });
    if (interview === "" || start === "" || end === "") {
			setPossible(false);
			setErrorMessage("All Fields are Required!");
			setTimeout(() => {
				setPossible(true);
				setErrorMessage("");
			}, 5000);
			return;
		}
		const todayDate = moment().date();
		const todayYear = moment().year();
		const todayMonth = moment().month() + 1;

		var compareStringDate =
			todayYear +
			"-" +
			(todayMonth < 10 ? "0" : "") +
			todayMonth +
			"-" +
			(todayDate < 10 ? "0" : "") +
			todayDate;
		if (interviewDate < compareStringDate) {
			setPossible(false);
			setErrorMessage("This date has been passed");
			setTimeout(() => {
				setPossible(true);
				setErrorMessage("");
			}, 5000);
			return;
		}

		if (interviewDate === compareStringDate) {
			const currentTime = moment().format("HH:mm");
			if (currentTime < start || currentTime < end) {
				setPossible(false);
				setErrorMessage("This Time has been passed");
				setTimeout(() => {
					setPossible(true);
					setErrorMessage("");
				}, 5000);
				return;
			}
		}
		// console.log(start, end);
		if (start >= end) {
			setPossible(false);
			setErrorMessage("Start time must be smaller than End time");
			setTimeout(() => {
				setPossible(true);
				setErrorMessage("");
			}, 5000);
			return;
		}
    setTimeout(() => {
			if (mailsOfSelectedUsers.length <= 1) {
				setPossible(false);
				setErrorMessage("Select atleast two partcipants for an interview");
				setTimeout(() => {
					setPossible(true);
					setErrorMessage("");
				}, 5000);
				return;
			}
		}, 5000);

    setTimeout(async() => {
			if(mailsOfSelectedUsers.length>1){
    const updatedInterview={
      startTime:startTime.current.value,
      endTime:endTime.current.value,
      users:mailsOfSelectedUsers,
      name:interviewName.current.value,
      date:date.current.value
    }
    console.log(updatedInterview)
		updateInterview(interviewId, updatedInterview);
  }
	}, (10000));
  }
  const InterviewItem = (props) => {
    return (
      <div className='cursor-pointer' onClick={()=>setAttributes(props)}>{props.name}</div>
    )
  }
	return (
		<div className="flex w-full">
			<div className="w-1/3 flex justify-center flex-col items-center">
				<h1 className=" font-extrabold mb-2">Update Interview</h1>
				{interviews.map((interview) => {
					return (
						<InterviewItem
              className="cursor-pointer"
							users={interview.users}
							name={interview.name}
							date={interview.date}
							start={interview.startTime}
							end={interview.endTime}

						/>
					);
				})}
			</div>
			<div className="w-2/3 flex justify-center flex-col items-center">
				<div className="flex  m-4">
					<label className="mr-4 font-semibold" htmlFor="name">
						Name of Interview
					</label>
					<input
						ref={interviewName}
						className="outline-none border-b-2 border-gray-400 w-1/2"
						type="text"
						placeholder="Enter Name of Interview"
						name="name"
					/>
				</div>
				<div className="flex  m-4">
					<label className="mr-4 font-semibold" htmlFor="date">
						Date
					</label>
					<input ref={date} type="date" name="date" />
				</div>
				<div className="flex  m-4">
					<label className="mr-4 font-semibold" htmlFor="startTime">
						Start Time
					</label>
					<input ref={startTime} type="time" name="startTime" />
				</div>
				<div className="flex  m-4">
					<label className="mr-4 font-semibold" htmlFor="endTime">
						End Time
					</label>
					<input ref={endTime} type="time" name="endTime" />
				</div>
				<div className="flex  m-4">
					<label className="mr-4 font-semibold" htmlFor="users">
						Select Users 
					</label>
					<Multiselect
          placeholder="Select Users Again"
						options={users}
						ref={selectedUsers}
						displayValue="name"
					/>
				</div>
        <div className="flex justify-center w-2/3">
				<button
					className="bg-[#2c76d6] text-white rounded-lg p-2 m-2 font-semibold text-md"
					onClick={
						()=>{
              update();
            }
					}>
					Update Interview
				</button>
			</div>
			{!possible && <div className="text-red-600 ">{errorMessage}</div>}

			</div>
      
		</div>
	);
};

export default UpdateInterview;
