import axios from 'axios';
import React, { useState,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';
import down from "./images/down.png"
import Message from './components/Message';
import send from './images/send.png';
    
function App() {
    const isHidden = useSelector(state => state.isHidden);
    const dispatch = useDispatch();
    const changeIsHidden = () => {
        dispatch({type:'IS_HIDDEN', payload:true})
    }
    const [messages,setMessages] = useState(!isHidden.isHidden ? [{role: 'Царь',roleOfChat: 'SuspectGPT',value:"Добро пожаловать в общий чат", id: '000'}] : [])
    const [value,setValue] = useState('');
    const [userMessages,setUserMessages] = useState([])

    function focus (e) {
        const input = document.getElementsByTagName('input')[0];
        const hr = document.getElementsByTagName('hr')[0];

        if(e.target === input){
            hr.style.animation = "focus 0.3s 1 ease forwards"
        }

        const newHr = getComputedStyle(hr)

        if(e.target !== input && /\s+focus/.test(newHr.animation)){
            hr.style.animation = "off-focus 0.3s 1 ease forwards"
        }
    }

    function scrollDownSmooth () {
        const overflow = document.getElementsByClassName('overflow')[0];
        overflow.scrollBy({
            top: overflow.clientHeight + 500*(messages.length + 1),
            behavior: 'smooth'
        })
    }

    useEffect(() => {
        const overflow = document.getElementsByClassName('overflow')[0];
        const down = document.getElementsByClassName('down')[0];
        function downAnimation () {
            const scrollTop = overflow.scrollTop;
            const scrollHeight = overflow.scrollHeight;
            const clientHeight = overflow.clientHeight;
            if(scrollHeight - scrollTop - clientHeight > 100){
                down.style.animation = 'down 0.2s 1 ease forwards';
            }
            if(scrollHeight - scrollTop - clientHeight <= 100){
                down.style.animation = 'down-back 0.2s 1 ease forwards';
            }
        }
        overflow.addEventListener('scroll', downAnimation)
        return () => {
            overflow.removeEventListener('scroll', downAnimation)
        }
    },[])

    
    function scrollDown() {
        const overflow = document.getElementsByClassName('overflow')[0];
        const scrollTop = overflow.scrollTop;
        const scrollHeight = overflow.scrollHeight;
        const clientHeight = overflow.clientHeight;
        if(scrollTop + clientHeight + 180 > scrollHeight){
            setTimeout(() => scrollDownSmooth(),40)
        }
    }
    useEffect(() => {
        scrollDown()
    },[messages])
    function hide () {
        setMessages(prev => prev.filter((item) => item.id !== '000'))
    }
    useEffect(() => {
        window.addEventListener('click', focus)
        return () => {
            window.removeEventListener('click', focus)
        }
    },[])

    function changeRoleOfChat () {
        let promptt = prompt() 
        let newRoleOfChat = (promptt  !== null) ? promptt : user.user.roleOfChat
        if(newRoleOfChat.length >= 23){
            newRoleOfChat = newRoleOfChat.substr(0,23)
        }
        roleOfUser({role: user.user.role, roleOfChat: newRoleOfChat, id: user.user.id})  
    } 

    const sendMessage = async (role) => {
        if(role === 'Царь'){
            await axios.post('http://localhost:5000/post-message', {
                role: role,
                from: user.user.id,
                roleOfChat: user.user.roleOfChat,
                value:value,
                id: Date.now(),
                likes: 0,
                dislikes: 0,
            })
        }else{
            await axios.post('http://localhost:5000/post-message', {
                role: role,
                from: user.user.id,
                value:value,
                id: Date.now(),
                likes: 0,
                dislikes: 0,
            })
        }
    }



    const postUpdateArray = async () => {
        try {
            const {data} = await axios.get('http://localhost:5000/post-update-array')
            console.log(data)
        } catch (e) {
            console.log('ну бялть', e)
        }
    }
    const getUpdateArray = async () => {
        try {
            const {data} = await axios.get('http://localhost:5000/get-update-array')
            setMessages(!isHidden.isHidden ? [...data,{role: 'Царь',roleOfChat: 'SuspectGPT',value:"Добро пожаловать в общий чат(перезагрузите страницу, если не скрылось)", id: '000'}] : data)
            
            await getUpdateArray()
        } catch (e) {
            setTimeout(() => {
                getUpdateArray()
            },500)
        }
    }
    useEffect(() => {
        getUpdateArray()
    },[])



    const subscribe = async () => {
        try {
            const {data} = await axios.get('http://localhost:5000/get-message')
            setMessages((prev) => [...new Set([...prev,data])])
            await subscribe()
        } catch (e) {
            setTimeout(() => {
                subscribe()
            },500)
        }
    }
    useEffect(() => {
        subscribe()
        setMessages((prev) => [...new Set([...prev])])
    },[])
    const getMessages = async () => {
        try {
            const response = await axios.get('http://localhost:5000/get-messages')
            let arr = new Set([...response.data])
            setMessages((prev) => [...new Set([...arr,...prev])])
        } catch (e) {
            console.log('ммм',e)
        }
    }
    useEffect(() => {
        getMessages()
        setMessages((prev) => [...new Set([...prev])])
    },[])
    useEffect(() => {
        setTimeout(() => scrollDownSmooth(),40)
    },[messages.length > 1])

    async function deleteMessage (userId,id) {
        const some = messages.find((item) => item.from === userId && item.id === id);
        try{
            const response = await axios.delete(`http://localhost:5000/delete-message/${some.id}/${some.from}`)
            await postUpdateArray()
            console.log('Устранён',response.data)
        }catch (e){
            console.log('Ну как так')
        }
    }

    const user = useSelector(state => state.user);
    const roleOfUser = (user) => {
        dispatch({type:'ADD_USER_DATA', payload: user})
    }
    async function roleDefault () {
        const newUser = {
            role: 'Узбек',
            secret: "BekBebek2003"
        };
        try {
            const response = await axios.post('http://localhost:5000/post-user', newUser);
            console.log('Пользователь успешно создан:', response.data);
            roleOfUser({role: response.data.role, id: response.data._id})
        } catch (error) {
            console.error('Ошибка при создании пользователя:', error);
        }
    }
    useEffect(() => {
        if(!user.user){
            roleDefault()
        }
    },[])
    async function patchToAdmin () {
        try {
            const response = await axios.patch(`http://localhost:5000/patch-user/${user.user.id}`, { role: 'Царь', secret: "BekBebek2003"});
            console.log('Роль пользователя успешно обновлена:', response.data);
            roleOfUser({role: response.data.role, roleOfChat: 'ChatGPT', id: response.data.id})  
        } catch (error) {
            console.error('Ошибка при обновлении роли пользователя:', error);
        }
    }
    useEffect(() => {
        if(!(undefined === userMessages.find(item => item === 'suzpek321'))){
            patchToAdmin()
        }
    },[userMessages])
    const role = user.user ? user.user.role : undefined

    useEffect(() => {
      setTimeout(() => scrollDownSmooth(),40)
    },[userMessages.length])


    const [isDisabled, setIsDisabled] = useState(false);
    useEffect(() => {
        setIsDisabled(true);
        setTimeout(() => {
            setIsDisabled(false);
        }, 2000);
    },[userMessages.length])

    const likes = useSelector(state => state.likes);
    const dislikes = useSelector(state => state.dislikes);
    const addLike = (prev,messages,index,section1) => {
        if(prev.find(item => JSON.stringify(item.mes) === JSON.stringify(messages[index])) !== undefined){
            if(prev.find(item => JSON.stringify(item.mes) === JSON.stringify(messages[index])) !== undefined){
                commitRep(prev.map((item,id) => {
                    if(id === prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))){
                            return {rep: !prev[prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))].rep, mes: messages[index]}
                    }
                    return item
                }),messages[index],'likes')
                return dispatch({type:'LIKES_MANAGER', payload: prev.map((item,id) => {
                    if(id === prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))){
                            return {rep: !prev[prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))].rep, mes: messages[index]}
                    }
                    return item
                })})
            }
        }
        commitRep([...prev,{rep: true,mes: messages[index]}],messages[index],'likes')
        dispatch({type:'LIKES_MANAGER', payload:[...prev,{rep: true,mes: messages[index]}]})
    }
    const changeChooseOfLike = (prev,messages,index,section1) => {
        commitRep(prev.map(item => {
            if(item === prev[prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))]){
                return {rep: false, mes: messages[index]}
            }
            return item;
        }),messages[index],'likes')
        return dispatch({type:'LIKES_MANAGER', payload: prev.map(item => {
            if(item === prev[prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))]){
                return {rep: false, mes: messages[index]}
            }
            return item;
        })})
    }

    const addDislike = (prev,messages,index,section2) => {
        if(prev.find(item => JSON.stringify(item.mes) === JSON.stringify(messages[index])) !== undefined){
            if(prev.find(item => JSON.stringify(item.mes) === JSON.stringify(messages[index])) !== undefined){
                commitRep(prev.map((item,id) => {
                    if(id === prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))){
                        return {rep: !prev[prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))].rep, mes: messages[index]}
                    }
                    return item
                }),messages[index],'dislikes')
                return dispatch({type:'DISLIKES_MANAGER', payload: prev.map((item,id) => {
                    if(id === prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))){
                        return {rep: !prev[prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))].rep, mes: messages[index]}
                    }
                    return item
                })})
            }
        }
        commitRep([...prev,{rep: true,mes: messages[index]}],messages[index],'dislikes')
        dispatch({type:'DISLIKES_MANAGER', payload:[...prev,{rep: true,mes: messages[index]}]})
    }
    const changeChooseOfDislike = (prev,messages,index,section2) => {
        commitRep(prev.map(item => {
            if(item === prev[prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))]){
                return {rep: false, mes: messages[index]}
            }
            return item;
        }),messages[index],'dislikes')
        return dispatch({type:'DISLIKES_MANAGER', payload: prev.map(item => {
            if(item === prev[prev.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(messages[index]))]){
                return {rep: false, mes: messages[index]}
            }
            return item;
        })})
    }


    const commitRep = async (repu,mes,def) => {
        console.log(repu,mes)
        const some = repu.find(item => JSON.stringify(item.mes) === JSON.stringify(mes));
        console.log(some)
        try{
            const response = await axios.patch(`http://localhost:5000/commit-rep/${some.rep}/${JSON.stringify(some.mes)}/${def}`)
            await postUpdateArray()
            console.log('успех', response.data)
        }catch (e){
            console.log(e)
        }
    }


    function changeReputation (e) {
        let index;
        for (let i = 0; i < document.getElementsByClassName('message').length; i++) {
            if (document.getElementsByClassName('message')[i] === e.target.closest('.message')) {
              index = i;
              break;
            }
          }
        const message = document.getElementsByClassName('message')[index]
        const section1 = document.getElementsByClassName('devide-sections')[index*2]
        const section2 = document.getElementsByClassName('devide-sections')[index*2 + 1]
        if(e.target.closest('.message') === message && e.target.closest('.devide-sections') === section1){
            if(dislikes.findIndex(item => JSON.stringify(item.mes) === JSON.stringify(messages[index])) !== -1 && dislikes[dislikes.findIndex(item => JSON.stringify(item.mes) === JSON.stringify(messages[index]))].rep === true){
                changeChooseOfDislike(dislikes,messages,index,section2)
            }
            addLike(likes,messages,index,section1)
        }
        if(e.target.closest('.message') === message && e.target.closest('.devide-sections') === section2){
            if(likes.findIndex(item => JSON.stringify(item.mes) === JSON.stringify(messages[index])) !== -1 && likes[likes.findIndex(item => JSON.stringify(item.mes) === JSON.stringify(messages[index]))].rep === true){
                changeChooseOfLike(likes,messages,index,section1)
            }
            addDislike(dislikes,messages,index,section2)
        }
    }
    useEffect(() => {
        const chat = document.getElementsByClassName('chat')[0]
        chat.addEventListener('click', changeReputation)
        return () => {
            chat.removeEventListener('click', changeReputation)
        }
    },[messages,likes,dislikes])


    useEffect(() => {
        setMessages((prev) => [...new Set([...prev])]);
    },[messages.length])

    
    return (
        <div className="App">
            <div className="chat">
                <div className="top">
                    <h1>SuspectGPT</h1>
                </div>
                <div className="down" onClick={() => scrollDownSmooth()}><img src={down} alt="" className="down__png"/></div>
                <div className="overflow">
                    <div className="messages">
                        {
                            [...new Set(messages)].map((item,id) =>
                                <Message
                                    message={item}
                                    key={id}
                                    numOfMessage={id}
                                    id={item.id}
                                    userData={user.user}
                                    hide={hide}
                                    changeIsHidden={changeIsHidden}
                                    role={item.role}
                                    ownRole={role}
                                    roleOfChat={item.roleOfChat ? item.roleOfChat : undefined}
                                    changeRoleOfChat={changeRoleOfChat}
                                    deleteMessage={deleteMessage}
                                    changeReputation={changeReputation}
                                    likes={likes.length === 0 || likes.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(item)) === -1 ? undefined : likes[likes.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(item))].rep}
                                    dislikes={dislikes.length === 0 || dislikes.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(item)) === -1 ? undefined : dislikes[dislikes.findIndex(item1 => JSON.stringify(item1.mes) === JSON.stringify(item))].rep}
                                />
                            )
                        }
                    </div>
                </div>
                <div className="bottom">
                    <form action="#">
                        <input maxLength="100" type="text" value={value} onChange={(e) => {
                            e.preventDefault()
                            setValue(e.target.value);
                            focus(e)
                        }} placeholder="Введите сообщение"/>
                        <button disabled={isDisabled} className="enter" onClick={(e) => {
                            e.preventDefault()
                            if(value.split(" ").join("") === ""){
                                return;
                            }
                            setUserMessages(prev => [...prev,value])
                            sendMessage(role)
                            setValue("");
                        }}><img src={send} alt=""/></button>
                    </form>
                    <hr className='hr-is-entered'/> 
                </div>
            </div>
        </div>
    );
}

export default App;


























// import axios from 'axios';
// import React, { useState,useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import './App.css';
// import down from "./images/down.png"
// import Message from './components/Message';
// import send from './images/send.png';
    
// function App() {
//     const isHidden = useSelector(state => state.isHidden);
//     const dispatch = useDispatch();
//     const changeIsHidden = () => {
//         dispatch({type:'IS_HIDDEN', payload:true})
//     }
//     const [messages,setMessages] = useState(!isHidden.isHidden ? [{role: 'Царь',roleOfChat: 'SuspectGPT',value:"Добро пожаловать в общий чат", id: '000'}] : [])
//     const [value,setValue] = useState('');
//     const [userMessages,setUserMessages] = useState([])

//     function focus (e) {
//         const input = document.getElementsByTagName('input')[0];
//         const hr = document.getElementsByTagName('hr')[0];

//         if(e.target === input){
//             hr.style.animation = "focus 0.3s 1 ease forwards"
//         }

//         const newHr = getComputedStyle(hr)

//         if(e.target !== input && /\s+focus/.test(newHr.animation)){
//             hr.style.animation = "off-focus 0.3s 1 ease forwards"
//         }
//     }

//     function scrollDownSmooth () {
//         const overflow = document.getElementsByClassName('overflow')[0];
//         overflow.scrollBy({
//             top: overflow.clientHeight + 500*(messages.length + 1),
//             behavior: 'smooth'
//         })
//     }

//     useEffect(() => {
//         const overflow = document.getElementsByClassName('overflow')[0];
//         const down = document.getElementsByClassName('down')[0];
//         function downAnimation () {
//             const scrollTop = overflow.scrollTop;
//             const scrollHeight = overflow.scrollHeight;
//             const clientHeight = overflow.clientHeight;
//             if(scrollHeight - scrollTop - clientHeight > 100){
//                 down.style.animation = 'down 0.2s 1 ease forwards';
//             }
//             if(scrollHeight - scrollTop - clientHeight <= 100){
//                 down.style.animation = 'down-back 0.2s 1 ease forwards';
//             }
//         }
//         overflow.addEventListener('scroll', downAnimation)
//         return () => {
//             overflow.removeEventListener('scroll', downAnimation)
//         }
//     },[])

    
//     function scrollDown() {
//         const overflow = document.getElementsByClassName('overflow')[0];
//         const scrollTop = overflow.scrollTop;
//         const scrollHeight = overflow.scrollHeight;
//         const clientHeight = overflow.clientHeight;
//         if(scrollTop + clientHeight + 180 > scrollHeight){
//             setTimeout(() => scrollDownSmooth(),40)
//         }
//     }
//     useEffect(() => {
//         scrollDown()
//     },[messages])
//     function hide () {
//         setMessages(prev => prev.filter((item) => item.id !== '000'))
//     }
//     useEffect(() => {
//         window.addEventListener('click', focus)
//         return () => {
//             window.removeEventListener('click', focus)
//         }
//     },[])

//     function changeRoleOfChat () {
//         let promptt = prompt() 
//         let newRoleOfChat = (promptt  !== null) ? promptt : user.user.roleOfChat
//         if(newRoleOfChat.length >= 23){
//             newRoleOfChat = newRoleOfChat.substr(0,23)
//         }
//         roleOfUser({role: user.user.role, roleOfChat: newRoleOfChat, id: user.user.id})  
//     } 

//     const sendMessage = async (role) => {
//         if(role === 'Царь'){
//             await axios.post('http://localhost:5000/post-message', {
//                 role: role,
//                 from: user.user.id,
//                 roleOfChat: user.user.roleOfChat,
//                 value:value,
//                 id: Date.now(),
//                 likes: 0,
//                 dislikes: 0,
//             })
//         }else{
//             await axios.post('http://localhost:5000/post-message', {
//                 role: role,
//                 from: user.user.id,
//                 value:value,
//                 id: Date.now(),
//                 likes: 0,
//                 dislikes: 0,
//             })
//         }
//     }



//     const postUpdateArray = async () => {
//         try {
//             const {data} = await axios.get('http://localhost:5000/post-update-array')
//         } catch (e) {
//             console.log('ну бялть', e)
//         }
//     }
//     const getUpdateArray = async () => {
//         try {
//             const {data} = await axios.get('http://localhost:5000/get-update-array')
//             setMessages(!isHidden.isHidden ? [...data,{role: 'Царь',roleOfChat: 'SuspectGPT',value:"Добро пожаловать в общий чат(перезагрузите страницу, если не скрылось)", id: '000'}] : data)
            
//             await getUpdateArray()
//         } catch (e) {
//             setTimeout(() => {
//                 getUpdateArray()
//             },500)
//         }
//     }
//     useEffect(() => {
//         getUpdateArray()
//     },[])



//     const subscribe = async () => {
//         try {
//             const {data} = await axios.get('http://localhost:5000/get-message')
//             setMessages((prev) => [...new Set([...prev,data])])
//             await subscribe()
//         } catch (e) {
//             setTimeout(() => {
//                 subscribe()
//             },500)
//         }
//     }
//     useEffect(() => {
//         subscribe()
//         setMessages((prev) => [...new Set([...prev])])
//     },[])
//     const getMessages = async () => {
//         try {
//             const response = await axios.get('http://localhost:5000/get-messages')
//             let arr = new Set([...response.data])
//             setMessages((prev) => [...new Set([...arr,...prev])])
//         } catch (e) {
//             console.log('ммм',e)
//         }
//     }
//     useEffect(() => {
//         getMessages()
//         setMessages((prev) => [...new Set([...prev])])
//     },[])
//     useEffect(() => {
//         setTimeout(() => scrollDownSmooth(),40)
//     },[messages.length > 1])

//     async function deleteMessage (userId,id) {
//         const some = messages.find((item) => item.from === userId && item.id === id);
//         try{
//             const response = await axios.delete(`http://localhost:5000/delete-message/${some.id}/${some.from}`)
//             await postUpdateArray()
//             console.log('Устранён',response.data)
//         }catch (e){
//             console.log('Ну как так')
//         }
//     }

//     const user = useSelector(state => state.user);
//     const roleOfUser = (user) => {
//         dispatch({type:'ADD_USER_DATA', payload: user})
//     }
//     async function roleDefault () {
//         const newUser = {
//             role: 'Узбек',
//             secret: "BekBebek2003"
//         };
//         try {
//             const response = await axios.post('http://localhost:5000/post-user', newUser);
//             console.log('Пользователь успешно создан:', response.data);
//             roleOfUser({role: response.data.role, id: response.data._id})
//         } catch (error) {
//             console.error('Ошибка при создании пользователя:', error);
//         }
//     }
//     useEffect(() => {
//         if(!user.user){
//             roleDefault()
//         }
//     },[])
//     async function patchToAdmin () {
//         try {
//             const response = await axios.patch(`http://localhost:5000/patch-user/${user.user.id}`, { role: 'Царь', secret: "BekBebek2003"});
//             console.log('Роль пользователя успешно обновлена:', response.data);
//             roleOfUser({role: response.data.role, roleOfChat: 'ChatGPT', id: response.data.id})  
//         } catch (error) {
//             console.error('Ошибка при обновлении роли пользователя:', error);
//         }
//     }
//     useEffect(() => {
//         if(!(undefined === userMessages.find(item => item === 'suzpek321'))){
//             patchToAdmin()
//         }
//     },[userMessages])
//     const role = user.user ? user.user.role : undefined

//     useEffect(() => {
//       setTimeout(() => scrollDownSmooth(),40)
//     },[userMessages.length])


//     const [isDisabled, setIsDisabled] = useState(false);
//     useEffect(() => {
//         setIsDisabled(true);
//         setTimeout(() => {
//             setIsDisabled(false);
//         }, 2000);
//     },[userMessages.length])

//     const likes = useSelector(state => state.likes);
//     const dislikes = useSelector(state => state.dislikes);
//     const commonValue = (messages) => {
//             let newArr = messages
//             dispatch({type:'LIKES_MANAGER', payload: newArr.map((item,id) => {return {rep: likes[id].rep === undefined ? false : likes[id].rep , mes: item}})});

//             let newArr1 = messages
//             dispatch({type:'DISLIKES_MANAGER', payload: newArr1.map((item,id) => {
//                 console.log(dislikes[id].rep === undefined)
//                 return {rep: dislikes[id].rep === undefined ? false : dislikes[id].rep , mes: item}})});
//     }
//     const addLike = (prev,messages,index,section1) => {
//         if(prev.find(item => item.mes === messages[index]) !== undefined){
//             if(prev.find(item => item.mes === messages[index]) !== undefined){
//                 return dispatch({type:'LIKES_MANAGER', payload: prev.map((item,id) => {
//                     if(id === prev.findIndex(item1 => item1.mes === messages[index])){
//                         return {rep: !prev[prev.findIndex(item1 => item1.mes === messages[index])].rep, mes: messages[index]}
//                     }
//                     return item
//                 })})
//             }
//         }
//     }
//     const changeChooseOfLike = (prev,messages,index,section1) => {
//         return dispatch({type:'LIKES_MANAGER', payload: prev.map(item => {
//             if(item === prev[prev.findIndex(item1 => item1.mes === messages[index])]){
//                 return {rep: false, mes: messages[index]}
//             }
//             return item;
//         })})
//     }

//     const addDislike = (prev,messages,index,section2) => {
//         if(prev.find(item => item.mes === messages[index]) !== undefined){
//             if(prev.find(item => item.mes === messages[index]) !== undefined){
//                 return dispatch({type:'DISLIKES_MANAGER', payload: prev.map((item,id) => {
//                     if(id === prev.findIndex(item1 => item1.mes === messages[index])){
//                         return {rep: !prev[prev.findIndex(item1 => item1.mes === messages[index])].rep, mes: messages[index]}
//                     }
//                     return item
//                 })})
//             }
//         }
//     }
//     const changeChooseOfDislike = (prev,messages,index,section2) => {
//         return dispatch({type:'DISLIKES_MANAGER', payload: prev.map(item => {
//             if(item === prev[prev.findIndex(item1 => item1.mes === messages[index])]){
//                 return {rep: false, mes: messages[index]}
//             }
//             return item;
//         })})
//     }

//     function changeReputation (e) {
//         let index;
//         for (let i = 0; i < document.getElementsByClassName('message').length; i++) {
//             if (document.getElementsByClassName('message')[i] === e.target.closest('.message')) {
//               index = i;
//               break;
//             }
//           }
//         const message = document.getElementsByClassName('message')[index]
//         const section1 = document.getElementsByClassName('devide-sections')[index*2]
//         const section2 = document.getElementsByClassName('devide-sections')[index*2 + 1]
//         if(e.target.closest('.message') === message && e.target.closest('.devide-sections') === section1){
//             if(dislikes.findIndex(item => item.mes === messages[index]) !== -1 && dislikes[dislikes.findIndex(item => item.mes === messages[index])].rep === true){
//                 changeChooseOfDislike(dislikes,messages,index,section2)
//             }
//             addLike(likes,messages,index,section1)
//         }
//         if(e.target.closest('.message') === message && e.target.closest('.devide-sections') === section2){
//             if(likes.findIndex(item => item.mes === messages[index]) !== -1 && likes[likes.findIndex(item => item.mes === messages[index])].rep === true){
//                 changeChooseOfLike(likes,messages,index,section1)
//             }
//             addDislike(dislikes,messages,index,section2)
//         }
//     }
//     useEffect(() => {
//         const chat = document.getElementsByClassName('chat')[0]
//         chat.addEventListener('click', changeReputation)
//         return () => {
//             chat.removeEventListener('click', changeReputation)
//         }
//     },[messages,likes,dislikes]);

//     useEffect(() => {
//         commonValue(messages)
//     },[messages,likes.length,dislikes.length])


//     useEffect(() => {
//         setMessages((prev) => [...new Set([...prev])]);
//     },[messages.length])

    
//     return (
//         <div className="App">
//             <div className="chat">
//                 <div className="top">
//                     <h1>SuspectGPT</h1>
//                 </div>
//                 <div className="down" onClick={() => scrollDownSmooth()}><img src={down} alt="" className="down__png"/></div>
//                 <div className="overflow">
//                     <div className="messages">
//                         {
//                             [...new Set(messages)].map((item,id) =>
//                                 <Message
//                                     message={item}
//                                     key={id}
//                                     numOfMessage={id}
//                                     id={item.id}
//                                     userData={user.user}
//                                     hide={hide}
//                                     changeIsHidden={changeIsHidden}
//                                     role={item.role}
//                                     ownRole={role}
//                                     roleOfChat={item.roleOfChat ? item.roleOfChat : undefined}
//                                     changeRoleOfChat={changeRoleOfChat}
//                                     deleteMessage={deleteMessage}
//                                     changeReputation={changeReputation}
//                                     likes={likes.length === 0 || likes[id].rep === undefined ? undefined : likes[likes.findIndex(item1 => item1.mes === item)].rep}
//                                     dislikes={dislikes.length === 0 || dislikes[id].rep === undefined ? undefined : dislikes[dislikes.findIndex(item1 => item1.mes === item)].rep}
//                                 />
//                             )
//                         }
//                     </div>
//                 </div>
//                 <div className="bottom">
//                     <form action="#">
//                         <input maxLength="100" type="text" value={value} onChange={(e) => {
//                             e.preventDefault()
//                             setValue(e.target.value);
//                             focus(e)
//                         }} placeholder="Введите сообщение"/>
//                         <button disabled={isDisabled} className="enter" onClick={(e) => {
//                             e.preventDefault()
//                             if(value.split(" ").join("") === ""){
//                                 return;
//                             }
//                             setUserMessages(prev => [...prev,value])
//                             sendMessage(role)
//                             setValue("");
//                         }}><img src={send} alt=""/></button>
//                     </form>
//                     <hr className='hr-is-entered'/> 
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default App;