const express = require('express');
const config = require('config');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const events = require('events');
const User = require('./models/User');
const Message = require('./models/Message');
// const store = require('./redux/store');
const cron = require('node-cron');
const blockquotes = require('./blockquotes')

const emitter = new events.EventEmitter()

const PORT = 5000


  app.use(express.json());
  app.use(cors());
//   app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Разрешаем доступ с этого домена
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Разрешенные методы
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Разрешенные заголовки
//     next();
//   });


  
  app.patch('/patch-user/:userId', async (req, res) => {
      if(config.get('secret') === req.body.secret){
          const userId = req.params.userId;
          const newRole = req.body.role;
          try {
              const updatedUser = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
              if (!updatedUser) {
                  return res.status(404).json({ message: 'Пользователь не найден' });
              }
              res.status(200).json({role:newRole,id: userId});
          } catch (error) {
              res.status(500).json({ message: 'Ошибка при обновлении роли пользователя', error: error.message });
          }
      }else{
          res.status(400).json('Даже не думай')
      }
  })
  app.post('/post-user', async (req, res) => {
      if(config.get('secret') === req.body.secret){
          try {
              const role = await User.create({role: req.body.role});
              await role.save();
              res.status(201).json(role)
          } catch (error) {
              res.status(400).json(error);
              console.log(error)
          }
      }else{
          res.status(400).json('не пройдёшь')
      }
  })
  app.post("/post-update-array",async (req,res) => {
      const messages = await Message.find({});
      emitter.emit('updateArray', messages);
      res.status(200).json(messages).end()
  })
  app.get("/get-update-array",async (req,res) => {
      emitter.once('updateArray', (m) => {
          res.json(m); 
      });
  })
  app.get("/get-message", async (req,res) => {
      try{
          emitter.once("newMessage", (message) => {
              res.json(message)
          })
      }catch (e) {
          console.log(e);
      }
  })
  app.get("/get-messages", async (req,res) => {
    try{
      const messages = await Message.find({});
      console.log(...new Set(messages))
      res.json(messages)
      res.end()
    }catch (e) {
        console.log(e);
        res.json(e)
    }
  })
  app.post("/post-message",async (req,res) => {
      const message = await Message.create(req.body);
      await message.save();
      emitter.emit("newMessage", req.body)
      res.status(200)
      res.end()
  })
  app.delete("/delete-message/:id/:from", async (req, res) => {
      try{
          await Message.findOneAndDelete({
            from: req.params.from,
            id: req.params.id
          });
          const messages = await Message.find({});
          res.json([messages,{from: req.params.from, id: req.params.id}]);
      }catch (e){
          console.log(e);
      }
  })
  app.patch('/commit-rep/:rep/:mes/:def', async (req, res) => {
    try{
        console.log({rep: req.params.rep === 'false' ? false : true, mes: JSON.parse(req.params.mes)})
        store.dispatch({type: "COMMIT_REP", payload: {rep: req.params.rep === 'false' ? false : true, mes: JSON.parse(req.params.mes), def: req.params.def}})
        if(req.params.rep === 'false' ? false : true){
          if(req.params.def === 'likes'){
            await Message.findByIdAndUpdate(JSON.parse(req.params.mes),{ $inc: { likes: 1 } },{ new: true });
          }else{
            await Message.findByIdAndUpdate(JSON.parse(req.params.mes),{ $inc: { dislikes: 1 } },{ new: true });
          }
        }else{
          if(req.params.def === 'likes'){
            await Message.findByIdAndUpdate(JSON.parse(req.params.mes),{ $inc: { likes: -1 } },{ new: true });
          }else{
            await Message.findByIdAndUpdate(JSON.parse(req.params.mes),{ $inc: { dislikes: -1 } },{ new: true });
          }
        }
        res.json()
    }catch (e){
        res.json(e)
        console.log(e)
    }
  })

cron.schedule('0 * * * *', () => {
    let randomPhrase = blockquotes[Math.floor(Math.random() * blockquotes.length)]
    const message = {role:'Царь',from:'SuspectBot',value: randomPhrase,id: Date.now(),roleOfChat:'SuspectBot',likes:0,dislikes:0};

    // Отправка сообщения по маршруту "/post-message"
    store.dispatch({ type: "ADD_MESSAGE", payload: message });
    emitter.emit("newMessage", message);
});

async function start () {
    try {
        await mongoose.connect(config.get('mongoUri'))
        app.listen(PORT, () => console.log(`за работу! ${PORT}`))
    }catch (e) {
        console.log('ашыбка',e.message)
        process.exit(1)
    }
}

start()