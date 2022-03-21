import { React, useState, useEffect, useRef } from "react";
import { Multiselect } from "multiselect-react-dropdown";
import { db } from "./firebase-config";
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
const CreateInterview = () => {
	const [users, setUsers] = useState([]);
	const userCollectionRef = collection(db, "users");
	const selectedUsers = useRef([]);
	const startTime = useRef();
	const endTime = useRef();
	const date = useRef();
	const [waiting,setWaiting]=useState(false);
	const interviewName = useRef("");
	const [possible, setPossible] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");
	const [success,setSuccess]=useState(false);

	useEffect(() => {
		const getUsers = async () => {
			const data = await getDocs(userCollectionRef);
			const user = data.docs.map((doc) => ({ ...doc.data() }));
			setUsers(user);
		};
		getUsers();
	}, []);


	const updateUser = async (id, newScheduledInterviews) => {
		const userRef = doc(db, "users", id);
		
		const newField = {
			scheduledInterviews: newScheduledInterviews,
		};
		await updateDoc(userRef, newField);
		setWaiting(false);
		setSuccess(true);
		setTimeout(() => {
			setSuccess(false);
		}, 3000);
	};

	const checkPossibilty = async () => {
		const start = startTime.current.value;
		const end = endTime.current.value;
		const interview = interviewName.current.value;
		const interviewDate = date.current.value;
		let mailsOfSelectedUsers=[];
		
		[...selectedUsers.current.getSelectedItems()].forEach(
			(user) => {
				const scheduled=user.scheduledInterviews;
				let elig=true;
				mailsOfSelectedUsers.push(user.email);
				scheduled.forEach((value)=>{
					const startTime=value.startTime;
					const endTime=value.endTime;
					const date=value.date;
					if(date===interviewDate && ((start>=startTime && start<=endTime) || (end>=startTime && end<=endTime))){
						setPossible(false);
						setWaiting(false);
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
			}
		);
		
		if (interview === "" || start === "" || end === "" || interviewDate=='') {
			setPossible(false);
			setErrorMessage("All Fields are Required!");
			setTimeout(() => {
				setPossible(true);
				setErrorMessage("");
			}, 3000);
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
			}, 3000);
			return;
		}

		if (interviewDate === compareStringDate) {
			const currentTime = moment().format("HH:mm");
			if (currentTime > start || currentTime > end) {
				setPossible(false);
				setErrorMessage("This Time has been passed");
				setTimeout(() => {
					setPossible(true);
					setErrorMessage("");
				}, 3000);
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
			}, 3000);
			return;
		}

		setTimeout(() => {
			if (mailsOfSelectedUsers.length <= 1) {
				setPossible(false);
				setErrorMessage("Select atleast two partcipants for an interview");
				setTimeout(() => {
					setPossible(true);
					setErrorMessage("");
				}, 3000);
				return;
			}
		}, 5000);
		setWaiting(true);
    
   
    	setTimeout(async() => {
			if(mailsOfSelectedUsers.length>1){
				const newObject = {
					name: interview,
					startTime: start,
					endTime: end,
					date: interviewDate,
					users: mailsOfSelectedUsers,
				};
			const docRef = await addDoc(collection(db, "interviews"), newObject);
			
			mailsOfSelectedUsers.map(async (userMail) => {
				const userData = query(
					collection(db, "users"),
					where("email", "==", userMail)
				);
				const docSnap = await getDocs(userData);
				docSnap.forEach((document) => {
					const newScheduledInterviews = [
						...document.data().scheduledInterviews,
						{startTime:start,endTime:end,date:interviewDate,interviewId:docRef.id}
					];
					updateUser(document.id, newScheduledInterviews);
				});
			});
		}
		}, (10000));
	
	};
	return (
		<div className="w-1/2 shadow border flex flex-col justify-center ">
			<span className=" text-2xl font-extrabold text-[#030027] text-center">Create Interview</span>
			<div className="flex  m-4">
				<label className="ml-4 mr-4 text-gray-500 font-bold mb-1 md:mb-0 pr-4 w-1/3 " htmlFor="name">
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
				<Multiselect className="bg-gray-200 w-full focus:border-purple-500"options={users} ref={selectedUsers} displayValue="name" />
			</div>
			<div className="flex justify-center w-5/6">
				<button
					className="transition duration-500 transform hover:-translate-y-1 inline-block bg-blue-700 text-lg font-medium text-white rounded-full px-4 py-2 m-2 cursor-pointer"
					onClick={
						checkPossibilty
					}>
					Add Interview
				</button>
			</div>
			{!possible && <div className="text-red-600 text-center font-bold text-xl">{errorMessage}</div>}
			{success && <div className="text-green-600 text-center font-bold text-xl ">Interview Created SucessFully</div>}
			{waiting && <div className="text-blue-600 text-center font-bold text-xl ">Creating Interview...</div>}
		</div>
	);
};

export default CreateInterview;
