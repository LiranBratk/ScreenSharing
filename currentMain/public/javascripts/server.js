/* const Peer = window.SimplePeer;

document.getElementById("createPeer").onclick = () => {
    var peer = new Peer() //Receiver
    console.log(peer)

    peer.on('signal', data => {
        console.log(`Succeed ${new Date().getTime()}`)
    })

} */

// Map All HTML Elements
const videoGrid = document.getElementById('video-grid');
// const localVideo = document.getElementById('local-video');
// const remoteVideo = document.getElementById('remote-video');

const logMessage = (message) => {
    const newMessage = document.createElement('div');
    newMessage.innerText = message;
    messagesEl.appendChild(newMessage);
};


const socket = io('http://localhost:3001');
let localConnection;
let remoteConnection;
let localChannel;
let remoteChannel;

const stunServerConfig = {
    iceServers: [{
        urls: 'turn:13.250.13.83:3478?transport=udp',
        username: "YzYNCouZM1mhqhmseWk6",
        credential: "YzYNCouZM1mhqhmseWk6"
    }]
};

function createVideoElem(id, name) {
    let div = document.createElement("div")
    div.id = `DIV${id}`
    div.classList.add("overlay")

    let newVideo = document.createElement("video")
    newVideo.id = id

    let h2 = document.createElement("h2")
    h2.id = `H2${id}`

    div.appendChild(h2);
    div.appendChild(newVideo);
    videoGrid.appendChild(div);

    document.getElementById(`H2${id}`).innerText = name
    console.log(name)
}

function appendNameToVideo(id, name) {
    let div = document.getElementById(`DIV${id}`)
    let h2 = document.createElement("h2")
    h2.id = `H2${id}`
    div.appendChild(h2);
    document.getElementById(`H2${id}`).value = name
}

// Start a RTCPeerConnection to each client
socket.on('other-users', (otherUsers) => {

    console.log(otherUsers, "OTHER-USERS")

    // Ignore when not exists other users connected
    if (!otherUsers || !otherUsers.length) return;

    const socketId = otherUsers[0];

    // var newChannel;

    // if (!document.getElementById(otherUsers[otherUsers[0].length - 1])) {
    //     createVideoElem(otherUsers[otherUsers[0].length - 1])
    // }

    let newChannel = document.getElementById(otherUsers[otherUsers[0].length - 1]);

    newChannel.autoplay = true;

    // Initiate peer connection
    localConnection = new RTCPeerConnection();

    // Send Candidtates to establish a channel communication to send stream and data
    localConnection.onicecandidate = ({ candidate }) => {
        console.log("icecandidate")
        candidate && socket.emit('candidate', socketId, candidate);
    };

    // Receive stream from remote client and add to remote video area
    localConnection.ontrack = ({ streams: [stream] }) => {
        console.log("ontrack")
        console.log(newChannel)
        newChannel.srcObject = stream;
    };

    // Create Offer, Set Local Description and Send Offer to other users connected
    localConnection
        .createOffer()
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => {
            socket.emit('offer', socketId, localConnection.localDescription);
        });
});

socket.on('appendname', (socketId, name) => {
    console.log(socketId, name);
    createVideoElem(socketId, name)
});

// Receive Offer From Other Client
socket.on('offer', (socketId, description, otherSocketID) => {
    // Ininit peer connection
    remoteConnection = new RTCPeerConnection();

    // var newChannel; // = document.querySelector("#video-grid").children[document.querySelector("#video-grid").children.length - 1];

    // console.log(`Socket ${otherSocketID} ${socketId}`)
    // if (!document.getElementById(socketId)) {
    //     newChannel = createVideoElem(socketId)
    // }
    let newChannel = document.getElementById(socketId);

    newChannel.playsinline = true;
    newChannel.autoplay = true;
    newChannel.muted = true;

    // Add all tracks from stream to peer connection
    // stream.getTracks().forEach(track => remoteConnection.addTrack(track, stream));

    // Send Candidtates to establish a channel communication to send stream and data
    remoteConnection.onicecandidate = ({ candidate }) => {
        console.log("offer icecandidate")
        candidate && socket.emit('candidate', socketId, candidate);
    };

    // Receive stream from remote client and add to remote video area
    remoteConnection.ontrack = ({ streams: [stream] }) => {
        console.log("offer ontrack")
        console.log(newChannel)
        newChannel.srcObject = stream;
    };

    // Set Local And Remote description and create answer
    remoteConnection
        .setRemoteDescription(description)
        .then(() => remoteConnection.createAnswer())
        .then(answer => remoteConnection.setLocalDescription(answer))
        .then(() => {
            socket.emit('answer', socketId, remoteConnection.localDescription);
        });
});

// Receive Answer to establish peer connection
socket.on('answer', (description) => {
    localConnection.setRemoteDescription(description);
});

// Receive candidates and add to peer connection
socket.on('candidate', (candidate) => {
    // GET Local or Remote Connection
    const conn = localConnection || remoteConnection;
    conn.addIceCandidate(new RTCIceCandidate(candidate));
});

socket.on('destroyed', (socketId) => {
    let videoDiv = document.getElementById(`DIV${socketId}`);
    videoDiv.remove();
});