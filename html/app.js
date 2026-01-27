// Generate Room Code
function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({length: 6}, () => 
        chars[Math.floor(Math.random() * chars.length)]
    ).join('');
}

// Modal Functions
function openRoomTypeModal() {
    document.getElementById('roomTypeModal').classList.add('active');
}

function openJoinRoomModal() {
    document.getElementById('joinRoomModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Create Room
async function createRoom(type, userId, username) {
    const code = generateRoomCode();
    
    try {
        const database = firebase.database();
        await database.ref('rooms/' + code).set({
            code: code,
            type: type,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            isActive: true,
            lastActivity: Date.now(),
            members: {
                [userId]: {
                    username: username,
                    joinedAt: Date.now()
                }
            }
        });
        
        closeModal('roomTypeModal');
        showToast(`สร้างห้อง ${type} สำเร็จ! โค้ด: ${code}`, 'success');
        
        // Redirect to room page
        setTimeout(() => {
            window.location.href = `RoomPage.html?code=${code}&type=${type}`;
        }, 1500);
        
        return code;
    } catch (error) {
        console.error('Create room error:', error);
        showToast('เกิดข้อผิดพลาดในการสร้างห้อง', 'error');
        return null;
    }
}

// Random Match - แก้ไขให้ทำงานได้ถูกต้อง
async function randomMatch(userId, username) {
    showToast('🎲 กำลังค้นหาห้องที่เหมาะสม...', 'info');
    
    try {
        const database = firebase.database();
        
        // ดึงห้องทั้งหมดจาก Firebase
        const roomsSnapshot = await database.ref('rooms').once('value');
        const allRooms = roomsSnapshot.val() || {};
        
        // กรองห้องที่ active และยังไม่เต็ม
        const availableRooms = Object.entries(allRooms).filter(([roomId, room]) => {
            if (!room || !room.isActive) return false;
            
            const memberCount = room.members ? Object.keys(room.members).length : 0;
            const maxMembers = room.type === 'oneOnOne' ? 2 : 5;
            const isNotFull = memberCount < maxMembers;
            const notCreatedByMe = room.createdBy !== userId;
            
            return isNotFull && notCreatedByMe;
        });

        let targetRoomCode;

        if (availableRooms.length > 0) {
            // มีห้องที่พร้อมให้เข้า - สุ่มเลือกห้อง
            const randomIndex = Math.floor(Math.random() * availableRooms.length);
            const [roomCode, roomData] = availableRooms[randomIndex];
            targetRoomCode = roomCode;
            
            // เข้าร่วมห้องที่มีอยู่
            await database.ref(`rooms/${roomCode}/members/${userId}`).set({
                username: username,
                joinedAt: Date.now()
            });
            
            // อัพเดทเวลากิจกรรมล่าสุด
            await database.ref(`rooms/${roomCode}/lastActivity`).set(Date.now());
            
            showToast(`✅ พบห้อง! กำลังเข้าร่วม...`, 'success');
        } else {
            // ไม่มีห้องที่เหมาะสม - สร้างห้องใหม่ทันที
            targetRoomCode = generateRoomCode();
            
            await database.ref('rooms/' + targetRoomCode).set({
                code: targetRoomCode,
                type: 'random',
                createdBy: userId,
                createdAt: new Date().toISOString(),
                isActive: true,
                lastActivity: Date.now(),
                members: {
                    [userId]: {
                        username: username,
                        joinedAt: Date.now()
                    }
                }
            });
            
            showToast('✨ สร้างห้องใหม่สำเร็จ! รอคนอื่นเข้าร่วม...', 'success');
        }

        // เข้าห้องทันที
        setTimeout(() => {
            window.location.href = `RoomPage.html?code=${targetRoomCode}&type=random`;
        }, 1500);

    } catch (error) {
        console.error('Random match error:', error);
        showToast('❌ เกิดข้อผิดพลาดในการจับคู่', 'error');
    }
}

// Join Room
async function joinRoom(roomCode, userId, username) {
    if (!roomCode || roomCode.length !== 6) {
        showToast('กรุณากรอกโค้ดให้ครบ 6 ตัว', 'error');
        return false;
    }
    
    try {
        const database = firebase.database();
        const roomRef = database.ref('rooms/' + roomCode);
        const snapshot = await roomRef.once('value');
        
        if (snapshot.exists()) {
            // เพิ่มผู้ใช้เข้าห้อง
            await database.ref(`rooms/${roomCode}/members/${userId}`).set({
                username: username,
                joinedAt: Date.now()
            });
            
            // อัพเดทเวลากิจกรรมล่าสุด
            await database.ref(`rooms/${roomCode}/lastActivity`).set(Date.now());
            
            closeModal('joinRoomModal');
            showToast(`กำลังเข้าห้อง ${roomCode}...`, 'info');
            
            setTimeout(() => {
                window.location.href = `RoomPage.html?code=${roomCode}&type=join`;
            }, 1500);
            
            return true;
        } else {
            showToast('ไม่พบห้องนี้ กรุณาตรวจสอบโค้ดอีกครั้ง', 'error');
            return false;
        }
    } catch (error) {
        console.error('Join room error:', error);
        showToast('เกิดข้อผิดพลาดในการเข้าห้อง', 'error');
        return false;
    }
}

// Toast Notification
function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-green-100 border-green-500 text-green-700',
        error: 'bg-red-100 border-red-500 text-red-700',
        info: 'bg-blue-100 border-blue-500 text-blue-700'
    };
    
    const toast = document.createElement('div');
    toast.className = `${colors[type]} border-2 rounded-lg p-4 mb-2 shadow-lg`;
    toast.style.animation = 'slideIn 0.3s ease-out';
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer');
    if (container) {
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Room Cleanup System - ลบห้องที่ไม่มีคนอยู่เกิน 3 นาที
function startRoomCleanupSystem() {
    console.log('🧹 Room cleanup system started');
    
    const database = firebase.database();
    
    // ตรวจสอบทุก 1 นาที
    setInterval(async () => {
        try {
            const roomsSnapshot = await database.ref('rooms').once('value');
            const allRooms = roomsSnapshot.val() || {};
            const now = Date.now();
            const threeMinutes = 3 * 60 * 1000; // 3 นาที
            const tenMinutes = 10 * 60 * 1000; // 10 นาที

            for (const [roomCode, room] of Object.entries(allRooms)) {
                if (!room) continue;
                
                // ตรวจสอบว่าห้องว่างหรือไม่
                const memberCount = room.members ? Object.keys(room.members).length : 0;
                
                if (memberCount === 0) {
                    const createdAt = new Date(room.createdAt).getTime();
                    const roomAge = now - createdAt;
                    
                    // ถ้าห้องว่างเกิน 3 นาที ให้ลบทิ้ง
                    if (roomAge > threeMinutes) {
                        await database.ref('rooms/' + roomCode).remove();
                        console.log(`🗑️ Deleted empty room: ${roomCode} (empty for ${Math.round(roomAge/60000)} minutes)`);
                    }
                }
                // ตรวจสอบห้องที่ไม่มีกิจกรรม
                else if (room.lastActivity) {
                    const lastActivity = room.lastActivity;
                    const inactiveTime = now - lastActivity;
                    
                    // ถ้าไม่มีกิจกรรมเกิน 10 นาที ให้ลบทิ้ง
                    if (inactiveTime > tenMinutes) {
                        await database.ref('rooms/' + roomCode).remove();
                        console.log(`🗑️ Deleted inactive room: ${roomCode} (inactive for ${Math.round(inactiveTime/60000)} minutes)`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Room cleanup error:', error);
        }
    }, 60000); // ทุก 1 นาที
}

// Room Code Input Formatting
function setupRoomCodeInput() {
    const roomCodeInput = document.getElementById('roomCodeInput');
    if (roomCodeInput) {
        roomCodeInput.addEventListener('input', function(e) {
            this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });
        
        roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const joinBtn = document.getElementById('joinRoomSubmit');
                if (joinBtn) joinBtn.click();
            }
        });
    }
}

// Close modal on outside click
function setupModalCloseOnOutsideClick() {
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupRoomCodeInput();
        setupModalCloseOnOutsideClick();
    });
} else {
    setupRoomCodeInput();
    setupModalCloseOnOutsideClick();
}

// Export functions for use in other files
if (typeof window !== 'undefined') {
    window.generateRoomCode = generateRoomCode;
    window.createRoom = createRoom;
    window.randomMatch = randomMatch;
    window.joinRoom = joinRoom;
    window.showToast = showToast;
    window.startRoomCleanupSystem = startRoomCleanupSystem;
    window.openRoomTypeModal = openRoomTypeModal;
    window.openJoinRoomModal = openJoinRoomModal;
    window.closeModal = closeModal;
}
