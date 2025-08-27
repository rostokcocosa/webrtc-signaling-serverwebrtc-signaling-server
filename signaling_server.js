// signaling_server.js
// Этот файл содержит код простого сигнального сервера,
// который позволяет двум клиентам обмениваться WebRTC-сообщениями
// через Socket.io для установления peer-to-peer соединения.

// 1. Импортируем необходимые библиотеки
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// 2. Инициализируем Express-приложение и HTTP-сервер
const app = express();
const server = http.createServer(app);

// 3. Создаем Socket.io сервер.
// Включаем CORS, чтобы разрешить запросы с других доменов (например, вашего HTML-файла)
const io = socketIo(server, {
    cors: {
        origin: "*", // Разрешаем доступ с любого домена. В продакшене лучше указать конкретный домен.
        methods: ["GET", "POST"]
    }
});

// 4. Устанавливаем порт, на котором будет работать сервер
// Heroku и Render используют переменную среды PORT, поэтому мы должны использовать ее.
const PORT = process.env.PORT || 3000;

// 5. Обрабатываем соединения Socket.io
io.on('connection', (socket) => {
    console.log('Новый клиент подключен:', socket.id);

    // Слушаем сообщения от клиента.
    // Сообщение может быть WebRTC 'offer', 'answer' или 'candidate'.
    socket.on('message', (message) => {
        console.log('Сообщение от клиента:', socket.id, message.type);
        // Пересылаем сообщение всем, кроме отправителя.
        // Это простейший механизм сигнализации для 1-к-1 звонка.
        socket.broadcast.emit('message', message);
    });

    // Обрабатываем отключение клиента
    socket.on('disconnect', () => {
        console.log('Клиент отключен:', socket.id);
    });
});

// 6. Запускаем сервер
server.listen(PORT, () => {
    console.log(`Сигнальный сервер запущен на порту ${PORT}`);
    console.log('Чтобы запустить клиент, откройте HTML-файл в двух разных вкладках браузера.');
});
