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
function createRoom(type) {
    const code = generateRoomCode();
    closeModal('roomTypeModal');
    showToast(`สร้างห้อง ${type} สำเร็จ! โค้ด: ${code}`, 'success');
    
    // Redirect to room page
    setTimeout(() => {
        window.location.href = `room.html?code=${code}&type=${type}`;
    }, 1500);
}

// Random Match
function randomMatch() {
    const code = generateRoomCode();
    showToast('กำลังจับคู่สุ่มห้องให้คุณ...', 'info');
    
    setTimeout(() => {
        window.location.href = `room.html?code=${code}&type=random`;
    }, 2000);
}

// Join Room
function joinRoom() {
    const input = document.getElementById('roomCodeInput');
    const code = input.value.trim().toUpperCase();
    
    if (code.length === 6) {
        closeModal('joinRoomModal');
        showToast(`กำลังเข้าห้อง ${code}...`, 'info');
        
        setTimeout(() => {
            window.location.href = `room.html?code=${code}&type=join`;
        }, 1500);
    } else {
        showToast('กรุณากรอกโค้ดให้ครบ 6 ตัว', 'error');
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
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(400px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Room Code Input Formatting
const roomCodeInput = document.getElementById('roomCodeInput');
if (roomCodeInput) {
    roomCodeInput.addEventListener('input', function(e) {
        this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    });
    
    roomCodeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') joinRoom();
    });
}

// Close modal on outside click
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});