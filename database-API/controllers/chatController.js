const Chat = require("../models/chatModel")

const addChat = async (req, res) => {
  // destructure email and password from request body
  const { sender, receiver, message } = req.body
  const members = [sender, receiver]
  members.sort()

  try {
    console.log(members)
    await Chat.findOneAndUpdate(
      { members: members },
      { "$push": { "messageLog": message} }
    )
    res.status(200).json({ members, message })
  } catch (err) {
    console.error(err)
    try {
        const chat = new Chat({
          members: members,
          messageLog: [message]
        })
        await chat.save()
        res.status(201).json({ members, message })
    }
    catch {
        console.error("Could not create new chat")
        res.status(400).json({ err })
    }
  }
}
  
const getChatHistory = async (req, res) => {
    const { sender, receiver} = req.body
    const members = [sender, receiver]
    members.sort()

    try {
        const chat = await Chat.findOne({ members })
        
        if (chat) {
          console.log('chat exists already - responding with messageLog')
          const messageLog = chat['messageLog']
          console.log(messageLog)
          res.status(200).json({ members, messageLog })
        }

        else {
          console.log('chat does not exist - making a new chat')
          const messageLog = []
          const chat = new Chat({
            members,
            messageLog
          })
          console.log('made new chat')
          console.log(chat)
          await chat.save()
          res.status(201).json({ members, messageLog: [] })
        }

    }
    catch (err) {
      console.error('Could not create new chat: ', err)
      res.status(400).json({ err })
    }
}

module.exports = {
  addChat,
  getChatHistory
}