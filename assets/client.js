(async () => {
    var token;
    var you;
    const res = await Swal.fire({
        title: "Whats your name?",
        input: "text",
        text: "Enter your name to start chatting...",
        icon: "question",
        allowOutsideClick: false,
        confirmButtonText: "Enter",
        inputValidator: async (value) => {
            try {
                const res = await axios.post("/api/v1/auth/login", {
                    username: value,
                });
                token = res.data.token;
                you = value;
            } catch (err) {
                if (err.response) return err.response.data.message;
                return err.message;
            }
        },
    });
    console.log("Got token:", token);
    const socket = io(undefined, {
        query: { token },
    });

    socket.once("connect", () => {
        console.log("Connected to server!");
        writeToMessageList(`<i>You joined the chat!<i/>`, true);
        socket.on("chat message", function (data) {
            writeMessage(data.username, data.msg);
        });
        socket.on("user joined", function (username) {
            writeToMessageList(`<i>${username} joined</i>`, true);
        });
        socket.on("user left", function (username) {
            writeToMessageList(`<i>${username} left</i>`, true);
        });
    });

    socket.on("disconnect", () => {
        writeToMessageList(
            `<i>You disconnected due to a bad internet connection</i>`,
            true
        );
    });
    socket.on("reconnect", () => {
        writeToMessageList(`<i>You reconnected!</i>`, true);
    });

    const message = {
        list: document.getElementById("messages"),
        form: document.getElementById("form"),
        input: document.getElementById("input"),
    };

    message.form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (message.input.value) {
            socket.emit("chat message", message.input.value);
            writeMessage(`You`, message.input.value);
            message.input.value = "";
        }
    });

    function writeToMessageList(content, allowFormatting) {
        var item = document.createElement("li");
        if (allowFormatting) item.innerHTML = content;
        else item.textContent = content;
        message.list.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    }

    function writeMessage(from, message) {
        writeToMessageList(`<b>${from}</b>: ${escapeHtml(message)}`, true);
    }

    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
})();
