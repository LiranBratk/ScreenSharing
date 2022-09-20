// Map All HTML Elements
const videoGrid = document.getElementById('video-grid');
const localVideo = document.getElementById('local-video');
const wsPort = document.currentScript.getAttribute('wsPort') == "NaN" ? 3001 : document.currentScript.getAttribute('wsPort')
const wsLink = document.currentScript.getAttribute('wsLink') == "NaN" ? `${window.location.protocol}//${window.location.hostname}:${wsPort}` : document.currentScript.getAttribute('wsLink')

document.getElementById('submitname').onclick = () => {
    let name = document.getElementById('full_name').value
    if (name.length > 0) {
        document.getElementById("initializtion").style = "display:none;"
    }
    startShareScreen();
}


function startShareScreen() {
    // Open Camera To Capture Audio and Video
    navigator.mediaDevices.getDisplayMedia({
        video: {
            cursor: "always"
        },
        audio: false
    })
        .then(stream => {
            // Show My Video
            videoGrid.style.display = 'grid';
            localVideo.srcObject = stream;

            // Start a Peer Connection to Transmit Stream
            initConnection(stream);
        })
        .catch(error => console.log(error));

    const initConnection = (stream) => {
        const socket = io(wsLink) // io('http://localhost:3001');
        let localConnection;
        let remoteConnection;
        let name = document.getElementById('full_name').value

        // Start a RTCPeerConnection to each client
        socket.on('other-users', (otherUsers) => {
            // Ignore when not exists other users connected
            if (!otherUsers || !otherUsers.length) return;

            const socketId = otherUsers[otherUsers.length - 1];

            socket.emit("appendname", socketId, name)

            // Ininit peer connection
            localConnection = new RTCPeerConnection();

            // Add all tracks from stream to peer connection
            stream.getTracks().forEach(track => localConnection.addTrack(track, stream));

            // Send Candidtates to establish a channel communication to send stream and data
            localConnection.onicecandidate = ({ candidate }) => {
                candidate && socket.emit('candidate', socketId, candidate);
            };

            // Receive stream from remote client and add to remote video area
            localConnection.ontrack = ({ streams: [stream] }) => {
                remoteVideo.srcObject = stream;
            };

            // Create Offer, Set Local Description and Send Offer to other users connected
            localConnection
                .createOffer()
                .then(offer => localConnection.setLocalDescription(offer))
                .then(() => {
                    socket.emit('offer', socketId, localConnection.localDescription);
                });
        });

        // Receive Offer From Other Client
        socket.on('offer', (socketId, description) => {
            // Ininit peer connection
            remoteConnection = new RTCPeerConnection();

            // Add all tracks from stream to peer connection
            stream.getTracks().forEach(track => remoteConnection.addTrack(track, stream));

            // Send Candidtates to establish a channel communication to send stream and data
            remoteConnection.onicecandidate = ({ candidate }) => {
                candidate && socket.emit('candidate', socketId, candidate);
            };

            // Receive stream from remote client and add to remote video area
            remoteConnection.ontrack = ({ streams: [stream] }) => {
                remoteVideo.srcObject = stream;
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

        stream.getVideoTracks()[0].onended = () => {
            console.log("stop sharing")
            socket.disconnect()
        }
    }
}
