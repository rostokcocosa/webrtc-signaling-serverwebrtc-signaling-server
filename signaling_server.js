// signaling_server.js
// Этот файл содержит код простого сигнального сервера,
// который позволяет двум клиентам обмениваться WebRTC-сообщениями.

// 1. Импортируем необходимые библиотеки
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

// 2. Инициализируем Express-приложение и HTTP-сервер
const app = express();
const server = http.createServer(app);

// 3. Создаем Socket.io сервер, который слушает HTTP-сервер
const io = socketIo(server, {
    cors: {
        // Разрешаем подключения с любого домена. В продакшене лучше ограничить домены.
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// 4. Устанавливаем порт, на котором будет работать сервер
const PORT = process.env.PORT || 3000;

// 5. Обрабатываем соединения Socket.io
io.on('connection', (socket) => {
    console.log('Новый клиент подключен:', socket.id);

    // Логика сигнализации:
    // Когда один клиент отправляет сообщение, сервер пересылает его всем другим клиентам,
    // находящимся в той же комнате (в данном случае, всем, кто подключен).
    // Это простое решение для двухстороннего звонка.
    socket.on('message', (message) => {
        console.log('Сообщение от клиента:', socket.id, message);
        // Пересылаем сообщение всем, кроме отправителя
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

