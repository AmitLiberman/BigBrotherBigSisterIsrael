import React, { Component } from "react";
import firebase from "../../config/Firebase"
import "./LinkUsers.css";

class LinkUsers extends Component {
    constructor() {
        super();
        this.state = {
            studentId: "",
            mentorId: "",
            studentName: "",
            mentorName: "",
            studentRef: "",
            mentorRef: "",
            people:[]
        }
        this.usersRef = firebase.firestore().collection('Users');
    }
    componentDidMount() {
        this.usersRef
            .get()
            .then(queryShot => {
                queryShot.forEach(
                    (doc) => {
                        this.setState({ people: [...this.state.people, doc.data()] })
                    }
                )
            })
            .catch((e) => console.log(e.name));

    }
    isValid = (querySnapshot, type) => {
        if (querySnapshot.empty) {
            alert("ה" + type + " לא קיים במערכת")
            throw Error(500);
        }
        querySnapshot.forEach(doc => {
            if (doc.data().type !== type) {
                alert("המשתמש אינו " + type);
                throw Error(500);
            }
            if (doc.data().link_user != null && doc.data().link_user !== "") {
                alert("המשתמש כבר מחובר");
                throw Error(500);
            }
            if (type === "חניך")
                this.setState({ studentRef: doc.ref.id, studentName: doc.data().fName + " " + doc.data().lName })
            else if (type === "חונך")
                this.setState({ mentorRef: doc.ref.id, mentorName: doc.data().fName + " " + doc.data().lName })
        });
    }

    verifyUsers = () => {
        var studentId = this.state.studentId;
        var mentorId = this.state.mentorId;
        this.usersRef.where('id', '==', studentId)
            .limit(1)
            .get()
            .then((querySnapshot) => this.isValid(querySnapshot, "חניך"))
            .then(() => this.usersRef.where('id', '==', mentorId)
                .limit(1)
                .get()
                .then((querySnapshot) => this.isValid(querySnapshot, "חונך")))
            .then(() => {
                var con = window.confirm("האם אתה בטוח לבצונך לקשר את החונך " + this.state.mentorName + " לחניך " + this.state.studentName + "?")
                if (con) {
                    this.linkUser(studentId);
                    this.linkUser(mentorId);
                    console.log("המשתמשים עודכנו בהצלחה!");
                    alert("עודכן בהצלחה!\n" + this.state.mentorName + " הוא החונך של " + this.state.studentName + ".");
                    this.setState({ studentId: "", mentorId: "" });
                }
            })
            .catch(() => console.log("Error in adding new user"));
    }

    linkUser = (curr) => {
        var studentId = this.state.studentId;
        var mentorId = this.state.mentorId;
        var studentRef = this.state.studentRef;
        var mentorRef = this.state.mentorRef;
        this.usersRef.where('id', '==', curr)
            .limit(1)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (curr === studentId)
                        doc.ref.update({ link_user: mentorRef })
                    else if (curr === mentorId)
                        doc.ref.update({ link_user: studentRef })
                }
                );
            }).catch((e) => console.log(e.name));
    }

    addLink = (event) => {
        event.preventDefault();
        this.verifyUsers();
    }

    render() {
        return (
            <form className="ad-user-form" onSubmit={this.addLink}>
                <header className="title">
                    <h1 className="add-user-h">
                        <u> קישור חניך לחונך</u>
                    </h1>
                </header>
                <div className="form-row">
                    <div className="form-group col-md-6">
                        <label className="first-link-input-btn" htmlFor="inputLinkFirstName">תעודת זהות חניך</label>
                        <input
                            required
                            type="number"
                            className="form-control"
                            id="inputLinkFirstName"
                            value={this.state.studentId}
                            placeholder="תעודת זהות חניך"
                            title="שם פרטי"
                            onChange={(e) => this.setState({ studentId: e.target.value })}
                        />
                        <br/>
                        <table className="table table-bordered">
                            <thead>
                            <tr>
                                <th>ת.ז</th>
                                <th>שם</th>
                                <th>דוא"ל</th>
                                <th>בחר</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.renderFirstTable()}
                            </tbody>
                        </table>
                    </div>
                    <div className="form-group col-md-6">
                        <label className="last-link-input-btn" htmlFor="inputLinkLastName">תעודת זהות חונך</label>
                        <input
                            required
                            type="number"
                            className="form-control"
                            id="inputLinkLastName"
                            value={this.state.mentorId}
                            placeholder="תעודת זהות חונך"
                            onChange={(e) => this.setState({ mentorId: e.target.value })}
                        />
                        <br/>
                        <table className="table table-bordered">
                            <thead>
                            <tr>
                                <th>ת.ז</th>
                                <th>שם</th>
                                <th>דוא"ל</th>
                                <th>בחר</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.renderSecondTable()}
                            </tbody>
                        </table>
                        <button type="submit" className="btn btn-primary link-users-btn">
                            הוסף קישור
                         </button>
                    </div>
                </div>
            </form>
        );
    }
    renderFirstTable (){
        return (this.state.people
            .filter(person => person.type ==="חניך")
            .map((person) => (
                <tr><td>{person.id}</td><td>{person.name}</td><td>{person.email}</td>
                    <td person_id={person.id}><input type='checkbox' className='people_check' /></td></tr>
            )))
    }
    renderSecondTable (){
        return (this.state.people
            .filter(person => person.type ==="חונך")
            .map((person) => (
                <tr><td>{person.id}</td><td>{person.name}</td><td>{person.email}</td>
                    <td person_id={person.id}><input type='checkbox' className='people_check' /></td></tr>
            )))
    }

}

export default LinkUsers;