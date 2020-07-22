import React, { Component } from 'react';
import {firestore, auth} from '../../backend/firebase';
import LoginString from '../../backend/LoginStrings';
import './Chat.css';
// import ReactLoading from 'react-loading';
import ChatBox from '../ChatBox/ChatBox';
import Welcome from '../Welcome/Welcome';

export default class Chat extends Component{
    constructor(props){
        super(props)
        this.state={
            isLoading: true,
            isOpenDialogConfirmLogout: false,
            currentPeerUser: null,
            displayedContactSwitchedNotification: [],
            displayedContacts: []
        }
        this.currentUserName = localStorage.getItem(LoginString.Name)
        this.currentUserId = localStorage.getItem(LoginString.ID);
        this.currentUserPhoto = localStorage.getItem(LoginString.PhotoURL);
        this.currentUserDocumentId = localStorage.getItem(LoginString.FirebaseDocumentId);

        this.currentUserMessages = []
        this.searchUsers = []
        this.notificationMessagesErase = []
        this.onProfileClick = this.onProfileClick.bind(this);
        this.getListUser = this.getListUser.bind(this);
        this.renderListUser = this.renderListUser.bind(this);
        this.getClassnameforUserandNotification = this.getClassnameforUserandNotification.bind(this);
        this.notificationErase = this.notificationErase.bind(this);
        this.updaterenderList = this.updaterenderList.bind(this);
    }
    logout=()=>{
        auth.signOut()
        this.props.history.push('/')
        localStorage.clear()
    }
    onProfileClick = ()=>{
        this.props.history.push('/profile');
    }
    componentDidMount(){
        console.log("HI");
        firestore.collection('users').doc(this.currentUserId).get()
        .then((doc)=>{
            doc.data().messages.map((item)=>{
                this.currentUserMessages.push({
                    notificationId: item.notificationId,
                    number: item.number
                })
            })
            this.setState({
                displayedContactSwitchedNotification: this.currentUserMessages
            })
        })
        console.log("HI1");
        this.getListUser()
        console.log("HI4");
        console.log(this.currentUserName)
    }
    getListUser =async()=>{
        console.log("HI5");
        const result = await firestore.collection('users').get()
        console.log("HI2");
        console.log(result)
        if(result >0){
            let listUsers = []
            listUsers = [...result.docs]
            listUsers.forEach((item, index)=>{
                this.searchUsers.push(
                    {
                        key: index,
                        documentKey: item.id,
                        id: item.data().id,
                        name: item.data().name,
                        messages: item.data().messages,
                        URL: item.data().URL,
                        description: item.data().description
                    }
                )
            })
            this.setState({
                isLoading:false
            })
        }
        this.renderListUser()
    }
    getClassnameforUserandNotification = (itemId)=>{
            let number = 0
            let className = ""
            let check = false;
            if(this.state.currentPeerUser && this.state.currentPeerUser.id === itemId){
                className = 'viewWrapItemFocused'
            }else {
                this.state.displayedContactSwitchedNotification.forEach((item)=>{
                    if(item.notificationId?.length > 0){
                        if(item.notificationId === itemId){
                            check = true
                            number = item.number
                        }
                    }
                })
                if(check === true){
                    className = "viewWrapItemNotification"
                }
                else {
                    className = 'viewWrapItem'
                }
            }
            return className
    }
    notificationErase=(itemId)=>{
        this.state.displayedContactSwitchedNotification.forEach((l)=>{
            if(l.notificationId?.length >0){
                if(l.notificationId != itemId){
                    this.notificationMessagesErase.push({
                        notificationId: l.notificationId,
                        number: l.number
                    })
                }
            }
        })
        this.updaterenderList()
    }
    
    updaterenderList=()=>{
        firestore.collection('users').doc(this.currentUserId).update(
            {messages: this.notificationMessagesErase}
        )
        this.setState({
            displayedContactSwitchedNotification: this.notificationMessagesErase
        })
    }
    renderListUser=()=>{
        if(this.searchUsers.length > 0){
            let viewListUser =[]
            let classname = ""
            this.searchUsers.map((item)=>{
                if(item.id != this.currentUserId){
                    classname = this.getClassnameforUserandNotification(item.id)
                    viewListUser.push(
                        <button 
                        id={item.key}
                        className={classname}
                        onClick = {()=>{
                            this.notificationErase(item.id)
                            this.setState({currentPeerUser:item})
                            document.getElementById(item.key).style.backgroundColor='#fff'
                            document.getElementById(item.key).style.color='#fff'
                        }}>
                            <img className="viewAvatarItem" 
                            src = {item.URL}
                            alt=""
                            />
                            <div className="viewWrapContentItem">
                                <span className="textItem">
                                    {`${item.name}`}

                                </span>
                            </div>
                            {classname === 'viewWrapItemNotification' ?
                            <div className="notification">
                            <p id = {item.key} className="newmessages">New message</p>
                            </div>: null}
                            
                        </button>
                    )
                }
            })
            this.setState({
                displayedContacts: viewListUser
            })

        }else{
            console.log("no user present");
        }
    }
    searchHandler=(event)=>{
        let searchQuery = event.target.value.toLowerCase(),
        displayedContacts=this.searchUsers.filter((l)=>{
            let SearchValue = l.name.toLowerCase();
            return SearchValue.indexOf(searchQuery) !== -1;
        })
        this.displayedContacts = displayedContacts
        this.displayedSearchedContacts()
    }
    displayedSearchedContacts=()=>{
        if(this.searchUsers.length > 0){
            let viewListUser =[]
            let classname = ""
            this.displayedContacts.map((item)=>{
                if(item.id != this.currentUserId){
                    classname = this.getClassnameforUserandNotification(item.id)
                    viewListUser.push(
                        <button 
                        id={item.key}
                        className={classname}
                        onClick = {()=>{
                            this.notificationErase(item.id)
                            this.setState({currentPeerUser:item})
                            document.getElementById(item.key).style.backgroundColor='#fff'
                            document.getElementById(item.key).style.color='#fff'
                        }}>
                            <img className="viewAvatarItem" 
                            src = {item.URL}
                            alt=""
                            />
                            <div className="viewWrapContentItem">
                                <span className="textItem">
                                    {`${item.name}`}

                                </span>
                            </div>
                            {classname === 'viewWrapItemNotification' ?
                            <div className="notification">
                            <p id = {item.key} className="newmessages">New message</p>
                            </div>: null}
                            
                        </button>
                    )
                }
            })
            this.setState({
                displayedContacts: viewListUser
            })

        }else{
            console.log("no user present");
        }
    }
    render(){
        return(
                <div  className="root">
                    <div className ="body">
                        <div className="viewListUser">
                            <div className="profileviewleftside">
                            <img className="ProfilePicture"
                            alt=""
                            src={this.currentUserPhoto}
                            onClick={this.onProfileClick}/>
                             
                    <button onClick={this.logout}>Logout</button>
                    </div>
                    <div className="rootsearchbar">
                        <div className="input-container">
                            <i class="fa fa-search icon">
                                <input class="input-field"
                                    type="text"
                                    onChange={this.searchHandler}
                                    placeholder="search"
                                />
                            </i>
                        </div>
                    </div>
                    {this.state.displayedContacts}
                        </div>
                        <div className="viewboard">
                            {this.state.currentPeerUser ? (
                                <ChatBox currentPeerUser ={this.state.currentPeerUser}
                                showToast={this.props.showToast}/>): (<Welcome 
                                currentUserName={this.currentUserName}
                                currentUserPhoto={this.currentUserPhoto}/>
                            )}
                        </div>
                    </div>
                   
                </div>
        )
    
    
    }
            
     
   
} 
