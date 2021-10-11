const userSocketMap = new Map();

function getKeyByValue(val) {
    for (let [key, value] of userSocketMap) {
        for (let i of value) if (i === val) return key;
    }
    return null;
}

function addUserSocket(user, socket) {
    const userId = String(user._id);
    if (userSocketMap.has(userId))
        userSocketMap.set(userId, [...userSocketMap.get(userId), socket.id]);
    else userSocketMap.set(userId, [socket.id]);
}

function removeUserSocket(socket) {
    const userId = getKeyByValue(socket.id);
    // if (!userId) return;
    const newSockets = userSocketMap.get(userId).filter((s) => s !== socket.id);
    userSocketMap.set(userId, newSockets);
    if (newSockets.length === 0) userSocketMap.delete(userId);
}

function onlineUserList() {
    const onlineUserList = [];
    for (let [userId, socketList] of userSocketMap) {
        if (socketList.length !== 0) onlineUserList.push(userId);
    }
    return onlineUserList;
}

module.exports = {
    userSocketMap,
    getKeyByValue,
    addUserSocket,
    removeUserSocket,
    onlineUserList,
};
