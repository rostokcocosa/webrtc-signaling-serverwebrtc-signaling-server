// signaling_server.js
// Этот файл содержит код простого сигнального сервера,
// который позволяет клиентам обмениваться WebRTC-сообщениями
// через Socket.io для установления peer-to-peer соединения.
// Теперь с поддержкой авторизации и адресной доставки сообщений.

// 1. Импортируем необходимые библиотеки
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// 2. Инициализируем Express-приложение и HTTP-сервер
const app = express();
const server = http.createServer(app);

// 3. Создаем Socket.io сервер.
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 4. Устанавливаем порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

// Хранилище для пользователей: логин -> id сокета
const users = {};
// Хранилище для обратного поиска: id сокета -> логин
const socketToUser = {};

function updateUserList() {
    const userList = Object.keys(users);
    io.emit('userList', userList);
}

// 5. Обрабатываем соединения Socket.io
io.on('connection', (socket) => {
    console.log('Новый клиент подключен:', socket.id);

    // Событие авторизации
    socket.on('login', (username) => {
        console.log(`Пользователь ${username} вошел в систему.`);
        users[username] = socket.id;
        socketToUser[socket.id] = username;
        updateUserList();
    });

    // Слушаем сообщения от клиента.
    socket.on('message', (message) => {
        console.log(`Сообщение от ${message.sender} для ${message.target}:`, message.type);
        // Отправляем сообщение только целевому пользователю
        const targetSocketId = users[message.target];
        if (targetSocketId) {
            io.to(targetSocketId).emit('message', message);
        }
    });

    // Обрабатываем отключение клиента
    socket.on('disconnect', () => {
        const username = socketToUser[socket.id];
        if (username) {
            console.log(`Пользователь ${username} отключен.`);
            delete users[username];
            delete socketToUser[socket.id];
            updateUserList();
        } else {
            console.log('Клиент отключен:', socket.id);
        }
    });
});

// 6. Запускаем сервер
server.listen(PORT, () => {
    console.log(`Сигнальный сервер запущен на порту ${PORT}`);
    console.log('Чтобы запустить клиент, откройте HTML-файл в двух разных вкладках браузера.');
});
