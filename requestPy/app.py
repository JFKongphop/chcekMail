from flask import Flask,  make_response ,jsonify
from flask_cors import CORS
import imaplib
import email
import hide
# import mysql.connector

app = Flask(__name__)
app.config['SECRET_KEY'] = 'somerandomstring'
app.config["JSON_AS_ASCII"] = False
CORS(app)


# def connectDatabase():
#     return mysql.connector.connect(
#         host = "localhost",
#         user = "root",
#         password = "",
#         db = "readEmail"
#     )






@app.route("/", methods=["GET"])
def index():
    imap_server = imaplib.IMAP4_SSL('imap.gmail.com')
    imap_server.login(hide.EMAIL, hide.PASSWORD)
    imap_server.select('INBOX')
    status, messages = imap_server.search(None, 'UNSEEN')
    message_ids = messages[0].split()

    
    if len(message_ids) != 0:
        try:
            emailList = []
            
            for message_id in message_ids:
                status, data = imap_server.fetch(message_id, '(RFC822)')
                message = email.message_from_bytes(data[0][1])

                date = message['Date']
                from_address = message['From']
                to_address = message['To']
                subject = message['Subject']
                body = message.get_payload()

                emailList.append({
                    "Date" : date,
                    "From" : from_address,
                    "To" : to_address,
                    "Subject" : subject,
                    "Body" : body
                })

                # mydb = connectDatabase()
                # mycursor = mydb.cursor(dictionary=True)
                # sql = "INSERT INTO insideEmail (date, from_address, to_address, subject, body) VALUES (%s, %s, %s, %s, %s)"
                # val = (date, from_address, to_address, subject, body)
                # mycursor.execute(sql, val)
                # mydb.commit()

            #imap_server.close()
            return make_response(jsonify({"message" : "Email is read", "inside" : emailList}), 200)
        
        except KeyError:
            return KeyError

    else:
        return "Done all read"


# @app.route("/isInside")
# def readApi():
#     mydb = connectDatabase()
#     myCursor = mydb.cursor(dictionary=True)
#     myCursor.execute("SELECT * FROM insideEmail")
#     myResult = myCursor.fetchall()
    
#     return make_response(jsonify(myResult), 200)

# http://127.0.0.1:5000/isInside

if __name__ == "__main__":
    app.run(Debug=True)