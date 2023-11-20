const express = require('express');
const config = require('config');
const app = express()
const mongoose = require('mongoose');
const cors = require('cors');
const events = require('events');
const User = require('./models/User');
const store = require('./redux/store');
// const filePathMiddleware = require('./middleware/filepath.middleware')
const PORT = process.env.PORT || config.get('serverPort')
// const path = require('path')

const emitter = new events.EventEmitter()

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Разрешаем доступ с этого домена
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Разрешенные методы
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Разрешенные заголовки
    next();
  });
app.use(cors());
app.use(express.json())

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
            const role = await User.create({role: req.body.role})
            await role.save();
            res.status(201).json(role)
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }else{
        res.status(400).json('ИЗИ ХАХАХАХА ИДИ НАХУЙ')
    }
})

app.get("/get-message", async (req,res) => {
    emitter.once("newMessage", (message) => {
        res.json(message)
    })
})

app.get("/get-messages", async (req,res) => {
    console.log(store.getState())
    res.json(store.getState())
})

app.post("/post-message",async (req,res) => {
    store.dispatch({type: "ADD_MESSAGE",payload: req.body})
    emitter.emit("newMessage", req.body)
    res.status(200)
    res.end()
})

app.delete("/delete-message/:mes", async (req, res) => {
    console.log(req.params.mes)
    emitter.removeListener("newMessage", req.params.mes);
    res.send("Unsubscribed from newMessage event");
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













// const express = require('express');
// const config = require('config');
// const app = express()
// const mongoose = require('mongoose');
// const cors = require('cors');
// const events = require('events');
// const User = require('./models/User');
// const store = require('./redux/store');

// const emitter = new events.EventEmitter()

// app.use(cors());
// app.use(express.json())

// app.use((req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // Разрешаем доступ с этого домена
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Разрешенные методы
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Разрешенные заголовки
//     next();
//   });

// app.patch('/patch-user/:userId', async (req, res) => {
//     if(config.get('secret') === req.body.secret){
//         const userId = req.params.userId;
//         const newRole = req.body.role;
//         try {
//             const updatedUser = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
//             if (!updatedUser) {
//                 return res.status(404).json({ message: 'Пользователь не найден' });
//             }
//             res.status(200).json({role:newRole,id: userId});
//         } catch (error) {
//             res.status(500).json({ message: 'Ошибка при обновлении роли пользователя', error: error.message });
//         }
//     }else{
//         res.status(400).json('Даже не думай')
//     }
// })

// app.post('/post-user', async (req, res) => {
//     if(config.get('secret') === req.body.secret){
//         try {
//             const role = await User.create({role: req.body.role})
//             await role.save();
//             res.status(201).json(role)
//         } catch (error) {
//             res.status(400).json({ message: error.message });
//         }
//     }else{
//         res.status(400).json('ИЗИ ХАХАХАХА ИДИ НАХУЙ')
//     }
// })

// app.get("/get-message", async (req,res) => {
//     emitter.once("newMessage", (message) => {
//         res.json(message)
//     })
// })

// app.get("/get-messages", async (req,res) => {
//     console.log(store.getState())
//     res.json(store.getState())
// })

// app.post("/post-message",async (req,res) => {
//     store.dispatch({type: "ADD_MESSAGE",payload: req.body})
//     emitter.emit("newMessage", req.body)
//     res.status(200)
//     res.end()
// })

// app.delete("/delete-message/:mes", async (req, res) => {
//     console.log(req.params.mes)
//     emitter.removeListener("newMessage", req.params.mes);
//     res.send("Unsubscribed from newMessage event");
// });

// const PORT = 443;

// async function start () {
//     try {
//         await mongoose.connect(config.get('mongoUri'))
//         app.listen(PORT, () => console.log(`за работу! ${443}`))
//     }catch (e) {
//         console.log('ашыбка',e.message)
//         process.exit(1)
//     }
// }

// start()
























// app.use(express.json({extended: true}))
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// const multer = require('multer');
// const Image = require('./models/image');
// const router = express.Router();
// router.post('/upload', upload.single('image'), async (req, res) => {
//   try {
//     const newImage = new Image({
//       name: req.file.originalname,
//       contentType: req.file.mimetype,
//       size: req.file.size,
//       data: req.file.buffer,
//     });
//     await newImage.save();
//     res.status(201).send('Image uploaded successfully');
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// router.get('/images', async (req, res) => {
//     try {
//       const images = await Image.find({});
//       const imagesWithBase64 = images.map((img) => ({
//         ...img.toObject(),
//         data: `data:${img.contentType};base64,${img.data.toString('base64')}`,
//       }));
//       res.status(200).json(imagesWithBase64);
//     } catch (error) {
//       res.status(500).send(error.message);
//     }
//   });

// app.use('/', router);