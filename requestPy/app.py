from flask import Flask,  make_response ,jsonify
from flask_cors import CORS
import imaplib
import email
import hide
import re


app = Flask(__name__)
app.config['SECRET_KEY'] = 'somerandomstring'
app.config["JSON_AS_ASCII"] = False
CORS(app)

# find the postion of the body to slice it
def wordPostions(body, wordSearch):
    results = [m.start() for m in re.finditer(f"(?={wordSearch})", str(body))]

    return results

# filter the body from the message when it send from normal email
def bodyFilter(body):
    wordToFind = "Content-Type"
    body = str(body)
    allWordsPos = wordPostions(body, wordToFind)
    pos1 = allWordsPos[1] + 43
    pos2 = allWordsPos[2] - 33
    bodyContent = body[pos1:pos2]

    return bodyContent


@app.route("/", methods=["GET"])
def index():

    # permanent login gmail
    imap_server = imaplib.IMAP4_SSL('imap.gmail.com')
    imap_server.login(hide.EMAIL, hide.PASSWORD)
    imap_server.select('INBOX')
    status, messages = imap_server.search(None, 'UNSEEN')
    message_ids = messages[0].split()

    # check amount of email indox that unseen
    if len(message_ids) != 0:
        try:
            emailList = []
            
            for message_id in message_ids:
                status, data = imap_server.fetch(message_id, '(RFC822)')
                message = email.message_from_bytes(data[0][1])

                # set the element in gmail
                date = message['Date']
                from_address = message['From']
                to_address = message['To']
                subject = message['Subject']

                # seperate the decide from send body email 
                bodyMessage = ""

                # send by casual device
                try :
                    bodyMessage = bodyFilter(message)

                # send by script such as .py or .js
                except :
                    bodyMessage = message.get_payload()

                # set it to array from each context
                emailList.append({
                    "date" : date,
                    "from" : from_address,
                    "to" : to_address,
                    "subject" : subject,
                    "body" : bodyMessage
                })

            return make_response(jsonify({"inside" : emailList}), 200)
        
        except KeyError:
            return KeyError

    else:
        return make_response(jsonify({"inside" : "All mails are read"}), 200)


# if __name__ == "__main__":
#     app.run(Debug=True)

app.run()