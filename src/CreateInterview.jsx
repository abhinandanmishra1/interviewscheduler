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

	const interviewName = useRef("");
	const [possible, setPossible] = useState(true);
	const [errorMessage, setErrorMessage] = useState("");

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
		<div className="w-1/2">
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
				<Multiselect options={users} ref={selectedUsers} displayValue="name" />
			</div>
			<div className="flex justify-center w-2/3">
				<button
					className="bg-[#2c76d6] text-white rounded-lg p-2 m-2 font-semibold text-md"
					onClick={
						checkPossibilty
					}>
					Add Interview
				</button>
			</div>
			{!possible && <div className="text-red-600 ">{errorMessage}</div>}
		</div>
	);
};

export default CreateInterview;
