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
  const [initialMails,setInitialMails]=useState([]);

  const [waiting,setWaiting]=useState(false);
  const [success,setSuccess]=useState(false);


  // this function is to set already present values in the interview
  const setAttributes=async(interview)=>{
    interviewName.current.value=interview.name;
    startTime.current.value=interview.start;
    endTime.current.value=interview.end;
    date.current.value=interview.date
    const interviewData = query(
      collection(db, "interviews"),
     where("date", "==", date.current.value),
     where("startTime","==",startTime.current.value),
     where("endTime","==",endTime.current.value)
   );
   const docSnap = await getDocs(interviewData);
   docSnap.forEach((document) => {
     setInterviewId(document.id);
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
  const updateUser = async (id, newScheduledInterviews) => {
	const userRef = doc(db, "users", id);
	
	const newField = {
		scheduledInterviews: newScheduledInterviews,
	};
	await updateDoc(userRef, newField);
	setTimeout(()=>{
		console.log("User Updated!")
	},3000);
};
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
    
		setWaiting(false);
		setSuccess(true);
		setTimeout(() => {
			setSuccess(false);
		}, 3000);
	};
  // interview component
  const update=async()=>{
    const mailsOfSelectedUsers=[];
    const start = startTime.current.value;
		const end = endTime.current.value;
		const interview = interviewName.current.value;
		const interviewDate = date.current.value;
	// I have to set Initial mails of people who was already in the interview
	if(interviewId===""){
		setPossible(false);
			setErrorMessage("Please select an interview!");
			setTimeout(() => {
				setPossible(true);
				setErrorMessage("");
			}, 5000);
			return;
	}


	
	const interrviewRef =  doc(db, "interviews", interviewId);
	const interviewDoc=await getDoc(interrviewRef);
	const interviewData=interviewDoc.data();
	
	// if instead of saving mails I delete the data from users (and not interviews because we
	// are already updating it) 
	// this function will be similar to create Interview and no any problem 
	interviewData.users.forEach(async(userMail)=>{
		const userData = query(
			collection(db, "users"),
			where("email", "==", userMail)
		);
		const docSnap = await getDocs(userData);
		docSnap.forEach((document) => {
			const newScheduledInterviews =document.data().scheduledInterviews.filter((interview)=>{
				return interview.interviewId!==interviewId;
			});
			console.log("Working.....");
			updateUser(document.id, newScheduledInterviews);
		});
	})

	// Storing the values of selected members

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
          setErrorMessage(user.name+" is not available for the given time slot");
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
			setErrorMessage("All fields are required!");
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
			console.log("Current Time ->",currentTime);
			console.log("Start Time ->",start);
			console.log("End Time ->",end);

			if ((currentTime > start) || (currentTime > end)) {
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
	setWaiting(true);
    setTimeout(async() => {
		if(mailsOfSelectedUsers.length>1){
			mailsOfSelectedUsers.forEach(async (userMail) => {
				const userData = query(
					collection(db, "users"),
					where("email", "==", userMail)
				);
				const docSnap = await getDocs(userData);
				docSnap.forEach((document) => {
					const newScheduledInterviews = [
						...document.data().scheduledInterviews,
						{startTime:start,endTime:end,date:interviewDate,interviewId:interviewId}
					];
					updateUser(document.id, newScheduledInterviews);
				});
			});
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
      <div className='cursor-pointer mt-2 bg-teal-500 hover:bg-teal-400 text-white font-bold py-2 px-4 border-b-4 border-teal-700 hover:border-teal-500 rounded-full ' onClick={()=>setAttributes(props)}>{props.name}</div>
    )
  }

	return (
		<div className="flex w-5/6">
			<div className="w-1/3 flex justify-center flex-col items-center">
				<h1 className=" font-bold mb-2 text-xl text-[#030027] pb-2 border-b-2 border-[#030027]">Update Interview</h1>
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
				{interviews.length===0 && <div className="w-80 h-40 ml-2 mt-2 border rounded-lg bg-[#030027] text-white flex flex-col justify-center items-center"> 
				No interviews are scheduled till now.
			</div>}
			</div>
			<div className="shadow w-1/2 border flex flex-col justify-center ">
			<div className="flex  m-4">
				<label className="ml-4 mr-4 text-gray-500 font-bold mb-1 md:mb-0 pr-4  " htmlFor="name">
					Name of Interview
				</label>
				<input
					ref={interviewName}
					className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500"
					type="text"
					placeholder="Enter Name of Interview"
					name="name"
				/>
			</div>
			<div className="flex  m-4">
				<label className="ml-4 mr-4 text-gray-500 font-bold mb-1 md:mb-0 pr-4 w-1/3 " htmlFor="date">
					Date
				</label>
				<input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" ref={date} type="date" name="date" />
			</div>
			<div className="flex  m-4">
				<label className="ml-4 mr-4 text-gray-500 font-bold mb-1 md:mb-0 pr-4 w-1/3 " htmlFor="startTime">
					Start Time
				</label>
				<input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" ref={startTime} type="time" name="startTime" />
			</div>
			<div className="flex  m-4">
				<label className="ml-4 mr-4 text-gray-500 font-bold mb-1 md:mb-0 pr-4 w-1/3 " htmlFor="endTime">
					End Time
				</label>
				<input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" ref={endTime} type="time" name="endTime" />
			</div>
			<div className="flex  m-4 ">
				<label className="ml-4 mr-4 text-gray-500 font-bold mb-1 md:mb-0 pr-4 w-1/3 flex flex-col justify-center  items-start" htmlFor="users">
					Select Users
				</label>
				<Multiselect showCheckbox="true" keepSearchTerm="true" placeholder="Select Users"  className="bg-gray-200 w-full focus:border-purple-500"options={users} ref={selectedUsers} displayValue="name" />
			</div>
        <div className="flex justify-center w-full">
				<button
					className="transition duration-500 transform hover:-translate-y-1 inline-block bg-blue-700 text-lg font-medium text-white rounded-full px-4 py-2 m-2 cursor-pointer"
					onClick={
						()=>{
              update();
            }
					}>
					Update Interview
				</button>
			</div>
			{!possible && <div className="text-red-600 text-center font-bold text-xl">{errorMessage}</div>}
			{success && <div className="text-green-600 text-center font-bold text-xl ">Interview Updated SucessFully</div>}
			{waiting && <div className="text-blue-600 text-center font-bold text-xl ">Updating Interview...</div>}

			</div>
      
		</div>
	);
};

export default UpdateInterview;
